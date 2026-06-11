export type OctaThemeName = 'midnight' | 'pearl' | 'obsidian';

export type OctaTextTone =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'inverse';

export type OctaSurfaceTone = 'base' | 'surface' | 'elevated' | 'sunken';

export interface OctaTypographyScale {
  fontSize: number;
  lineHeight: number;
  fontWeight: '400' | '500' | '600' | '700';
  letterSpacing?: number;
}

export interface OctaTheme {
  name: OctaThemeName;
  dark: boolean;
  colors: {
    background: string;
    backgroundAlt: string;
    surface: string;
    surfaceElevated: string;
    surfaceSunken: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    outline: string;
    primary: string;
    primaryGlow: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    inverseText: string;
    chatUserBubble: string;
    chatAssistantBubble: string;
    chatSystemBubble: string;
    gestureCyan: string;
    gestureMagenta: string;
    gestureLime: string;
  };
  gradients: {
    hero: [string, string, string];
    accent: [string, string];
    gestureRing: [string, string, string];
  };
  radius: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    pill: number;
  };
  spacing: {
    xxs: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  typography: {
    displayLg: OctaTypographyScale;
    displayMd: OctaTypographyScale;
    titleLg: OctaTypographyScale;
    titleMd: OctaTypographyScale;
    bodyLg: OctaTypographyScale;
    bodyMd: OctaTypographyScale;
    bodySm: OctaTypographyScale;
    labelLg: OctaTypographyScale;
    labelMd: OctaTypographyScale;
    labelSm: OctaTypographyScale;
    monoSm: OctaTypographyScale;
  };
  shadows: {
    soft: {
      shadowColor: string;
      shadowOpacity: number;
      shadowRadius: number;
      shadowOffset: { width: number; height: number };
      elevation: number;
    };
    glow: {
      shadowColor: string;
      shadowOpacity: number;
      shadowRadius: number;
      shadowOffset: { width: number; height: number };
      elevation: number;
    };
  };
  motion: {
    quick: number;
    standard: number;
    slow: number;
  };
}
