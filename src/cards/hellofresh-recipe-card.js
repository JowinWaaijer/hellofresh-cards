/**
 * HelloFresh Recipe Card
 * Shows a single recipe with details and link to full recipe
 * Note: Recipe steps are not yet available via the API - see enhancement request
 */

import { baseCardStyles, COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../styles/hellofresh-styles.js';
import { formatDuration, getTagClass } from '../utils/helpers.js';

const CARD_VERSION = '1.0.0';

class HelloFreshRecipeCard extends HTMLElement {
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
      throw new Error('Please define an entity (sensor.hellofresh_next_meal)');
    }
    this._config = {
      entity: config.entity,
      show_nutrition: config.show_nutrition !== false,
      show_tags: config.show_tags !== false,
      show_recipe_button: config.show_recipe_button !== false,
      ...config,
    };
    this._updateCard();
  }

  getCardSize() {
    return 5;
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

    const name = entity.state;
    const attrs = entity.attributes;

    this.shadowRoot.innerHTML = `
      <style>
        ${baseCardStyles}
        ${this._getCardStyles()}
      </style>

      <div class="card">
        ${attrs.image_url ? `
          <div class="hero-image">
            <img src="${attrs.image_url}" alt="${name}" />
            <div class="hero-overlay">
              <h1 class="hero-title">${name}</h1>
              ${attrs.headline ? `<p class="hero-subtitle">${attrs.headline}</p>` : ''}
            </div>
          </div>
        ` : `
          <div class="card-header-simple">
            <h1 class="title">${name}</h1>
            ${attrs.headline ? `<p class="subtitle">${attrs.headline}</p>` : ''}
          </div>
        `}

        <div class="card-content">
          <div class="meta-row">
            ${attrs.prep_time_minutes ? `
              <div class="meta-item">
                ${this._getClockIcon()}
                <div class="meta-content">
                  <span class="meta-label">Bereidingstijd</span>
                  <span class="meta-value">${formatDuration(attrs.prep_time_minutes)}</span>
                </div>
              </div>
            ` : ''}
            ${attrs.total_time_minutes ? `
              <div class="meta-item">
                ${this._getTimerIcon()}
                <div class="meta-content">
                  <span class="meta-label">Totale tijd</span>
                  <span class="meta-value">${formatDuration(attrs.total_time_minutes)}</span>
                </div>
              </div>
            ` : ''}
          </div>

          ${this._config.show_tags && attrs.tags?.length > 0 ? `
            <div class="tags-row">
              ${attrs.tags.map(tag => `
                <span class="tag ${getTagClass(tag)}">${tag}</span>
              `).join('')}
            </div>
          ` : ''}

          ${attrs.cuisines?.length > 0 ? `
            <div class="cuisine-row">
              ${this._getGlobeIcon()}
              <span>${attrs.cuisines.join(', ')}</span>
            </div>
          ` : ''}

          ${this._config.show_nutrition ? `
            <div class="nutrition-section">
              <h3 class="section-title">Voedingswaarden per portie</h3>
              <div class="nutrition-grid">
                ${attrs.calories ? `
                  <div class="nutrition-item">
                    <span class="nutrition-value">${attrs.calories}</span>
                    <span class="nutrition-label">kcal</span>
                  </div>
                ` : ''}
                ${attrs.protein ? `
                  <div class="nutrition-item">
                    <span class="nutrition-value">${attrs.protein}</span>
                    <span class="nutrition-label">eiwit</span>
                  </div>
                ` : ''}
                ${attrs.carbohydrate ? `
                  <div class="nutrition-item">
                    <span class="nutrition-value">${attrs.carbohydrate}</span>
                    <span class="nutrition-label">koolh.</span>
                  </div>
                ` : ''}
                ${attrs.fat ? `
                  <div class="nutrition-item">
                    <span class="nutrition-value">${attrs.fat}</span>
                    <span class="nutrition-label">vet</span>
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}

          ${attrs.premium_charge ? `
            <div class="premium-badge">
              ${this._getStarIcon()}
              <span>Premium gerecht ${attrs.premium_charge}</span>
            </div>
          ` : ''}

          <div class="steps-placeholder">
            <div class="placeholder-icon">${this._getListIcon()}</div>
            <p class="placeholder-text">Receptstappen zijn nog niet beschikbaar via de API.</p>
            <p class="placeholder-hint">Bekijk het volledige recept op de HelloFresh website.</p>
          </div>

          ${this._config.show_recipe_button && attrs.recipe_url ? `
            <a href="${attrs.recipe_url}" target="_blank" rel="noopener" class="recipe-button">
              ${this._getExternalLinkIcon()}
              <span>Bekijk volledig recept</span>
            </a>
          ` : ''}
        </div>
      </div>
    `;

    // Attach click handler for recipe button
    this.shadowRoot.querySelector('.recipe-button')?.addEventListener('click', (e) => {
      // Let the default link behavior handle this
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

      .hero-image {
        position: relative;
        width: 100%;
        aspect-ratio: 16/9;
        overflow: hidden;
      }

      .hero-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .hero-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: ${SPACING.lg};
        background: linear-gradient(transparent, rgba(0,0,0,0.8));
        color: ${COLORS.white};
      }

      .hero-title {
        font-size: ${FONTS.sizeXl};
        font-weight: ${FONTS.weightBold};
        margin: 0 0 ${SPACING.xs} 0;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
      }

      .hero-subtitle {
        font-size: ${FONTS.sizeMd};
        margin: 0;
        opacity: 0.9;
      }

      .card-header-simple {
        padding: ${SPACING.lg};
        background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%);
        color: ${COLORS.white};
      }

      .card-header-simple .title {
        font-size: ${FONTS.sizeXl};
        font-weight: ${FONTS.weightBold};
        margin: 0 0 ${SPACING.xs} 0;
      }

      .card-header-simple .subtitle {
        font-size: ${FONTS.sizeMd};
        margin: 0;
        opacity: 0.9;
      }

      .card-content {
        padding: ${SPACING.lg};
      }

      .meta-row {
        display: flex;
        gap: ${SPACING.lg};
        margin-bottom: ${SPACING.lg};
        padding-bottom: ${SPACING.lg};
        border-bottom: 1px solid ${COLORS.border};
      }

      .meta-item {
        display: flex;
        align-items: center;
        gap: ${SPACING.sm};
      }

      .meta-item svg {
        width: 24px;
        height: 24px;
        fill: ${COLORS.primary};
      }

      .meta-content {
        display: flex;
        flex-direction: column;
      }

      .meta-label {
        font-size: ${FONTS.sizeXs};
        color: ${COLORS.textSecondary};
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .meta-value {
        font-size: ${FONTS.sizeMd};
        font-weight: ${FONTS.weightSemibold};
        color: ${COLORS.textPrimary};
      }

      .tags-row {
        display: flex;
        flex-wrap: wrap;
        gap: ${SPACING.sm};
        margin-bottom: ${SPACING.md};
      }

      .cuisine-row {
        display: flex;
        align-items: center;
        gap: ${SPACING.sm};
        margin-bottom: ${SPACING.lg};
        color: ${COLORS.textSecondary};
        font-size: ${FONTS.sizeSm};
      }

      .cuisine-row svg {
        width: 16px;
        height: 16px;
        fill: currentColor;
      }

      .section-title {
        font-size: ${FONTS.sizeSm};
        font-weight: ${FONTS.weightSemibold};
        color: ${COLORS.textSecondary};
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 0 0 ${SPACING.md} 0;
      }

      .nutrition-section {
        background: ${COLORS.background};
        border-radius: ${BORDERS.radius};
        padding: ${SPACING.md};
        margin-bottom: ${SPACING.lg};
      }

      .nutrition-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: ${SPACING.md};
      }

      .nutrition-item {
        text-align: center;
      }

      .nutrition-value {
        display: block;
        font-size: ${FONTS.sizeLg};
        font-weight: ${FONTS.weightBold};
        color: ${COLORS.primary};
      }

      .nutrition-label {
        font-size: ${FONTS.sizeXs};
        color: ${COLORS.textSecondary};
        text-transform: uppercase;
      }

      .premium-badge {
        display: inline-flex;
        align-items: center;
        gap: ${SPACING.xs};
        padding: ${SPACING.sm} ${SPACING.md};
        background: ${COLORS.tagPremium};
        color: #F57C00;
        border-radius: ${BORDERS.radiusPill};
        font-size: ${FONTS.sizeSm};
        font-weight: ${FONTS.weightMedium};
        margin-bottom: ${SPACING.lg};
      }

      .premium-badge svg {
        width: 16px;
        height: 16px;
        fill: currentColor;
      }

      .steps-placeholder {
        background: ${COLORS.background};
        border: 2px dashed ${COLORS.border};
        border-radius: ${BORDERS.radius};
        padding: ${SPACING.xl};
        text-align: center;
        margin-bottom: ${SPACING.lg};
      }

      .placeholder-icon svg {
        width: 48px;
        height: 48px;
        fill: ${COLORS.textMuted};
        margin-bottom: ${SPACING.md};
      }

      .placeholder-text {
        font-size: ${FONTS.sizeMd};
        color: ${COLORS.textSecondary};
        margin: 0 0 ${SPACING.xs} 0;
      }

      .placeholder-hint {
        font-size: ${FONTS.sizeSm};
        color: ${COLORS.textMuted};
        margin: 0;
      }

      .recipe-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: ${SPACING.sm};
        width: 100%;
        padding: ${SPACING.md} ${SPACING.lg};
        background: ${COLORS.primary};
        color: ${COLORS.white};
        border: none;
        border-radius: ${BORDERS.radius};
        font-family: inherit;
        font-size: ${FONTS.sizeMd};
        font-weight: ${FONTS.weightSemibold};
        text-decoration: none;
        cursor: pointer;
        transition: background 0.2s ease;
      }

      .recipe-button:hover {
        background: ${COLORS.primaryDark};
      }

      .recipe-button svg {
        width: 18px;
        height: 18px;
        fill: currentColor;
      }
    `;
  }

  _getClockIcon() {
    return `<svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>`;
  }

  _getTimerIcon() {
    return `<svg viewBox="0 0 24 24"><path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>`;
  }

  _getGlobeIcon() {
    return `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`;
  }

  _getStarIcon() {
    return `<svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
  }

  _getListIcon() {
    return `<svg viewBox="0 0 24 24"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>`;
  }

  _getExternalLinkIcon() {
    return `<svg viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>`;
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
    return document.createElement('hellofresh-recipe-card-editor');
  }

  static getStubConfig() {
    return {
      entity: 'sensor.hellofresh_next_meal',
      show_nutrition: true,
      show_tags: true,
      show_recipe_button: true,
    };
  }
}

// Card Editor
class HelloFreshRecipeCardEditor extends HTMLElement {
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

customElements.define('hellofresh-recipe-card', HelloFreshRecipeCard);
customElements.define('hellofresh-recipe-card-editor', HelloFreshRecipeCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'hellofresh-recipe-card',
  name: 'HelloFresh Recipe Card',
  description: 'Toon details van een HelloFresh recept',
  preview: true,
  documentationURL: 'https://github.com/jowinwaaijer/hellofresh-cards',
});

console.info(`%c HELLOFRESH-RECIPE-CARD %c ${CARD_VERSION} `,
  'color: white; background: #067A46; font-weight: bold;',
  'color: #067A46; background: white; font-weight: bold;'
);
