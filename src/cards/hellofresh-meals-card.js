/**
 * HelloFresh Meals Card
 * Displays meals for current/upcoming week with images and details
 * Includes meal planning: THT dates, drag & drop reordering, persistent storage
 */

import { baseCardStyles, COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../styles/hellofresh-styles.js';
import {
  formatDuration,
  getTagClass,
  truncate,
  fireEvent,
  formatThtDate,
  getThtStatus,
  getDefaultThtDate,
} from '../utils/helpers.js';
import { VERSION, logCardVersion } from '../version.js';
import Sortable from 'sortablejs';

// Simple hash function for consistent meal keys
function hashMealName(name) {
  if (!name) return 'unknown';
  // Use first 15 chars, lowercase, remove spaces
  return name.substring(0, 15).toLowerCase().replace(/\s+/g, '');
}

class HelloFreshMealsCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._editMode = false;
    this._sortableInstance = null;
    this._mealPlanData = null;
    this._datePickerMeal = null;
    this._displayedMeals = [];
  }

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    // Only reload data if storage entity changed
    if (!oldHass || this._storageChanged(oldHass)) {
      this._loadMealPlanData();
    }
    this._updateCard();
  }

  _storageChanged(oldHass) {
    if (!this._config?.storage_entity) return false;
    const oldState = oldHass.states[this._config.storage_entity]?.state;
    const newState = this._hass.states[this._config.storage_entity]?.state;
    return oldState !== newState;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('Please define an entity (sensor.hellofresh_meals_this_week)');
    }
    this._config = {
      entity: config.entity,
      storage_entity: config.storage_entity || null,
      title: config.title || 'Maaltijden deze week',
      show_tags: config.show_tags !== false,
      show_calories: config.show_calories !== false,
      show_prep_time: config.show_prep_time !== false,
      show_tht: config.show_tht !== false,
      auto_sort_tht: config.auto_sort_tht !== false,
      columns: config.columns || 2,
      max_meals: config.max_meals || 0,
      ...config,
    };
    this._loadMealPlanData();
    this._updateCard();
  }

  getCardSize() {
    return 4;
  }

  connectedCallback() {
    this._updateCard();
  }

  disconnectedCallback() {
    if (this._sortableInstance) {
      this._sortableInstance.destroy();
      this._sortableInstance = null;
    }
  }

  _loadMealPlanData() {
    if (!this._hass || !this._config?.storage_entity) {
      this._mealPlanData = null;
      return;
    }

    const storageEntity = this._hass.states[this._config.storage_entity];
    if (!storageEntity || !storageEntity.state || storageEntity.state === 'unknown' || storageEntity.state === '') {
      this._mealPlanData = null;
      return;
    }

    try {
      const data = JSON.parse(storageEntity.state);
      const currentWeek = this._getCurrentWeekFromSensor();

      // Check week - support both formats
      const storedWeek = data.w || data.week;
      if (storedWeek !== currentWeek) {
        console.log(`[HF] Week changed: ${storedWeek} -> ${currentWeek}, resetting data`);
        this._mealPlanData = null;
        return;
      }

      // Normalize to internal format
      this._mealPlanData = {
        week: storedWeek,
        manual: data.x === 1 || data.manual === true,
        meals: {},
      };

      // Load meals - support both formats
      const mealsData = data.m || data.meals || {};
      for (const [key, value] of Object.entries(mealsData)) {
        this._mealPlanData.meals[key] = {
          tht: value.t || value.tht || null,
          order: value.o ?? value.order ?? null,
        };
      }

      console.log('[HF] Loaded meal plan:', this._mealPlanData);
    } catch (e) {
      console.warn('[HF] Failed to parse meal plan data:', e);
      this._mealPlanData = null;
    }
  }

  async _saveMealPlanData() {
    if (!this._hass || !this._config?.storage_entity || !this._mealPlanData) return;

    try {
      // Always save in compact format to stay under 255 chars
      const compact = {
        w: this._mealPlanData.week,
        x: this._mealPlanData.manual ? 1 : 0,
        m: {},
      };

      for (const [key, value] of Object.entries(this._mealPlanData.meals || {})) {
        // Only save if there's actual data
        if (value.tht || value.order !== null) {
          compact.m[key] = {};
          if (value.tht) compact.m[key].t = value.tht;
          if (value.order !== null) compact.m[key].o = value.order;
        }
      }

      const jsonData = JSON.stringify(compact);
      console.log('[HF] Saving meal plan:', jsonData, `(${jsonData.length} chars)`);

      if (jsonData.length > 255) {
        console.error('[HF] Data exceeds 255 characters!');
        return;
      }

      await this._hass.callService('input_text', 'set_value', {
        entity_id: this._config.storage_entity,
        value: jsonData,
      });
    } catch (e) {
      console.error('[HF] Failed to save meal plan data:', e);
    }
  }

  _getCurrentWeekFromSensor() {
    if (!this._hass || !this._config?.entity) return this._getIsoWeek();
    const entity = this._hass.states[this._config.entity];
    return entity?.attributes?.week || this._getIsoWeek();
  }

  _getIsoWeek() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    const weekNum = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
  }

  _getMergedMeals() {
    if (!this._hass || !this._config?.entity) return [];

    const entity = this._hass.states[this._config.entity];
    if (!entity) return [];

    const rawMeals = entity.attributes?.meals || [];
    const mealData = this._mealPlanData?.meals || {};

    return rawMeals.map((meal, index) => {
      const key = hashMealName(meal.name);
      const planData = mealData[key] || {};

      return {
        ...meal,
        _key: key,
        _tht: planData.tht || null,
        _order: planData.order ?? null,
        _originalIndex: index,
      };
    });
  }

  _sortMeals(meals) {
    // If manual ordering is active, sort by stored order values
    if (this._mealPlanData?.manual) {
      return [...meals].sort((a, b) => {
        const orderA = a._order ?? 999;
        const orderB = b._order ?? 999;
        if (orderA !== orderB) return orderA - orderB;
        return a._originalIndex - b._originalIndex;
      });
    }

    // Auto-sort by THT if enabled (ascending, nulls at end)
    if (this._config?.auto_sort_tht) {
      return [...meals].sort((a, b) => {
        if (a._tht && b._tht) {
          return new Date(a._tht) - new Date(b._tht);
        }
        if (a._tht && !b._tht) return -1;
        if (!a._tht && b._tht) return 1;
        return a._originalIndex - b._originalIndex;
      });
    }

    return meals;
  }

  _updateCard() {
    if (!this._hass || !this._config || !this.shadowRoot) return;

    const entity = this._hass.states[this._config.entity];
    if (!entity) {
      this._renderError('Entity niet gevonden');
      return;
    }

    const week = entity.attributes?.week || '';
    const rawMeals = this._getMergedMeals();
    const meals = this._sortMeals(rawMeals);
    const mealCount = parseInt(entity.state) || meals.length;

    const displayMeals = this._config.max_meals > 0
      ? meals.slice(0, this._config.max_meals)
      : meals;

    // Store for drag & drop reference
    this._displayedMeals = displayMeals;

    const hasStorageEntity = !!this._config.storage_entity;
    const isManualOrder = this._mealPlanData?.manual;

    this.shadowRoot.innerHTML = `
      <style>
        ${baseCardStyles}
        ${this._getCardStyles()}
      </style>

      <div class="card ${this._editMode ? 'edit-mode' : ''}">
        <div class="card-header">
          <div class="header-icon">
            ${this._getChefIcon()}
          </div>
          <div class="header-content">
            <h2 class="title">${this._config.title}</h2>
            <span class="subtitle">${week} • ${mealCount} gerechten</span>
          </div>
          ${hasStorageEntity ? `
            <button class="edit-btn ${this._editMode ? 'edit-btn--active' : ''}" title="${this._editMode ? 'Klaar' : 'Bewerken'}">
              ${this._editMode ? this._getCheckIcon() : this._getEditIcon()}
            </button>
          ` : ''}
        </div>

        <div class="card-content">
          ${displayMeals.length > 0 ? `
            <div class="meals-grid" style="--columns: ${this._config.columns}">
              ${displayMeals.map((meal, index) => this._renderMealCard(meal, index)).join('')}
            </div>
            ${this._editMode && isManualOrder ? `
              <button class="reset-order-btn">
                ${this._getRefreshIcon()}
                Reset volgorde (sorteer op THT)
              </button>
            ` : ''}
          ` : `
            <div class="empty-state">
              <div class="empty-icon">${this._getEmptyIcon()}</div>
              <p>Geen maaltijden gevonden voor deze week</p>
            </div>
          `}
        </div>
      </div>

      ${this._datePickerMeal ? this._renderDatePicker() : ''}
    `;

    this._attachEventListeners(displayMeals);
    this._initSortable();
  }

  _renderDatePicker() {
    const meal = this._datePickerMeal;
    const defaultDate = meal._tht || getDefaultThtDate();

    // Parse date for Dutch display
    const [year, month, day] = defaultDate.split('-');
    const displayDate = `${day}-${month}-${year}`;

    return `
      <div class="date-picker-overlay">
        <div class="date-picker-modal">
          <h3>THT datum</h3>
          <p class="date-picker-meal-name">${meal.name}</p>
          <input type="date" id="tht-date-input" value="${defaultDate}" />
          <p class="date-display">${displayDate}</p>
          <div class="btn-group">
            ${meal._tht ? `<button class="btn-clear">Wissen</button>` : ''}
            <button class="btn-cancel">Annuleren</button>
            <button class="btn-save">Opslaan</button>
          </div>
        </div>
      </div>
    `;
  }

  _attachEventListeners(meals) {
    // Edit button
    const editBtn = this.shadowRoot.querySelector('.edit-btn');
    if (editBtn) {
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._toggleEditMode();
      });
    }

    // Meal cards
    this.shadowRoot.querySelectorAll('.meal-card').forEach((card, index) => {
      card.addEventListener('click', (e) => {
        if (this._editMode) {
          // In edit mode, clicking opens date picker
          if (!e.target.closest('.drag-handle')) {
            this._openDatePicker(meals[index]);
          }
        } else {
          this._handleMealClick(meals[index]);
        }
      });
    });

    // Reset order button
    const resetBtn = this.shadowRoot.querySelector('.reset-order-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this._resetManualOrder());
    }

    // Date picker events
    const overlay = this.shadowRoot.querySelector('.date-picker-overlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this._closeDatePicker();
        }
      });

      const cancelBtn = overlay.querySelector('.btn-cancel');
      const saveBtn = overlay.querySelector('.btn-save');
      const clearBtn = overlay.querySelector('.btn-clear');
      const dateInput = overlay.querySelector('#tht-date-input');
      const dateDisplay = overlay.querySelector('.date-display');

      // Update display when date changes
      dateInput?.addEventListener('change', () => {
        const [y, m, d] = dateInput.value.split('-');
        dateDisplay.textContent = `${d}-${m}-${y}`;
      });

      cancelBtn?.addEventListener('click', () => this._closeDatePicker());
      saveBtn?.addEventListener('click', () => {
        this._saveThtDate(this._datePickerMeal, dateInput.value);
        this._closeDatePicker();
      });
      clearBtn?.addEventListener('click', () => {
        this._saveThtDate(this._datePickerMeal, null);
        this._closeDatePicker();
      });
    }
  }

  _initSortable() {
    if (this._sortableInstance) {
      this._sortableInstance.destroy();
      this._sortableInstance = null;
    }

    if (!this._editMode) return;

    const grid = this.shadowRoot.querySelector('.meals-grid');
    if (!grid) return;

    this._sortableInstance = new Sortable(grid, {
      animation: 150,
      handle: '.drag-handle',
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      onEnd: (evt) => {
        this._handleReorder(evt.oldIndex, evt.newIndex);
      },
    });
  }

  _toggleEditMode() {
    this._editMode = !this._editMode;
    this._updateCard();
  }

  _openDatePicker(meal) {
    this._datePickerMeal = meal;
    this._updateCard();
  }

  _closeDatePicker() {
    this._datePickerMeal = null;
    this._updateCard();
  }

  async _saveThtDate(meal, date) {
    const key = meal._key;
    const currentWeek = this._getCurrentWeekFromSensor();

    console.log(`[HF] Saving THT for "${meal.name}" (key: ${key}): ${date}`);

    if (!this._mealPlanData) {
      this._mealPlanData = {
        week: currentWeek,
        meals: {},
        manual: false,
      };
    }

    if (!this._mealPlanData.meals[key]) {
      this._mealPlanData.meals[key] = {};
    }

    if (date) {
      this._mealPlanData.meals[key].tht = date;
    } else {
      delete this._mealPlanData.meals[key].tht;
      // Clean up empty entries
      if (!this._mealPlanData.meals[key].tht && this._mealPlanData.meals[key].order === null) {
        delete this._mealPlanData.meals[key];
      }
    }

    await this._saveMealPlanData();
    this._updateCard();
  }

  async _handleReorder(oldIndex, newIndex) {
    if (oldIndex === newIndex) return;

    const currentWeek = this._getCurrentWeekFromSensor();

    if (!this._mealPlanData) {
      this._mealPlanData = {
        week: currentWeek,
        meals: {},
        manual: false,
      };
    }

    // Mark as manual ordering
    this._mealPlanData.manual = true;

    // Use the currently displayed meals (sorted order) for reordering
    const reorderedMeals = [...this._displayedMeals];
    const [moved] = reorderedMeals.splice(oldIndex, 1);
    reorderedMeals.splice(newIndex, 0, moved);

    // Update order values based on new positions, preserve THT
    reorderedMeals.forEach((meal, index) => {
      const key = meal._key;
      if (!this._mealPlanData.meals[key]) {
        this._mealPlanData.meals[key] = {};
      }
      // Preserve existing THT
      if (meal._tht) {
        this._mealPlanData.meals[key].tht = meal._tht;
      }
      this._mealPlanData.meals[key].order = index;
    });

    console.log('[HF] Reordered:', this._mealPlanData);
    await this._saveMealPlanData();
    this._updateCard();
  }

  async _resetManualOrder() {
    if (!this._mealPlanData) return;

    this._mealPlanData.manual = false;

    // Clear order values but keep THT
    for (const key of Object.keys(this._mealPlanData.meals || {})) {
      delete this._mealPlanData.meals[key].order;
    }

    await this._saveMealPlanData();
    this._updateCard();
  }

  _getCardStyles() {
    return `
      .card {
        background: var(--hf-background);
        border-radius: ${BORDERS.radiusLg};
        box-shadow: ${SHADOWS.md};
        overflow: hidden;
      }

      .card-header {
        display: flex;
        align-items: center;
        gap: ${SPACING.md};
        padding: ${SPACING.lg};
        background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%);
        color: ${COLORS.white};
      }

      .header-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
      }

      .header-icon svg {
        width: 24px;
        height: 24px;
        fill: currentColor;
      }

      .header-content {
        flex: 1;
      }

      .header-content .title {
        font-size: ${FONTS.sizeLg};
        font-weight: ${FONTS.weightSemibold};
        margin: 0;
        color: ${COLORS.white} !important;
      }

      .header-content .subtitle {
        font-size: ${FONTS.sizeSm};
        opacity: 0.9;
      }

      .card-content {
        padding: ${SPACING.lg};
      }

      .meals-grid {
        display: grid;
        grid-template-columns: repeat(var(--columns, 2), 1fr);
        gap: ${SPACING.md};
      }

      @media (max-width: 500px) {
        .meals-grid {
          grid-template-columns: 1fr;
        }
      }

      .meal-card {
        position: relative;
        background: ${COLORS.white};
        border-radius: ${BORDERS.radius};
        overflow: hidden;
        box-shadow: ${SHADOWS.sm};
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        border: 1px solid ${COLORS.border};
      }

      .meal-card:hover {
        transform: translateY(-2px);
        box-shadow: ${SHADOWS.md};
      }

      .edit-mode .meal-card {
        border: 2px dashed ${COLORS.primary};
      }

      .meal-image-container {
        position: relative;
        width: 100%;
        aspect-ratio: 16/9;
      }

      .meal-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        background: ${COLORS.background};
      }

      .meal-image-placeholder {
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, ${COLORS.background} 0%, ${COLORS.border} 100%);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .meal-image-placeholder svg {
        width: 48px;
        height: 48px;
        fill: ${COLORS.textMuted};
      }

      .meal-info {
        padding: ${SPACING.md};
      }

      .meal-name {
        font-size: ${FONTS.sizeMd};
        font-weight: ${FONTS.weightSemibold};
        color: ${COLORS.textPrimary};
        margin: 0 0 ${SPACING.xs} 0;
        line-height: 1.3;
      }

      .meal-headline {
        font-size: ${FONTS.sizeSm};
        color: ${COLORS.textSecondary};
        margin: 0 0 ${SPACING.sm} 0;
        line-height: 1.4;
      }

      .meal-meta {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: ${SPACING.sm};
        margin-bottom: ${SPACING.sm};
      }

      .meta-item {
        display: inline-flex;
        align-items: center;
        gap: ${SPACING.xs};
        font-size: ${FONTS.sizeXs};
        color: ${COLORS.textSecondary};
      }

      .meta-item svg {
        width: 14px;
        height: 14px;
        fill: currentColor;
      }

      .meal-tags {
        display: flex;
        flex-wrap: wrap;
        gap: ${SPACING.xs};
      }

      .tag {
        padding: 2px ${SPACING.sm};
        border-radius: ${BORDERS.radiusPill};
        font-size: ${FONTS.sizeXs};
        font-weight: ${FONTS.weightMedium};
        background: ${COLORS.tagCalorie};
        color: ${COLORS.primary};
      }

      .tag--family {
        background: ${COLORS.tagFamily};
        color: #E65100;
      }

      .tag--premium {
        background: ${COLORS.tagPremium};
        color: #F57C00;
      }

      .tag--veggie {
        background: ${COLORS.tagVeggie};
        color: ${COLORS.primary};
      }

      .empty-state {
        text-align: center;
        padding: ${SPACING.xxl};
        color: ${COLORS.textSecondary};
      }

      .empty-icon svg {
        width: 64px;
        height: 64px;
        fill: ${COLORS.border};
        margin-bottom: ${SPACING.md};
      }

      .empty-state p {
        margin: 0;
        font-size: ${FONTS.sizeMd};
      }

      /* Date picker improvements */
      .date-picker-meal-name {
        margin: 0 0 16px 0;
        font-size: 14px;
        color: ${COLORS.textSecondary};
        font-weight: 500;
      }

      .date-display {
        text-align: center;
        font-size: 18px;
        font-weight: 600;
        color: ${COLORS.primary};
        margin: 0 0 16px 0;
      }
    `;
  }

  _renderMealCard(meal, index) {
    const tags = (meal.tags || []).slice(0, 3);
    const showImage = meal.image_url;
    const thtStatus = meal._tht ? getThtStatus(meal._tht) : null;
    const showTht = this._config.show_tht && meal._tht;

    return `
      <div class="meal-card" data-index="${index}" data-key="${meal._key}">
        ${this._editMode ? `
          <div class="drag-handle">
            ${this._getDragIcon()}
          </div>
        ` : ''}
        <div class="meal-image-container">
          ${showImage ? `
            <img class="meal-image" src="${meal.image_url}" alt="${meal.name}" loading="lazy" />
          ` : `
            <div class="meal-image-placeholder">
              ${this._getPlateIcon()}
            </div>
          `}
          ${showTht ? `
            <span class="tht-badge tht-badge--${thtStatus}">
              ${this._getCalendarIcon()}
              THT ${formatThtDate(meal._tht)}
            </span>
          ` : ''}
        </div>
        <div class="meal-info">
          <h3 class="meal-name">${truncate(meal.name, 45)}</h3>
          ${meal.headline ? `<p class="meal-headline">${truncate(meal.headline, 60)}</p>` : ''}

          <div class="meal-meta">
            ${this._config.show_prep_time && meal.prep_time_minutes ? `
              <span class="meta-item">
                ${this._getClockIcon()}
                ${formatDuration(meal.prep_time_minutes)}
              </span>
            ` : ''}
            ${this._config.show_calories && meal.calories ? `
              <span class="meta-item">
                ${this._getFireIcon()}
                ${meal.calories} kcal
              </span>
            ` : ''}
          </div>

          ${this._config.show_tags && tags.length > 0 ? `
            <div class="meal-tags">
              ${tags.map(tag => `
                <span class="tag ${getTagClass(tag)}">${tag}</span>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  _handleMealClick(meal) {
    if (meal.recipe_url) {
      window.open(meal.recipe_url, '_blank');
    } else {
      fireEvent(this, 'hass-more-info', {
        entityId: this._config.entity,
      });
    }
  }

  _getChefIcon() {
    return `<svg viewBox="0 0 24 24"><path d="M12.5 1.5c-1.77 0-3.33 1.17-3.83 2.87C8.14 4.13 7.58 4 7 4c-2.21 0-4 1.79-4 4 0 1.48.81 2.75 2 3.45V19c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-7.55c1.19-.7 2-1.97 2-3.45 0-2.21-1.79-4-4-4-.58 0-1.14.13-1.67.37-.5-1.7-2.06-2.87-3.83-2.87zM7 19v-6h10v6H7z"/></svg>`;
  }

  _getClockIcon() {
    return `<svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>`;
  }

  _getFireIcon() {
    return `<svg viewBox="0 0 24 24"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/></svg>`;
  }

  _getPlateIcon() {
    return `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/></svg>`;
  }

  _getEmptyIcon() {
    return `<svg viewBox="0 0 24 24"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>`;
  }

  _getEditIcon() {
    return `<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`;
  }

  _getCheckIcon() {
    return `<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
  }

  _getDragIcon() {
    return `<svg viewBox="0 0 24 24"><path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>`;
  }

  _getCalendarIcon() {
    return `<svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/></svg>`;
  }

  _getRefreshIcon() {
    return `<svg viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>`;
  }

  _renderError(message) {
    this.shadowRoot.innerHTML = `
      <style>${baseCardStyles}</style>
      <div class="card">
        <div class="card-content" style="text-align: center; color: ${COLORS.error};">
          ${message}
        </div>
      </div>
    `;
  }

  static getConfigElement() {
    return document.createElement('hellofresh-meals-card-editor');
  }

  static getStubConfig() {
    return {
      entity: 'sensor.hellofresh_meals_this_week',
      storage_entity: 'input_text.hellofresh_meal_planning',
      title: 'Maaltijden deze week',
      show_tags: true,
      show_calories: true,
      show_prep_time: true,
      show_tht: true,
      auto_sort_tht: true,
      columns: 2,
    };
  }
}

// Card Editor
class HelloFreshMealsCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _render() {
    if (!this._config) return;
    this.innerHTML = `
      <div style="padding: 16px;">
        <p>Entity: ${this._config.entity || 'niet ingesteld'}</p>
        <p>Storage entity: ${this._config.storage_entity || 'niet ingesteld'}</p>
        <p>Show THT: ${this._config.show_tht !== false ? 'Ja' : 'Nee'}</p>
        <p>Auto-sort THT: ${this._config.auto_sort_tht !== false ? 'Ja' : 'Nee'}</p>
      </div>
    `;
  }
}

customElements.define('hellofresh-meals-card', HelloFreshMealsCard);
customElements.define('hellofresh-meals-card-editor', HelloFreshMealsCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'hellofresh-meals-card',
  name: 'HelloFresh Meals Card',
  description: 'Toon je HelloFresh maaltijden voor deze week met THT planning',
  preview: true,
  documentationURL: 'https://github.com/jowinwaaijer/hellofresh-cards',
});

logCardVersion('HELLOFRESH-MEALS-CARD');
