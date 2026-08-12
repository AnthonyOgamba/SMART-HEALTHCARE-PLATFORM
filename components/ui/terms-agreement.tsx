import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { usePalette, type ThemePalette } from '@/hooks/use-palette';

export function TermsAgreement({
  accepted,
  onAcceptedChange,
  onTermsPress,
  error,
}: {
  accepted: boolean;
  onAcceptedChange: (accepted: boolean) => void;
  onTermsPress: () => void;
  error?: string;
}) {
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: accepted }}
          accessibilityLabel="Accept Terms and Conditions"
          onPress={() => onAcceptedChange(!accepted)}
          style={[styles.checkbox, accepted && styles.checkboxAccepted]}
        >
          {accepted ? <MaterialIcons name="check" size={16} color={theme.white} /> : null}
        </Pressable>
        <ThemedText style={styles.label}>I agree to the </ThemedText>
        <Pressable accessibilityRole="link" onPress={onTermsPress}>
          <ThemedText style={styles.link}>Terms & Conditions</ThemedText>
        </Pressable>
      </View>
      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
    </View>
  );
}

const makeStyles = (theme: ThemePalette) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: theme.inputBorder,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.sm,
    },
    checkboxAccepted: { backgroundColor: theme.primary, borderColor: theme.primary },
    label: { fontSize: 14, color: theme.textSecondary },
    link: { fontSize: 14, fontWeight: '700', color: theme.accent },
    error: { color: theme.danger, fontSize: 12, marginTop: Spacing.xs, marginLeft: 32 },
  });
