/**
 * HelloFresh Cards for Home Assistant
 * A collection of beautiful Lovelace cards for the HelloFresh integration
 *
 * @version 1.0.0
 * @author Jowin Waaijer
 * @license MIT
 */

// Import all card components
import './cards/hellofresh-delivery-card.js';
import './cards/hellofresh-meals-card.js';
import './cards/hellofresh-recipe-card.js';

// Version info
const VERSION = '1.0.0';

console.info(
  `%c HELLOFRESH-CARDS %c ${VERSION} %c`,
  'color: white; background: #067A46; font-weight: bold; padding: 2px 4px;',
  'color: #067A46; background: white; font-weight: bold; padding: 2px 4px;',
  'background: transparent;'
);

console.info(
  '%c Cards loaded: hellofresh-delivery-card, hellofresh-meals-card, hellofresh-recipe-card',
  'color: #666;'
);
