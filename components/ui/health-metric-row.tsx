import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconBadge } from '@/components/ui/icon-badge';
import { Radius, Spacing } from '@/constants/theme';
import { usePalette, type ThemePalette } from '@/hooks/use-palette';
import type { HealthMetric } from '@/types';

/** One row in the Dashboard's Health Summary card. Colors resolve from the
 * metric's semantic colorKey against the current theme, so they flip
 * correctly in dark mode. */
export function HealthMetricRow({ metric }: { metric: HealthMetric }) {
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const tint = theme[`${metric.colorKey}Tint`];
  const icon = theme[`${metric.colorKey}Icon`];

  return (
    <View style={styles.row}>
      <IconBadge icon={metric.icon} color={icon} backgroundColor={tint} />
      <View style={{ flex: 1 }}>
        <ThemedText style={styles.label}>{metric.label}</ThemedText>
        <ThemedText style={styles.value}>
          {metric.value}
          {metric.unit ? <ThemedText style={styles.unit}> {metric.unit}</ThemedText> : null}
        </ThemedText>
      </View>
      <View style={[styles.bar, { backgroundColor: tint }]} />
    </View>
  );
}

const makeStyles = (theme: ThemePalette) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      backgroundColor: theme.screenBg,
      borderRadius: Radius.md,
      padding: Spacing.sm,
    },
    label: {
      fontSize: 13,
      color: theme.textSecondary,
    },
    value: {
      fontSize: 17,
      fontWeight: '700',
      color: theme.textPrimary,
    },
    unit: {
      fontSize: 12,
      fontWeight: '400',
      color: theme.textMuted,
    },
    bar: {
      width: 56,
      height: 8,
      borderRadius: 4,
    },
  });
