// Only4Kiddos Brand Colors
export const Colors = {
  // Primary Brand Colors
  primary: '#FF6B35',        // Vibrant orange - main brand color
  primaryLight: '#FF8A5C',   // Lighter orange for hover states
  primaryDark: '#E55A2B',    // Darker orange for pressed states
  primaryGradient: ['#FF6B35', '#FF8A5C'], // Brand gradient
  
  // Secondary Colors
  secondary: '#4ECDC4',      // Playful teal
  secondaryLight: '#7DD3DB', // Light teal
  secondaryDark: '#45B7B8',  // Dark teal
  
  // Brand Teal (4kiddos signature color)
  brandTeal: '#01fee7',      // 4kiddos signature teal
  brandTealLight: '#33fef0', // Light brand teal
  brandTealDark: '#01e6d1',  // Dark brand teal
  
  // Accent Colors
  accent: '#FFE66D',         // Sunny yellow
  accentPink: '#FF6B9D',     // Fun pink
  accentPurple: '#A8E6CF',   // Soft mint green
  accentBlue: '#6B9DFF',     // Playful blue
  
  // Neutral Colors
  background: '#FAFBFC',     // Very light gray background
  surface: '#FFFFFF',        // Pure white for cards
  surfaceSecondary: '#F8F9FA', // Light gray for secondary surfaces
  brandBackground: '#FFF8F5', // Warm brand background
  brandSurface: '#FFFAF7',   // Subtle brand tinted surface
  
  // Text Colors
  textPrimary: '#2D3748',    // Dark gray for primary text
  textSecondary: '#718096',  // Medium gray for secondary text
  textTertiary: '#A0AEC0',   // Light gray for tertiary text
  textOnPrimary: '#FFFFFF',  // White text on primary colors
  
  // Status Colors
  success: '#48BB78',        // Green for success states
  warning: '#ED8936',        // Orange for warnings
  error: '#F56565',          // Red for errors
  info: '#4299E1',           // Blue for info
  
  // Border Colors
  border: '#E2E8F0',         // Light border
  borderLight: '#F7FAFC',    // Very light border
  
  // Shadow
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
};

// Brand Typography
export const Typography = {
  // Font Weights
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  
  // Font Sizes
  fontSizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  
  // Line Heights
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

// Spacing System
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

// Border Radius
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

// Brand Gradients
export const BrandGradients = {
  tealYellow: ['#01fee7', '#FFE66D'],
  primarySecondary: ['#FF6B35', '#4ECDC4'],
  pastelMix: ['#FFE66D', '#FF6B9D', '#A8E6CF'],
  splashGradient: ['#01fee7', '#FFE66D'],
};

// Animation Durations
export const AnimationDurations = {
  fast: 200,
  normal: 300,
  slow: 500,
  bounce: 800,
};