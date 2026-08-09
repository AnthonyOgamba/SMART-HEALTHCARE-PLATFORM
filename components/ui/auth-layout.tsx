import { useMemo } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { ScreenContainer } from '@/components/ui/screen-states';
import { Radius, Spacing } from '@/constants/theme';
import { usePalette, type ThemePalette } from '@/hooks/use-palette';

export interface AuthLayoutProps extends ViewProps {
  title: string;
  subtitle: string;
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
export function AuthLayout({ title, subtitle, children, ...rest }: AuthLayoutProps) {
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <LinearGradient colors={[theme.backgroundWash, theme.screenBg]} style={styles.gradient}>
      <ScreenContainer contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoWrap}>
          <View style={styles.logoBadge}>
            <MaterialIcons name="favorite" size={28} color={theme.primary} />
          </View>
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
      </ScreenContainer>
    </LinearGradient>
  );
}

const makeStyles = (theme: ThemePalette) =>
  StyleSheet.create({
    gradient: { flex: 1 },
    scrollContent: {
      padding: Spacing.lg,
      gap: Spacing.md,
      flexGrow: 1,
    },
    logoWrap: {
      alignItems: 'center',
      marginTop: Spacing.md,
    },
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
