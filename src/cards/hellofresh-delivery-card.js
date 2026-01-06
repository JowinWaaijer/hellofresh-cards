/**
 * HelloFresh Delivery Tracking Card
 * A compact pill-shaped card showing delivery status and tracking info
 */

import { baseCardStyles, COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../styles/hellofresh-styles.js';
import { formatDateTime, formatTimeUntil, getStatusClass, getStatusLabel, isInTransit, fireEvent } from '../utils/helpers.js';
import { VERSION, logCardVersion } from '../version.js';

class HelloFreshDeliveryCard extends HTMLElement {
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
      throw new Error('Please define an entity (sensor.hellofresh_next_delivery)');
    }
    this._config = {
      entity: config.entity,
      show_tracking_button: config.show_tracking_button !== false,
      show_time_remaining: config.show_time_remaining !== false,
      compact: config.compact || false,
      ...config,
    };
    this._updateCard();
  }

  getCardSize() {
    return this._config?.compact ? 1 : 2;
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

    const attrs = entity.attributes;
    const status = attrs.status || 'SCHEDULED';
    const subStatus = attrs.sub_status;
    const deliverySlot = attrs.delivery_slot || '';
    const trackingUrl = attrs.tracking_url;
    const estimatedDelivery = attrs.estimated_delivery;
    const product = attrs.product || '';
    const week = attrs.week || '';
    const deliveryDate = entity.state; // The state contains the delivery datetime

    // Determine if package is in transit (DELIVERED status but no sub_status and delivery date is today/future)
    const inTransit = isInTransit(status, subStatus, deliveryDate);
    // Determine actual display status
    const isActuallyDelivered = status === 'DELIVERED' && !inTransit;

    this.shadowRoot.innerHTML = `
      <style>
        ${baseCardStyles}

        .delivery-pill {
          display: flex;
          align-items: center;
          gap: ${SPACING.md};
          padding: ${this._config.compact ? SPACING.sm : SPACING.md} ${SPACING.lg};
          background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%);
          border-radius: ${BORDERS.radiusPill};
          box-shadow: ${SHADOWS.md};
          color: ${COLORS.white};
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .delivery-pill:hover {
          transform: translateY(-1px);
          box-shadow: ${SHADOWS.lg};
        }

        .delivery-pill:active {
          transform: translateY(0);
        }

        .icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${this._config.compact ? '32px' : '40px'};
          height: ${this._config.compact ? '32px' : '40px'};
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          flex-shrink: 0;
        }

        .icon-container svg {
          width: ${this._config.compact ? '18px' : '22px'};
          height: ${this._config.compact ? '18px' : '22px'};
          fill: currentColor;
        }

        .content {
          flex: 1;
          min-width: 0;
        }

        .title {
          font-size: ${this._config.compact ? FONTS.sizeSm : FONTS.sizeMd};
          font-weight: ${FONTS.weightSemibold};
          margin-bottom: ${this._config.compact ? '0' : '2px'};
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .subtitle {
          display: ${this._config.compact ? 'none' : 'block'};
          font-size: ${FONTS.sizeSm};
          opacity: 0.9;
        }

        .time-badge {
          display: flex;
          align-items: center;
          gap: ${SPACING.xs};
          padding: ${SPACING.xs} ${SPACING.sm};
          background: rgba(255, 255, 255, 0.2);
          border-radius: ${BORDERS.radiusPill};
          font-size: ${FONTS.sizeXs};
          font-weight: ${FONTS.weightMedium};
          white-space: nowrap;
        }

        .tracking-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: ${COLORS.white};
          border-radius: 50%;
          color: ${COLORS.primary};
          border: none;
          cursor: pointer;
          transition: transform 0.2s ease;
          flex-shrink: 0;
        }

        .tracking-btn:hover {
          transform: scale(1.1);
        }

        .tracking-btn svg {
          width: 16px;
          height: 16px;
          fill: currentColor;
        }

        .status-delivered {
          background: linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%);
        }

        .status-in-transit {
          background: linear-gradient(135deg, #F57C00 0%, #E65100 100%);
        }

        .status-paused {
          background: linear-gradient(135deg, #757575 0%, #616161 100%);
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${COLORS.primaryLight};
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .error {
          padding: ${SPACING.md};
          background: ${COLORS.backgroundCard};
          border-radius: ${BORDERS.radiusLg};
          color: ${COLORS.error};
          text-align: center;
          font-size: ${FONTS.sizeSm};
        }
      </style>

      <div class="delivery-pill ${isActuallyDelivered ? 'status-delivered' : ''} ${inTransit ? 'status-in-transit' : ''} ${status === 'PAUSED' ? 'status-paused' : ''}"
           @click="${this._handleClick.bind(this)}">
        <div class="icon-container">
          ${this._getStatusIcon(status, inTransit)}
        </div>

        <div class="content">
          <div class="title">
            ${inTransit ? 'Onderweg' : (isActuallyDelivered ? getStatusLabel(status, subStatus, deliveryDate) : deliverySlot || 'Levering gepland')}
          </div>
          <div class="subtitle">
            ${inTransit
              ? (estimatedDelivery ? formatDateTime(estimatedDelivery) : deliverySlot)
              : (isActuallyDelivered
                ? product
                : (estimatedDelivery ? formatDateTime(estimatedDelivery) : week))}
          </div>
        </div>

        ${this._config.show_time_remaining && (status === 'SCHEDULED' || inTransit) ? `
          <div class="time-badge">
            <span class="status-indicator"></span>
            ${formatTimeUntil(entity.state)}
          </div>
        ` : ''}

        ${this._config.show_tracking_button && trackingUrl ? `
          <button class="tracking-btn" @click="${this._openTracking.bind(this)}" title="Open tracking">
            <svg viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </button>
        ` : ''}
      </div>
    `;

    // Attach event listeners
    this.shadowRoot.querySelector('.delivery-pill')?.addEventListener('click', () => this._handleClick());
    this.shadowRoot.querySelector('.tracking-btn')?.addEventListener('click', (e) => this._openTracking(e));
  }

  _getStatusIcon(status, inTransit = false) {
    // In transit = show truck icon
    if (inTransit) {
      return `<svg viewBox="0 0 24 24"><path d="M18 18.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm1.5-9H17V12h4.46L19.5 9.5zM6 18.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM20 8l3 4v5h-2c0 1.66-1.34 3-3 3s-3-1.34-3-3H9c0 1.66-1.34 3-3 3s-3-1.34-3-3H1V6c0-1.11.89-2 2-2h14v4h3zM3 6v9h.76c.55-.61 1.35-1 2.24-1s1.69.39 2.24 1H15V6H3z"/></svg>`;
    }
    if (status === 'DELIVERED') {
      return `<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
    }
    if (status === 'PAUSED') {
      return `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
    }
    // Delivery truck icon for scheduled
    return `<svg viewBox="0 0 24 24"><path d="M18 18.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm1.5-9H17V12h4.46L19.5 9.5zM6 18.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM20 8l3 4v5h-2c0 1.66-1.34 3-3 3s-3-1.34-3-3H9c0 1.66-1.34 3-3 3s-3-1.34-3-3H1V6c0-1.11.89-2 2-2h14v4h3zM3 6v9h.76c.55-.61 1.35-1 2.24-1s1.69.39 2.24 1H15V6H3z"/></svg>`;
  }

  _handleClick() {
    fireEvent(this, 'hass-more-info', {
      entityId: this._config.entity,
    });
  }

  _openTracking(e) {
    e.stopPropagation();
    const entity = this._hass.states[this._config.entity];
    const trackingUrl = entity?.attributes?.tracking_url;
    if (trackingUrl) {
      window.open(trackingUrl, '_blank');
    }
  }

  _renderError(message) {
    this.shadowRoot.innerHTML = `
      <style>${baseCardStyles}</style>
      <div class="error">${message}</div>
    `;
  }

  static getConfigElement() {
    return document.createElement('hellofresh-delivery-card-editor');
  }

  static getStubConfig() {
    return {
      entity: 'sensor.hellofresh_next_delivery',
      show_tracking_button: true,
      show_time_remaining: true,
      compact: false,
    };
  }
}

// Card Editor
class HelloFreshDeliveryCardEditor extends HTMLElement {
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

customElements.define('hellofresh-delivery-card', HelloFreshDeliveryCard);
customElements.define('hellofresh-delivery-card-editor', HelloFreshDeliveryCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'hellofresh-delivery-card',
  name: 'HelloFresh Delivery Card',
  description: 'Compacte pill-weergave van je HelloFresh levering met tracking',
  preview: true,
  documentationURL: 'https://github.com/jowinwaaijer/hellofresh-cards',
});

logCardVersion('HELLOFRESH-DELIVERY-CARD');
