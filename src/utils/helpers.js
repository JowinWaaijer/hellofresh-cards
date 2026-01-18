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

/**
 * Format THT date to short format
 * @param {string} dateString - ISO date string (YYYY-MM-DD)
 * @returns {string} Formatted date like "20 jan"
 */
export function formatThtDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Get THT status based on days until expiry
 * @param {string} dateString - ISO date string (YYYY-MM-DD)
 * @returns {'ok' | 'warning' | 'expired'} Status
 */
export function getThtStatus(dateString) {
  if (!dateString) return 'ok';
  const now = new Date();
  const tht = new Date(dateString);

  // Strip time, compare dates only
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thtDate = new Date(tht.getFullYear(), tht.getMonth(), tht.getDate());
  const daysUntil = Math.round((thtDate - today) / (1000 * 60 * 60 * 24));

  if (daysUntil < 0) return 'expired';
  if (daysUntil <= 2) return 'warning';
  return 'ok';
}

/**
 * Get current ISO week string
 * @returns {string} Week string like "2026-W03"
 */
export function getCurrentIsoWeek() {
  const now = new Date();
  const year = now.getFullYear();

  // Calculate ISO week number
  const jan4 = new Date(year, 0, 4);
  const startOfYear = new Date(year, 0, 1);
  const daysSinceJan4 = Math.floor((now - jan4) / (1000 * 60 * 60 * 24));
  const weekNumber = Math.ceil((daysSinceJan4 + jan4.getDay() + 1) / 7);

  // Handle edge cases for year boundaries
  const adjustedWeek = weekNumber < 1 ? 52 : (weekNumber > 52 ? 1 : weekNumber);
  const adjustedYear = weekNumber < 1 ? year - 1 : (weekNumber > 52 ? year + 1 : year);

  return `${adjustedYear}-W${String(adjustedWeek).padStart(2, '0')}`;
}

/**
 * Get default THT date (delivery date + 5 days)
 * @param {string} deliveryDate - ISO date string for delivery
 * @returns {string} ISO date string (YYYY-MM-DD)
 */
export function getDefaultThtDate(deliveryDate) {
  const base = deliveryDate ? new Date(deliveryDate) : new Date();
  base.setDate(base.getDate() + 5);
  return base.toISOString().split('T')[0];
}

/**
 * Create a short key for a meal name (max 20 chars)
 * @param {string} mealName - Full meal name
 * @returns {string} Short key
 */
export function getMealKey(mealName) {
  if (!mealName) return '';
  return mealName.substring(0, 20).trim();
}
