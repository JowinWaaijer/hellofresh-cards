/**
 * Helper utilities for HelloFresh cards
 */

/**
 * Format a date string to a localized format
 * @param {string} dateString - ISO date string
 * @param {string} locale - Locale string (default: nl-NL)
 * @returns {string} Formatted date
 */
export function formatDate(dateString, locale = 'nl-NL') {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/**
 * Format a date to show day and time
 * @param {string} dateString - ISO date string
 * @param {string} locale - Locale string
 * @returns {string} Formatted date with time
 */
export function formatDateTime(dateString, locale = 'nl-NL') {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format time remaining until a date
 * Uses calendar days (midnight to midnight) for intuitive day counting
 * @param {string} dateString - ISO date string
 * @returns {string} Human readable time remaining
 */
export function formatTimeUntil(dateString) {
  if (!dateString) return '';
  const target = new Date(dateString);
  const now = new Date();
  const diff = target - now;

  if (diff < 0) return 'Geleverd';

  // Calculate calendar days (strip time, compare dates only)
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const days = Math.round((targetDate - nowDate) / (1000 * 60 * 60 * 24));

  if (days > 1) return `Over ${days} dagen`;
  if (days === 1) return 'Morgen';

  // Same calendar day - show hours remaining
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 1) return `Over ${hours} uur`;
  if (hours === 1) return `Over 1 uur`;
  return 'Binnenkort';
}

/**
 * Format minutes to a readable duration
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
export function formatDuration(minutes) {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}u ${mins}min` : `${hours} uur`;
}

/**
 * Get the appropriate tag class based on tag name
 * @param {string} tagName - Name of the tag
 * @returns {string} CSS class name
 */
export function getTagClass(tagName) {
  const tagLower = tagName.toLowerCase();
  if (tagLower.includes('calorie')) return 'tag--calorie';
  if (tagLower.includes('familie') || tagLower.includes('family')) return 'tag--family';
  if (tagLower.includes('premium')) return 'tag--premium';
  if (tagLower.includes('veg')) return 'tag--veggie';
  return 'tag--default';
}

/**
 * Get status badge class based on delivery state
 * @param {string} deliveryState - Delivery state (Preparing, ON_THE_WAY, DELIVERED)
 * @returns {string} CSS class name
 */
export function getStatusClass(deliveryState) {
  switch (deliveryState?.toUpperCase()) {
    case 'DELIVERED':
      return 'status-badge--delivered';
    case 'ON_THE_WAY':
      return 'status-badge--in-transit';
    case 'PREPARING':
    case 'RUNNING':
      return 'status-badge--scheduled';
    default:
      return 'status-badge--scheduled';
  }
}

/**
 * Get a friendly status label based on delivery_state
 * @param {string} deliveryState - Delivery state (Preparing, ON_THE_WAY, DELIVERED)
 * @param {string} subStatus - Delivery sub status (optional, for post-delivery states)
 * @returns {string} Friendly label
 */
export function getStatusLabel(deliveryState, subStatus) {
  switch (deliveryState?.toUpperCase()) {
    case 'DELIVERED':
      if (subStatus === 'RATING') return 'Wacht op beoordeling';
      if (subStatus === 'COOK_IT') return 'Klaar om te koken!';
      return 'Geleverd';
    case 'ON_THE_WAY':
      return 'Onderweg';
    case 'PREPARING':
      return 'Wordt voorbereid';
    case 'RUNNING':
      return 'Menu aanpasbaar';
    default:
      return deliveryState || 'Onbekend';
  }
}

/**
 * Determine if delivery is in transit
 * @param {string} deliveryState - Delivery state
 * @returns {boolean}
 */
export function isInTransit(deliveryState) {
  return deliveryState?.toUpperCase() === 'ON_THE_WAY';
}

/**
 * Determine if delivery is delivered
 * @param {string} deliveryState - Delivery state
 * @returns {boolean}
 */
export function isDelivered(deliveryState) {
  return deliveryState?.toUpperCase() === 'DELIVERED';
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncate(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Create a Home Assistant service call action
 * @param {string} domain - Service domain
 * @param {string} service - Service name
 * @param {object} data - Service data
 * @returns {object} Action configuration
 */
export function createServiceAction(domain, service, data = {}) {
  return {
    action: 'call-service',
    service: `${domain}.${service}`,
    service_data: data,
  };
}

/**
 * Fire a Home Assistant event
 * @param {HTMLElement} element - Element to dispatch from
 * @param {string} type - Event type
 * @param {object} detail - Event detail
 */
export function fireEvent(element, type, detail = {}) {
  const event = new CustomEvent(type, {
    bubbles: true,
    composed: true,
    detail,
  });
  element.dispatchEvent(event);
}
