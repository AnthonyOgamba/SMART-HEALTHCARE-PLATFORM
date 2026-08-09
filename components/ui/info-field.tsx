import { useMemo } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { usePalette, type ThemePalette } from '@/hooks/use-palette';

export interface InfoFieldProps {
  label: string;
  value: string;
  valueColor?: string;
  style?: ViewStyle;
}

/** Uppercase label above a value — used throughout Profile Details. */
export function InfoField({ label, value, valueColor, style }: InfoFieldProps) {
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={[styles.wrapper, style]}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <ThemedText style={[styles.value, valueColor ? { color: valueColor } : null]}>{value}</ThemedText>
    </View>
  );
}

const makeStyles = (theme: ThemePalette) =>
  StyleSheet.create({
    wrapper: {
      gap: 2,
    },
    label: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.5,
      color: theme.textSecondary,
    },
    value: {
      fontSize: 15,
      color: theme.textPrimary,
    },
  });
