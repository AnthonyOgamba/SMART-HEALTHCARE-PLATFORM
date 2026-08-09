import { useMemo } from 'react';

import { Palette, type ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ThemePalette = ThemeColors;

/**
 * Returns the full color token set for the device's current color scheme.
 * Use this instead of importing Brand/hex values directly — screens built
 * on it automatically support dark mode.
 *
 * Usage:
 *   const theme = usePalette();
 *   const styles = useMemo(() => makeStyles(theme), [theme]);
 *   // where makeStyles is `(theme: ThemePalette) => StyleSheet.create({...})`
 *   // defined outside the component so it isn't recreated every render.
 */
export function usePalette(): ThemePalette {
  const scheme = useColorScheme() ?? 'light';
  return useMemo(() => Palette[scheme === 'dark' ? 'dark' : 'light'], [scheme]);
}
