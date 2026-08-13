import { useMemo } from 'react';
import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, View, type ViewProps } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AuthLightThemeProvider } from '@/components/ui/auth-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import { Palette, type ThemeColors } from '@/constants/theme';

export interface AuthLayoutProps extends ViewProps {
  title: string;
  subtitle: string;
  brandedMascot?: boolean;
}

/**
 * Shared shell for every auth screen (Login, Create Account, Forgot Password,
 * Reset Success): gradient background, logo badge, title, subtitle, card
 * wrapper, and the HIPAA info box. Fully theme-aware via usePalette().
 *
 * `children` is rendered inside the card. Anything that shouldn't sit in the
 * card goes in the screen itself.
 *
 * TODO: swap the placeholder logo icon for the real brand asset once exported
 * from Figma (drop it in assets/images and use <Image> here).
 */
export function AuthLayout({ title, subtitle, brandedMascot = false, children, ...rest }: AuthLayoutProps) {
  const router = useRouter();
  const theme = Palette.light;
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <AuthLightThemeProvider><SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" hitSlop={10} onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.primary} />
        </Pressable>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="never">
        <View style={[styles.logoWrap, brandedMascot && styles.mascotWrap]}>
          {brandedMascot ? (
            <Image source={require('@/assets/images/brand/signup-mascot.png')} style={styles.mascot} contentFit="contain" accessibilityLabel="Genie Cares companion" />
          ) : (
            <View style={styles.logoBadge}>
              <MaterialIcons name="favorite" size={28} color={theme.primary} />
            </View>
          )}
        </View>

        <ThemedText style={styles.title}>{title}</ThemedText>
        <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>

        <View style={styles.card} {...rest}>
          {children}
        </View>

        <View style={styles.infoBox}>
          <MaterialIcons name="verified-user" size={20} color={theme.primary} />
          <ThemedText style={styles.infoText}>
            Your health information is protected with secure cloud technology. All data is
            encrypted using clinical-grade protocols.
          </ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView></AuthLightThemeProvider>
  );
}

const makeStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
    topBar: {
      height: 52,
      justifyContent: 'center',
      paddingHorizontal: Spacing.lg,
      backgroundColor: '#FFFFFF',
      zIndex: 2,
    },
    scroll: { flex: 1, backgroundColor: '#FFFFFF' },
    scrollContent: {
      padding: Spacing.lg,
      gap: Spacing.md,
      flexGrow: 1,
      backgroundColor: '#FFFFFF',
    },
    backButton: { width: 44, height: 44, justifyContent: 'center' },
    logoWrap: {
      alignItems: 'center',
      marginTop: 0,
    },
    mascotWrap: { marginTop: -8, marginBottom: -14 },
    mascot: { width: 120, height: 120 },
    logoBadge: {
      width: 64,
      height: 64,
      borderRadius: Radius.lg,
      backgroundColor: theme.cardBg,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.inputBorder,
    },
    title: {
      fontSize: 26,
      fontWeight: '700',
      color: theme.accent,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    card: {
      backgroundColor: theme.cardBg,
      borderRadius: Radius.lg,
      padding: Spacing.lg,
      gap: Spacing.md,
      borderWidth: 1,
      borderColor: theme.inputBorder,
    },
    infoBox: {
      flexDirection: 'row',
      gap: Spacing.sm,
      backgroundColor: theme.infoBoxBg,
      borderColor: theme.infoBoxBorder,
      borderWidth: 1,
      borderRadius: Radius.md,
      padding: Spacing.md,
      alignItems: 'flex-start',
    },
    infoText: {
      flex: 1,
      fontSize: 13,
      color: theme.infoBoxText,
      lineHeight: 18,
    },
  });
