/**
 * HelloFresh Design System for Home Assistant Cards
 * Based on official HelloFresh brand guidelines
 */

export const COLORS = {
  // Primary brand colors
  primary: '#067A46',      // Salem - main green
  primaryLight: '#91C11E', // Lighter green accent
  primaryDark: '#045a33',  // Darker green for hover states

  // Neutral colors
  white: '#FFFFFF',
  background: '#F5F5F5',
  backgroundCard: '#FFFFFF',
  border: '#E0E0E0',

  // Text colors
  textPrimary: '#242424',  // Mine Shaft
  textSecondary: '#666666',
  textMuted: '#999999',
  textOnPrimary: '#FFFFFF',

  // Status colors
  success: '#067A46',
  warning: '#FFC618',
  error: '#E53935',
  info: '#2196F3',

  // Delivery status
  delivered: '#067A46',
  scheduled: '#2196F3',
  paused: '#999999',

  // Tag colors
  tagCalorie: '#E8F5E9',
  tagFamily: '#FFF3E0',
  tagPremium: '#FFF8E1',
  tagVeggie: '#E8F5E9',
};

export const FONTS = {
  family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  sizeXs: '10px',
  sizeSm: '12px',
  sizeMd: '14px',
  sizeLg: '16px',
  sizeXl: '20px',
  sizeXxl: '24px',
  weightNormal: '400',
  weightMedium: '500',
  weightSemibold: '600',
  weightBold: '700',
};

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px',
};

export const BORDERS = {
  radius: '8px',
  radiusSm: '4px',
  radiusLg: '12px',
  radiusPill: '9999px',
  width: '1px',
};

export const SHADOWS = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 2px 4px rgba(0, 0, 0, 0.1)',
  lg: '0 4px 8px rgba(0, 0, 0, 0.12)',
};

export const baseCardStyles = `
  :host {
    display: block;
    font-family: ${FONTS.family};
    --hf-primary: ${COLORS.primary};
    --hf-primary-light: ${COLORS.primaryLight};
    --hf-text: ${COLORS.textPrimary};
    --hf-text-secondary: ${COLORS.textSecondary};
    --hf-background: ${COLORS.backgroundCard};
    --hf-border: ${COLORS.border};
  }

  .card {
    background: var(--hf-background);
    border-radius: ${BORDERS.radiusLg};
    box-shadow: ${SHADOWS.md};
    overflow: hidden;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: ${SPACING.sm};
    padding: ${SPACING.lg};
    border-bottom: ${BORDERS.width} solid var(--hf-border);
  }

  .card-header .icon {
    width: 24px;
    height: 24px;
    color: var(--hf-primary);
  }

  .card-header .title {
    font-size: ${FONTS.sizeLg};
    font-weight: ${FONTS.weightSemibold};
    color: var(--hf-text);
    margin: 0;
  }

  .card-content {
    padding: ${SPACING.lg};
  }

  .tag {
    display: inline-flex;
    align-items: center;
    padding: ${SPACING.xs} ${SPACING.sm};
    border-radius: ${BORDERS.radiusPill};
    font-size: ${FONTS.sizeXs};
    font-weight: ${FONTS.weightMedium};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .tag--calorie {
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

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: ${SPACING.xs};
    padding: ${SPACING.sm} ${SPACING.md};
    border: none;
    border-radius: ${BORDERS.radius};
    font-family: inherit;
    font-size: ${FONTS.sizeSm};
    font-weight: ${FONTS.weightMedium};
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn--primary {
    background: var(--hf-primary);
    color: ${COLORS.textOnPrimary};
  }

  .btn--primary:hover {
    background: ${COLORS.primaryDark};
  }

  .btn--secondary {
    background: transparent;
    color: var(--hf-primary);
    border: ${BORDERS.width} solid var(--hf-primary);
  }

  .btn--secondary:hover {
    background: rgba(6, 122, 70, 0.08);
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: ${SPACING.xs};
    padding: ${SPACING.xs} ${SPACING.sm};
    border-radius: ${BORDERS.radiusPill};
    font-size: ${FONTS.sizeXs};
    font-weight: ${FONTS.weightMedium};
  }

  .status-badge--delivered {
    background: rgba(6, 122, 70, 0.12);
    color: ${COLORS.delivered};
  }

  .status-badge--scheduled {
    background: rgba(33, 150, 243, 0.12);
    color: ${COLORS.scheduled};
  }

  .status-badge--paused {
    background: rgba(153, 153, 153, 0.12);
    color: ${COLORS.paused};
  }

  .skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
    border-radius: ${BORDERS.radiusSm};
  }

  @keyframes skeleton-loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

export const hellofreshLogo = `
<svg viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
</svg>
`;
