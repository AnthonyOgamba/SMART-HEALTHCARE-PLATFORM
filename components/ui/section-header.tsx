import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { usePalette, type ThemePalette } from '@/hooks/use-palette';

export interface SectionHeaderProps {
  label: string;
  /** Optional element rendered on the right (badge, icon, action). */
  trailing?: React.ReactNode;
}

/** Small uppercase section label — "HEALTH SUMMARY", "TODAY", "QUICK ACTIONS". */
export function SectionHeader({ label, trailing }: SectionHeaderProps) {
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  if (!trailing) {
    return <ThemedText style={styles.label}>{label}</ThemedText>;
  }
  return (
    <View style={styles.row}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      {trailing}
    </View>
  );
}

const makeStyles = (theme: ThemePalette) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.sm,
    },
    label: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.5,
      color: theme.textSecondary,
    },
  });
