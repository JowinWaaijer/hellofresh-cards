/**
 * HelloFresh Cards Version
 * Central version management for all cards
 */

export const VERSION = '1.0.3';
export const CARD_NAME = 'HELLOFRESH-CARDS';

/**
 * Log version info to console with styled output
 * @param {string} cardName - Name of the specific card
 */
export function logCardVersion(cardName) {
  console.info(
    `%c ${cardName} %c v${VERSION} `,
    'color: white; background: #067A46; font-weight: bold; border-radius: 3px 0 0 3px;',
    'color: #067A46; background: #E8F5E9; font-weight: bold; border-radius: 0 3px 3px 0;'
  );
}

/**
 * Log main bundle version with full info
 */
export function logBundleVersion() {
  console.groupCollapsed(
    `%c ${CARD_NAME} %c v${VERSION} `,
    'color: white; background: #067A46; font-weight: bold; padding: 4px 8px; border-radius: 3px 0 0 3px;',
    'color: #067A46; background: #E8F5E9; font-weight: bold; padding: 4px 8px; border-radius: 0 3px 3px 0;'
  );
  console.info('📦 Cards included:');
  console.info('   • hellofresh-delivery-card');
  console.info('   • hellofresh-meals-card');
  console.info('   • hellofresh-recipe-card');
  console.info('🔗 https://github.com/JowinWaaijer/hellofresh-cards');
  console.groupEnd();
}
