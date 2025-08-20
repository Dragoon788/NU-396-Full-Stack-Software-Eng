/**
 * Typography Design System
 * Using your custom fonts:
 * - Fraunces: for headings and display text
 * - Commissioner: for body text and UI elements
 */

export const FontFamilies = {
  heading: 'Fraunces',
  display: 'Fraunces',
  body: 'Commissioner',
  ui: 'Commissioner',
  sans: 'Commissioner',
  mono: 'SF Mono',
};

export const FontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
};

export const FontWeights = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
};

export const LineHeights = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
};

// Pre-defined text styles for common use cases
export const TextStyles = {
  // Headers (using Fraunces)
  h1: {
    fontFamily: FontFamilies.display,
    fontSize: FontSizes['4xl'],
    fontWeight: FontWeights.bold,
    lineHeight: 40,
  },
  h2: {
    fontFamily: FontFamilies.display,
    fontSize: FontSizes['3xl'],
    fontWeight: FontWeights.bold,
    lineHeight: 36,
  },
  h3: {
    fontFamily: FontFamilies.display,
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.semibold,
    lineHeight: 32,
  },
  h4: {
    fontFamily: FontFamilies.display,
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.semibold,
    lineHeight: 28,
  },
  h5: {
    fontFamily: FontFamilies.display,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    lineHeight: 28,
  },
  h6: {
    fontFamily: FontFamilies.display,
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    lineHeight: 24,
  },
  
  // Body text (using Commissioner)
  bodyLarge: {
    fontFamily: FontFamilies.body,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.normal,
    lineHeight: 28,
  },
  body: {
    fontFamily: FontFamilies.body,
    fontSize: FontSizes.base,
    fontWeight: FontWeights.normal,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: FontFamilies.body,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.normal,
    lineHeight: 20,
  },
  
  // Special text styles (using Commissioner for UI)
  caption: {
    fontFamily: FontFamilies.body,
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.normal,
    lineHeight: 16,
  },
  button: {
    fontFamily: FontFamilies.ui,
    fontSize: FontSizes.base,
    fontWeight: FontWeights.medium,
    lineHeight: 24,
  },
  link: {
    fontFamily: FontFamilies.body,
    fontSize: FontSizes.base,
    fontWeight: FontWeights.medium,
    lineHeight: 24,
  },
  label: {
    fontFamily: FontFamilies.ui,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    lineHeight: 20,
  },
  
  // App-specific styles
  appTitle: {
    fontFamily: FontFamilies.display,
    fontSize: FontSizes['3xl'],
    fontWeight: FontWeights.bold,
    lineHeight: 36,
  },
  cardTitle: {
    fontFamily: FontFamilies.display,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    lineHeight: 28,
  },
  amount: {
    fontFamily: FontFamilies.display,
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.bold,
    lineHeight: 32,
  },
}; 