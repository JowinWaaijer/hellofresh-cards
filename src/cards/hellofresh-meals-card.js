/**
 * HelloFresh Meals Card
 * Displays meals for current/upcoming week with images and details
 */

import { baseCardStyles, COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../styles/hellofresh-styles.js';
import { formatDuration, getTagClass, truncate, fireEvent } from '../utils/helpers.js';
import { VERSION, logCardVersion } from '../version.js';

class HelloFreshMealsCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  set hass(hass) {
    this._hass = hass;
    this._updateCard();
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('Please define an entity (sensor.hellofresh_meals_this_week)');
    }
    this._config = {
      entity: config.entity,
      title: config.title || 'Maaltijden deze week',
      show_tags: config.show_tags !== false,
      show_calories: config.show_calories !== false,
      show_prep_time: config.show_prep_time !== false,
      columns: config.columns || 2,
      max_meals: config.max_meals || 0, // 0 = show all
      ...config,
    };
    this._updateCard();
  }

  getCardSize() {
    return 4;
  }

  connectedCallback() {
    this._updateCard();
  }

  _updateCard() {
    if (!this._hass || !this._config || !this.shadowRoot) return;

    const entity = this._hass.states[this._config.entity];
    if (!entity) {
      this._renderError('Entity niet gevonden');
      return;
    }

    const meals = entity.attributes?.meals || [];
    const week = entity.attributes?.week || '';
    const mealCount = parseInt(entity.state) || meals.length;

    const displayMeals = this._config.max_meals > 0
      ? meals.slice(0, this._config.max_meals)
      : meals;

    this.shadowRoot.innerHTML = `
      <style>
        ${baseCardStyles}
        ${this._getCardStyles()}
      </style>

      <div class="card">
        <div class="card-header">
          <div class="header-icon">
            ${this._getChefIcon()}
          </div>
          <div class="header-content">
            <h2 class="title">${this._config.title}</h2>
            <span class="subtitle">${week} • ${mealCount} gerechten</span>
          </div>
        </div>

        <div class="card-content">
          ${displayMeals.length > 0 ? `
            <div class="meals-grid" style="--columns: ${this._config.columns}">
              ${displayMeals.map((meal, index) => this._renderMealCard(meal, index)).join('')}
            </div>
          ` : `
            <div class="empty-state">
              <div class="empty-icon">${this._getEmptyIcon()}</div>
              <p>Geen maaltijden gevonden voor deze week</p>
            </div>
          `}
        </div>
      </div>
    `;

    // Attach click handlers to meal cards
    this.shadowRoot.querySelectorAll('.meal-card').forEach((card, index) => {
      card.addEventListener('click', () => this._handleMealClick(displayMeals[index]));
    });
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

      .meal-image {
        width: 100%;
        aspect-ratio: 16/9;
        object-fit: cover;
        background: ${COLORS.background};
      }

      .meal-image-placeholder {
        width: 100%;
        aspect-ratio: 16/9;
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
    `;
  }

  _renderMealCard(meal, index) {
    const tags = (meal.tags || []).slice(0, 3);
    const showImage = meal.image_url;

    return `
      <div class="meal-card" data-index="${index}">
        ${showImage ? `
          <img class="meal-image" src="${meal.image_url}" alt="${meal.name}" loading="lazy" />
        ` : `
          <div class="meal-image-placeholder">
            ${this._getPlateIcon()}
          </div>
        `}
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
    // Open recipe URL if available, otherwise show more info
    if (meal.recipe_url) {
      window.open(meal.recipe_url, '_blank');
    } else {
      fireEvent(this, 'hass-more-info', {
        entityId: this._config.entity,
      });
    }
  }

  _getChefIcon() {
    return `<svg viewBox="0 0 24 24"><path d="M12 3C10.73 3 9.6 3.8 9.18 5H6c-1.1 0-2 .9-2 2v1c0 1.1.9 2 2 2h.09c-.06.33-.09.66-.09 1v1c0 3.87 3.13 7 7 7s7-3.13 7-7v-1c0-.34-.03-.67-.09-1H18c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-3.18C14.4 3.8 13.27 3 12 3zm0 2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM6 7h2v1H6V7zm10 0h2v1h-2V7zm-8 3h8v1c0 2.76-2.24 5-5 5s-5-2.24-5-5v-1h2zm4 2c-.55 0-1 .45-1 1v1h2v-1c0-.55-.45-1-1-1z"/></svg>`;
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
      title: 'Maaltijden deze week',
      show_tags: true,
      show_calories: true,
      show_prep_time: true,
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
  description: 'Toon je HelloFresh maaltijden voor deze week',
  preview: true,
  documentationURL: 'https://github.com/jowinwaaijer/hellofresh-cards',
});

logCardVersion('HELLOFRESH-MEALS-CARD');
