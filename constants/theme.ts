/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#1B4F72';
const tintColorDark = '#6FA8DC';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

// Brand palette — read off the Create Account design (Members 2 & 3).
// Kept for any code still importing the flat light-mode values directly.
// New code should prefer `Palette` (via the usePalette() hook) so colors
// respond to dark mode.
export const Brand = {
  primary: '#1B4F72',
  accent: '#2B6CB0',
  backgroundWash: '#EAF4FC',
  inputBorder: '#D6DEE6',
  placeholder: '#9AA5B1',
  fieldIcon: '#6B7785',
  subtitle: '#5B6572',
  infoBoxBg: '#EAF6FF',
  infoBoxBorder: '#BFE0F5',
  infoBoxText: '#274B67',
  textPrimary: '#1A202C',
  textSecondary: '#5B6572',
  textMuted: '#8A94A2',
  screenBg: '#F7F8FA',
  cardBorder: '#EEF1F4',
};

/**
 * Full light/dark token set for every screen. Use via the usePalette() hook
 * (hooks/use-palette.ts) rather than importing Brand/Semantic hex directly —
 * that hook returns the right half of this object for the device's current
 * color scheme, so screens re-render correctly when the scheme changes.
 */
export interface ThemeColors {
  screenBg: string;
  cardBg: string;
  cardBorder: string;
  inputBorder: string;
  backgroundWash: string;
  white: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  placeholder: string;
  primary: string;
  accent: string;
  iconDefault: string;
  iconMuted: string;
  fieldIcon: string;
  infoBoxBg: string;
  infoBoxBorder: string;
  infoBoxText: string;
  avatarBg: string;
  avatarIcon: string;
  redTint: string;
  redIcon: string;
  blueTint: string;
  blueIcon: string;
  greenTint: string;
  greenIcon: string;
  amberTint: string;
  amberIcon: string;
  grayTint: string;
  grayIcon: string;
  successPillBg: string;
  successPillText: string;
  tipBg: string;
  tipBorder: string;
  danger: string;
}

export const Palette: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    // Surfaces
    screenBg: '#F7F8FA',
    cardBg: '#FFFFFF',
    cardBorder: '#EEF1F4',
    inputBorder: '#D6DEE6',
    backgroundWash: '#EAF4FC',
    white: '#FFFFFF',

    // Text
    textPrimary: '#1A202C',
    textSecondary: '#5B6572',
    textMuted: '#8A94A2',
    placeholder: '#9AA5B1',

    // Brand
    primary: '#1B4F72',
    accent: '#2B6CB0',

    // Icons
    iconDefault: '#4B5563',
    iconMuted: '#9CA3AF',
    fieldIcon: '#6B7785',

    // Info box (auth screens)
    infoBoxBg: '#EAF6FF',
    infoBoxBorder: '#BFE0F5',
    infoBoxText: '#274B67',

    // Avatar placeholder
    avatarBg: '#EEF1F4',
    avatarIcon: '#9CA3AF',

    // Icon badge tints (Heart Rate, Sleep, Activity, category icons)
    redTint: '#FBE7E9',
    redIcon: '#D64550',
    blueTint: '#E6EEF9',
    blueIcon: '#3B6EA5',
    greenTint: '#E6F4EA',
    greenIcon: '#3E8E5A',
    amberTint: '#FAEEDA',
    amberIcon: '#B45309',
    grayTint: '#EEF1F4',
    grayIcon: '#9CA3AF',

    // Status pill ("1/3 COMPLETED")
    successPillBg: '#DFF3E4',
    successPillText: '#2F6B41',

    // Notification "tip" card
    tipBg: '#F1F9F3',
    tipBorder: '#DCEFE0',

    // Destructive actions (Delete Account, Logout)
    danger: '#C62828',
  },
  dark: {
    screenBg: '#14161A',
    cardBg: '#1E2126',
    cardBorder: '#2C3038',
    inputBorder: '#3A3F47',
    backgroundWash: '#10151C',
    white: '#FFFFFF',

    textPrimary: '#F1F3F5',
    textSecondary: '#A6ADB8',
    textMuted: '#7A8290',
    placeholder: '#6B7280',

    primary: '#3E7CAE',
    accent: '#6FA8DC',

    iconDefault: '#A6ADB8',
    iconMuted: '#7A8290',
    fieldIcon: '#A6ADB8',

    infoBoxBg: '#16232E',
    infoBoxBorder: '#26404F',
    infoBoxText: '#BEE3F8',

    avatarBg: '#2A2E33',
    avatarIcon: '#8A94A2',

    redTint: '#3A2024',
    redIcon: '#F2848F',
    blueTint: '#1C2B3A',
    blueIcon: '#7FB0E0',
    greenTint: '#1B2E22',
    greenIcon: '#7FCB98',
    amberTint: '#3A2E14',
    amberIcon: '#E3A64B',
    grayTint: '#2A2E33',
    grayIcon: '#8A94A2',

    successPillBg: '#1C3324',
    successPillText: '#8FE0A8',

    tipBg: '#16241B',
    tipBorder: '#274232',

    danger: '#F2848F',
  },
};

// ---- PLACEHOLDER DESIGN TOKENS ----
// Replace with real values once the Figma link is shared (Members 2 & 3).
// Keeping all spacing/radius/semantic colors here means updating the design
// later is a one-file change, not a hunt through every screen.

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
};

export const Semantic = {
  success: '#2E7D32',
  warning: '#B45309',
  danger: '#C62828',
  info: '#0a7ea4',
  border: '#E2E8F0',
  borderDark: '#2A2E31',
  muted: '#687076',
  mutedDark: '#9BA1A6',
};

export const Typography = {
  h1: { fontSize: 28, fontWeight: '700' as const },
  h2: { fontSize: 22, fontWeight: '700' as const },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
