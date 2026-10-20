export const RospiereColors = {
  primary: '#000000',
  primaryContainer: '#3b3b3b',
  onPrimary: '#e2e2e2',
  onPrimaryContainer: '#ffffff',
  surface: '#f9f9f9',
  surfaceBright: '#f9f9f9',
  surfaceDim: '#dadada',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f3f3f3',
  surfaceContainer: '#eeeeee',
  surfaceContainerHigh: '#e8e8e8',
  surfaceContainerHighest: '#e2e2e2',
  onSurface: '#1b1b1b',
  onSurfaceVariant: '#474747',
  secondary: '#5f5e5e',
  secondaryContainer: '#d6d4d3',
  onSecondary: '#ffffff',
  outline: '#777777',
  outlineVariant: '#c6c6c6',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  // Reader themes
  reader: {
    paper: {
      background: '#f9f9f9',
      text: '#1b1b1b',
      container: '#f3f3f3',
      border: '#c6c6c6',
      subtext: '#5f5e5e',
    },
    sepia: {
      background: '#f4ede2',
      text: '#382e25',
      container: '#eae1d3',
      border: '#d7cbb8',
      subtext: '#6d5d4d',
    },
    dark: {
      background: '#181818',
      text: '#dedede',
      container: '#232323',
      border: '#3c3c3c',
      subtext: '#9e9e9e',
    },
  },
} as const;

export const RospiereSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const RospiereFonts = {
  headline: 'NotoSerif_400Regular',
  headlineMedium: 'NotoSerif_600SemiBold',
  headlineItalic: 'NotoSerif_400Regular_Italic',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  label: 'Inter_500Medium',
  mono: 'Inter_400Regular',
} as const;
