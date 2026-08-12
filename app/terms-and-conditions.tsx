import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ScreenContainer } from '@/components/ui/screen-states';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Spacing } from '@/constants/theme';
import { usePalette, type ThemePalette } from '@/hooks/use-palette';

const sections = [
  ['Informational use', 'HealthNexus supports personal healthcare organization and informational guidance. It does not replace professional medical care or emergency services.'],
  ['Account responsibility', 'Provide accurate account information, protect your credentials, and use only your own account.'],
  ['Health information', 'Only submit information you are authorized to provide. Your choices in Consent Management control supported processing features.'],
  ['Acceptable use', 'Do not misuse the service, attempt unauthorized access, or rely on it for a medical diagnosis.'],
];

export default function TermsAndConditionsScreen() {
  const router = useRouter();
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={24} color={theme.primary} />
        </Pressable>
        <ThemedText style={styles.title}>Terms & Conditions</ThemedText>
      </View>
      <ThemedText style={styles.subtitle}>Review these terms before creating or accessing your account.</ThemedText>
      {sections.map(([heading, body]) => (
        <SurfaceCard key={heading}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>{heading}</ThemedText>
          <ThemedText style={styles.body}>{body}</ThemedText>
        </SurfaceCard>
      ))}
    </ScreenContainer>
  );
}

const makeStyles = (theme: ThemePalette) => StyleSheet.create({
  content: { backgroundColor: theme.screenBg, padding: Spacing.md, gap: Spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  title: { color: theme.accent, fontSize: 22, fontWeight: '700' },
  subtitle: { color: theme.textSecondary, fontSize: 14 },
  sectionTitle: { color: theme.accent },
  body: { color: theme.textSecondary, fontSize: 14, lineHeight: 21 },
});
