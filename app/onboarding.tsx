import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { completeOnboarding } from '@/lib/services/settings';
import { useAuth } from '@/providers/auth-provider';

const slides = [
  { title: 'Manage Your Medications', description: 'Track schedules, reminders, doses and medication progress in one place.', image: require('@/assets/images/onboarding/medications.png') },
  { title: 'Stay on Top of Your Care', description: 'Organize appointments, care activities and reminders from your Care Schedule.', image: require('@/assets/images/onboarding/care-schedule.png') },
  { title: 'Track Your Wellness', description: 'Record symptoms, activity and sleep to build a clearer picture of your wellness.', image: require('@/assets/images/onboarding/wellness.png') },
  { title: 'Get support from Genie', description: 'Our AI support is here to provide helpful guidance and health insights whenever you need them.', image: require('@/assets/images/onboarding/genie-ai-care-white.png') },
] as const;

export default function OnboardingScreen() {
  const router = useRouter();
  const { user, markOnboardingComplete } = useAuth();
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const slide = slides[index];
  const illustrationSize = Math.max(220, Math.min(width - 48, height * 0.4, 390));
  const finish = async () => {
    if (finishing) return;
    setFinishing(true);
    try {
      if (!user) throw new Error('No authenticated user');
      await completeOnboarding(user.id);
      if (__DEV__) console.debug('[Onboarding] local completion stored');
      markOnboardingComplete();
      if (__DEV__) console.debug('[Onboarding] routing Home');
      router.replace('/(tabs)/home');
    }
    catch { Alert.alert('Could Not Finish Onboarding', 'Please try again.'); }
    finally { setFinishing(false); }
  };
  const next = () => index === slides.length - 1 ? void finish() : setIndex(value => value + 1);
  const previous = () => setIndex(value => Math.max(0, value - 1));

  return <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} bounces={false}>
      <View style={styles.topRow}>
        <ThemedText style={styles.pageLabel}>{index + 1} of {slides.length}</ThemedText>
        <Pressable accessibilityRole="button" accessibilityLabel="Skip onboarding" disabled={finishing} onPress={() => void finish()} hitSlop={12}><ThemedText style={styles.skip}>{finishing ? 'Finishing...' : 'Skip'}</ThemedText></Pressable>
      </View>

      <Pressable accessibilityRole="button" accessibilityLabel={`${slide.title}. Continue`} onPress={next} style={[styles.illustrationFrame, { width: illustrationSize, height: illustrationSize }]}>
        <Image source={slide.image} resizeMode="contain" style={styles.illustration} />
      </Pressable>

      <Pressable accessibilityRole="button" accessibilityLabel={`${slide.title}. Continue`} onPress={next} style={styles.copyButton}>
        <ThemedText style={styles.title}>{slide.title}</ThemedText>
        <ThemedText style={styles.description}>{slide.description}</ThemedText>
      </Pressable>

      <View accessibilityRole="tablist" style={styles.dots}>
        {slides.map((item, dotIndex) => <Pressable key={item.title} accessibilityRole="tab" accessibilityLabel={`Go to onboarding page ${dotIndex + 1}: ${item.title}`} accessibilityState={{ selected: index === dotIndex }} onPress={() => setIndex(dotIndex)} hitSlop={10} style={[styles.dotTouch, index === dotIndex && styles.dotTouchActive]}><View style={[styles.dot, index === dotIndex && styles.dotActive]} /></Pressable>)}
      </View>

      <View style={styles.navigation}>
        <Pressable accessibilityRole="button" accessibilityLabel="Previous onboarding page" accessibilityState={{ disabled: index === 0 }} disabled={index === 0 || finishing} onPress={previous} style={[styles.textAction, index === 0 && styles.buttonDisabled]}><ThemedText style={[styles.navigationText, index === 0 && styles.navigationMuted]}>Previous</ThemedText></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={index === slides.length - 1 ? 'Get started' : 'Next onboarding page'} disabled={finishing} onPress={next} style={[styles.textAction, finishing && styles.buttonDisabled]}><ThemedText style={styles.navigationText}>{finishing ? 'Finishing...' : index === slides.length - 1 ? 'Get Started' : 'Next'}</ThemedText></Pressable>
      </View>
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF', overflow: 'hidden' },
  content: { flexGrow: 1, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, backgroundColor: '#FFFFFF' },
  topRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pageLabel: { color: '#66758A', fontSize: 13, fontWeight: '600' },
  skip: { color: '#0A4D9B', fontSize: 18, fontWeight: '700' },
  illustrationFrame: { alignSelf: 'center', overflow: 'hidden', borderRadius: Radius.lg, backgroundColor: '#FFFFFF' },
  illustration: { width: '100%', height: '100%' },
  copyButton: { alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.md },
  title: { color: '#0A4D9B', fontSize: 27, lineHeight: 34, fontWeight: '800', textAlign: 'center' },
  description: { color: '#66758A', fontSize: 15, lineHeight: 23, textAlign: 'center', maxWidth: 420 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 'auto', marginBottom: Spacing.md },
  dotTouch: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dotTouchActive: { backgroundColor: '#E6F2FF' },
  dot: { width: 11, height: 11, borderRadius: 6, backgroundColor: '#D7E7F8' },
  dotActive: { backgroundColor: '#0A4D9B', width: 13, height: 13, borderRadius: 7 },
  navigation: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  textAction: { minWidth: 96, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  buttonDisabled: { opacity: 0.45 },
  navigationText: { color: '#0A4D9B', fontSize: 17, fontWeight: '700' },
  navigationMuted: { opacity: 0.4 },
});
