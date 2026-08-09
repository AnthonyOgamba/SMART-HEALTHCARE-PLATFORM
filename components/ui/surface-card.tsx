import { useMemo } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { usePalette, type ThemePalette } from '@/hooks/use-palette';

/**
 * The standard card on the app background — used by Dashboard, Profile,
 * Settings, Notifications and Consent screens. Colors follow the current
 * theme (light/dark) via usePalette().
 *
 * Distinct from components/ui/card.tsx, which is the original theme-aware
 * card from the template.
 */
export function SurfaceCard({ style, ...rest }: ViewProps) {
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return <View style={[styles.card, style]} {...rest} />;
}

const makeStyles = (theme: ThemePalette) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.cardBg,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      gap: Spacing.sm,
      borderWidth: 1,
      borderColor: theme.cardBorder,
    },
  });
