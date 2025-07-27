// CounselFlow Corporate Theme Configuration
export const theme = {
  colors: {
    // Primary Teal/Turquoise Palette
    primary: {
      50: '#f0fdfa',    // Very light teal
      100: '#ccfbf1',   // Light teal
      200: '#99f6e4',   // Lighter teal
      300: '#5eead4',   // Medium light teal
      400: '#2dd4bf',   // Medium teal
      500: '#14b8a6',   // Main teal (primary)
      600: '#0d9488',   // Darker teal
      700: '#0f766e',   // Dark teal
      800: '#115e59',   // Very dark teal
      900: '#134e4a',   // Darkest teal
    },
    
    // Secondary Palette (Complementary Turquoise)
    secondary: {
      50: '#ecfeff',    // Very light turquoise
      100: '#cffafe',   // Light turquoise
      200: '#a5f3fc',   // Lighter turquoise
      300: '#67e8f9',   // Medium light turquoise
      400: '#22d3ee',   // Medium turquoise
      500: '#06b6d4',   // Main turquoise
      600: '#0891b2',   // Darker turquoise
      700: '#0e7490',   // Dark turquoise
      800: '#155e75',   // Very dark turquoise
      900: '#164e63',   // Darkest turquoise
    },
    
    // Neutral Palette (Whites, Grays)
    neutral: {
      50: '#fafafa',    // Off-white
      100: '#f5f5f5',   // Very light gray
      200: '#e5e5e5',   // Light gray
      300: '#d4d4d4',   // Medium light gray
      400: '#a3a3a3',   // Medium gray
      500: '#737373',   // Gray
      600: '#525252',   // Dark gray
      700: '#404040',   // Very dark gray
      800: '#262626',   // Almost black
      900: '#171717',   // Black
    },
    
    // Status Colors (Corporate appropriate)
    success: {
      50: '#f0fdf4',
      200: '#bbf7d0',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
    },
    warning: {
      50: '#fffbeb',
      200: '#fed7aa',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
    },
    error: {
      50: '#fef2f2',
      200: '#fecaca',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
    },
    
    // Corporate Whites
    white: '#ffffff',
    background: '#fafafa',  // Subtle off-white for backgrounds
    surface: '#ffffff',     // Pure white for cards/surfaces
  },
  
  // Corporate Typography
  typography: {
    fontFamily: {
      primary: ['Inter', 'system-ui', 'sans-serif'],
      secondary: ['Roboto', 'system-ui', 'sans-serif'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem', 
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  
  // Spacing (8px grid system)
  spacing: {
    xs: '0.25rem',  // 4px
    sm: '0.5rem',   // 8px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
    '3xl': '4rem',  // 64px
  },
  
  // Border Radius
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
  },
  
  // Shadows (Corporate appropriate)
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
} as const;

// Component-specific theme configurations
export const componentThemes = {
  // Button variants
  button: {
    primary: {
      background: theme.colors.primary[500],
      backgroundHover: theme.colors.primary[600],
      backgroundActive: theme.colors.primary[700],
      text: theme.colors.white,
      border: theme.colors.primary[500],
    },
    secondary: {
      background: theme.colors.white,
      backgroundHover: theme.colors.primary[50],
      backgroundActive: theme.colors.primary[100],
      text: theme.colors.primary[600],
      border: theme.colors.primary[300],
    },
    outline: {
      background: 'transparent',
      backgroundHover: theme.colors.primary[50],
      backgroundActive: theme.colors.primary[100],
      text: theme.colors.primary[600],
      border: theme.colors.primary[300],
    },
  },
  
  // Card themes
  card: {
    background: theme.colors.white,
    border: theme.colors.neutral[200],
    shadow: theme.boxShadow.sm,
  },
  
  // Navigation themes
  navigation: {
    background: theme.colors.white,
    border: theme.colors.neutral[200],
    itemDefault: theme.colors.neutral[600],
    itemHover: theme.colors.primary[600],
    itemActive: theme.colors.primary[600],
    itemActiveBg: theme.colors.primary[50],
  },
  
  // Header themes
  header: {
    background: theme.colors.white,
    border: theme.colors.neutral[200],
    text: theme.colors.neutral[900],
  },
  
  // Input themes
  input: {
    background: theme.colors.white,
    border: theme.colors.neutral[300],
    borderFocus: theme.colors.primary[500],
    text: theme.colors.neutral[900],
    placeholder: theme.colors.neutral[500],
  },
  
  // Status themes
  status: {
    active: {
      background: theme.colors.success[50],
      text: theme.colors.success[700],
      border: theme.colors.success[200],
    },
    pending: {
      background: theme.colors.warning[50],
      text: theme.colors.warning[700],
      border: theme.colors.warning[200],
    },
    inactive: {
      background: theme.colors.neutral[50],
      text: theme.colors.neutral[700],
      border: theme.colors.neutral[200],
    },
    high: {
      background: theme.colors.error[50],
      text: theme.colors.error[700],
      border: theme.colors.error[200],
    },
    medium: {
      background: theme.colors.warning[50],
      text: theme.colors.warning[700],
      border: theme.colors.warning[200],
    },
    low: {
      background: theme.colors.success[50],
      text: theme.colors.success[700],
      border: theme.colors.success[200],
    },
  },
};

export default theme;
