import { ActivityIndicator, ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { usePalette } from '@/hooks/use-palette';

/**
 * Standard scrollable screen wrapper. Use this instead of raw View/ScrollView
 * so every screen has the same safe-area handling and padding.
 *
 * The safe-area background follows the current theme's screenBg so overscroll
 * / bounce areas match the app background instead of flashing white in dark
 * mode. Individual screens still set their own contentContainerStyle
 * background for the scrollable content itself.
 */
export function ScreenContainer({ children, style, contentContainerStyle, ...rest }: ScrollViewProps) {
  const theme = usePalette();
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.screenBg }]} edges={['top', 'left', 'right']}>
      <ScrollView
        style={{ backgroundColor: theme.screenBg }}
        contentContainerStyle={[styles.content, style as object, contentContainerStyle, { backgroundColor: theme.screenBg }]}
        keyboardShouldPersistTaps="handled"
        {...rest}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <ThemedView style={styles.centered} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator size="large" />
      <ThemedText style={styles.centeredText}>{label}</ThemedText>
    </ThemedView>
  );
}

export function ErrorState({
  message = 'Something went wrong.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <ThemedView style={styles.centered} accessibilityRole="alert">
      <ThemedText type="defaultSemiBold" style={styles.centeredText}>
        {message}
      </ThemedText>
      {onRetry ? (
        <View style={{ marginTop: Spacing.md }}>
          <Button label="Try again" onPress={onRetry} variant="secondary" />
        </View>
      ) : null}
    </ThemedView>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <ThemedView style={styles.centered}>
      <ThemedText style={styles.centeredText}>{message}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  centeredText: {
    textAlign: 'center',
  },
});
