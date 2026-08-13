import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { usePalette } from '@/hooks/use-palette';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';
type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

export type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: MaterialIconName;
};

/**
 * Single button component for the whole app. Adding a new visual style
 * later means editing `styles` here, not every screen.
 */
export function Button({ label, variant = 'primary', loading, icon, disabled, style, ...rest }: ButtonProps) {
  const theme = usePalette();
  const isDisabled = disabled || loading;

  const variantStyle =
    variant === 'primary'
      ? { backgroundColor: theme.primaryButtonBackground, borderColor: theme.primaryButtonBackground }
      : variant === 'danger'
      ? { backgroundColor: 'transparent', borderColor: theme.danger }
      : { backgroundColor: 'transparent', borderColor: theme.secondary };

  const textColor =
    variant === 'primary' ? theme.white : variant === 'danger' ? theme.danger : theme.secondary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyle,
        isDisabled && { backgroundColor: theme.disabledBackground, borderColor: theme.disabledBackground },
        pressed && !isDisabled && styles.pressed,
        style as object,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.content}>
          <ThemedText style={[styles.label, { color: isDisabled ? theme.disabledText : textColor }]}>{label}</ThemedText>
          {icon ? <MaterialIcons name={icon} size={18} color={textColor} /> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48, // touch target
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
  },
});
