import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useScopedPalette } from '@/components/ui/auth-theme-context';
import { Radius, Spacing } from '@/constants/theme';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

export type InputProps = TextInputProps & {
  label: string;
  error?: string;
  icon?: MaterialIconName;
  rightIcon?: MaterialIconName;
  onRightIconPress?: () => void;
  rightIconAccessibilityLabel?: string;
};

export function Input({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  rightIconAccessibilityLabel,
  style,
  ...rest
}: InputProps) {
  const theme = useScopedPalette();
  const borderColor = error ? theme.danger : theme.inputBorder;

  return (
    <View style={styles.wrapper}>
      <ThemedText type="defaultSemiBold" style={[styles.label, { color: theme.textPrimary }]}>
        {label}
      </ThemedText>
      <View style={[styles.fieldRow, { borderColor, backgroundColor: theme.cardBg }]}>
        {icon ? <MaterialIcons name={icon} size={20} color={theme.fieldIcon} style={styles.leadingIcon} /> : null}
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={theme.placeholder}
          style={[styles.input, { color: theme.textPrimary }, style]}
          {...rest}
        />
        {rightIcon ? (
          <Pressable
            onPress={onRightIconPress}
            accessibilityRole="button"
            accessibilityLabel={rightIconAccessibilityLabel ?? 'Toggle'}
            hitSlop={8}>
            <MaterialIcons name={rightIcon} size={20} color={theme.fieldIcon} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <ThemedText style={[styles.error, { color: theme.danger }]} accessibilityLiveRegion="polite">
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: 14,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
    gap: Spacing.sm,
  },
  leadingIcon: {
    marginRight: -Spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.sm + 2,
  },
  error: {
    fontSize: 13,
  },
});
