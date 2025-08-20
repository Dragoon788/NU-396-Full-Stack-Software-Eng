/**
 * Design System Colors for the Group Payment App
 * Using your exact 6 brand colors:
 * - Primary: #68763D (olive green)
 * - Secondary: #8C4843 (reddish brown)
 * - Body text: #001303 (very dark green)
 * - Dark accent: #5D429E (purple)
 * - Light accent: #99A451 (lighter green)
 * - Background: #FFFCFC (off-white)
 */

// Your exact brand colors
export const BrandColors = {
  primary: '#68763D',
  secondary: '#8C4843',
  bodyText: '#001303',
  darkAccent: '#5D429E',
  lightAccent: '#99A451',
  background: '#FFFCFC',
};

// Semantic Colors (for form validation, alerts, etc.)
export const SemanticColors = {
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
};

// Basic grays for UI elements
export const NeutralColors = {
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
};

// Legacy support - keeping original structure for existing components
const tintColorLight = BrandColors.primary;
const tintColorDark = BrandColors.lightAccent;

export const Colors = {
  light: {
    text: BrandColors.bodyText,
    background: BrandColors.background,
    tint: tintColorLight,
    icon: NeutralColors.gray500,
    tabIconDefault: NeutralColors.gray500,
    tabIconSelected: tintColorLight,
    // Your brand colors
    primary: BrandColors.primary,
    secondary: BrandColors.secondary,
    darkAccent: BrandColors.darkAccent,
    lightAccent: BrandColors.lightAccent,
    success: SemanticColors.success,
    warning: SemanticColors.warning,
    error: SemanticColors.error,
    border: NeutralColors.gray200,
    muted: NeutralColors.gray100,
  },
  dark: {
    text: BrandColors.background,
    background: BrandColors.bodyText,
    tint: tintColorDark,
    icon: NeutralColors.gray400,
    tabIconDefault: NeutralColors.gray400,
    tabIconSelected: tintColorDark,
    // Your brand colors (same in dark mode for simplicity)
    primary: BrandColors.primary,
    secondary: BrandColors.secondary,
    darkAccent: BrandColors.darkAccent,
    lightAccent: BrandColors.lightAccent,
    success: SemanticColors.success,
    warning: SemanticColors.warning,
    error: SemanticColors.error,
    border: NeutralColors.gray700,
    muted: NeutralColors.gray800,
  },
};

// Export all colors for easy access
export const AllColors = {
  ...BrandColors,
  ...SemanticColors,
  ...NeutralColors,
};
