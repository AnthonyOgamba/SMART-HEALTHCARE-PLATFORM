import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { ScreenContainer } from '@/components/ui/screen-states';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Spacing } from '@/constants/theme';
import { usePalette, type ThemePalette } from '@/hooks/use-palette';

/**
 * Static legal copy. Content below mirrors the approved design — check with
 * Members 2 & 3 / Member 1 before editing wording, and update "Last updated"
 * whenever the policy text changes.
 */

const SECTIONS: { heading: string; body: string }[] = [
  {
    heading: '1. Introduction',
    body: 'Welcome to HealthNexus. Your privacy is critically important to us. This policy outlines how we handle your personal and medical data to provide a seamless health management experience. By using the app, you agree to the collection and use of information in accordance with this policy.',
  },
  {
    heading: '2. Data Collection',
    body: 'We collect information needed to provide and improve the service. This includes personal identification information (name, email, phone), health records and medical history, optional biometric authentication preferences, and activity data that you enter.',
  },
  {
    heading: '3. Data Usage',
    body: 'HealthNexus uses the collected data for various purposes: to provide and maintain our service, to notify you about changes to our service, to provide AI-driven health insights, and to provide customer support.',
  },
  {
    heading: '4. Your Rights',
    body: 'You have the right to access, update, or delete the information we have on you. Whenever made possible, you can update your personal data directly within your account settings section. If you are unable to perform these actions yourself, please contact us.',
  },
  {
    heading: '5. Security of Data',
    body: 'The security of your data is important to us, but remember that no method of transmission over the internet, or method of electronic storage, is 100% secure. We strive to use commercially acceptable means to protect your personal data.',
  },
];

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          hitSlop={8}>
          <MaterialIcons name="arrow-back" size={22} color={theme.iconDefault} />
        </Pressable>
        <ThemedText type="title" style={styles.headerTitle}>
          Privacy Policy
        </ThemedText>
        <View style={{ width: 22 }} />
      </View>

      <SurfaceCard>
        {SECTIONS.map((section) => (
          <View key={section.heading} style={{ gap: 4 }}>
            <ThemedText type="defaultSemiBold" style={styles.sectionHeading}>
              {section.heading}
            </ThemedText>
            <ThemedText style={styles.sectionBody}>{section.body}</ThemedText>
          </View>
        ))}
      </SurfaceCard>

      <Button label="I Accept & Continue" onPress={() => router.back()} />

      <ThemedText style={styles.updated}>Last updated: October 24, 2023</ThemedText>
    </ScreenContainer>
  );
}

const makeStyles = (theme: ThemePalette) =>
  StyleSheet.create({
    content: {
      padding: Spacing.md,
      gap: Spacing.md,
      backgroundColor: theme.screenBg,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitle: {
      fontSize: 18,
      color: theme.accent,
    },
    sectionHeading: {
      fontSize: 15,
      color: theme.textPrimary,
    },
    sectionBody: {
      fontSize: 13,
      lineHeight: 20,
      color: theme.textSecondary,
    },
    updated: {
      textAlign: 'center',
      fontSize: 12,
      color: theme.textMuted,
    },
  });
