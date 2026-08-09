import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';

export interface StatusPillProps {
  label: string;
  color: string;
  backgroundColor: string;
}

/**
 * Small rounded status pill — "1/3 COMPLETED", counts, states. Colors are
 * passed in by the caller (usually theme.successPillText / successPillBg from
 * usePalette()) so this component stays theme-agnostic.
 */
export function StatusPill({ label, color, backgroundColor }: StatusPillProps) {
  return (
    <View style={[styles.pill, { backgroundColor }]}>
      <ThemedText style={[styles.text, { color }]}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
  },
});
