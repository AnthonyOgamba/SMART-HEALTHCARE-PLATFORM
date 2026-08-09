import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { IconBadge } from '@/components/ui/icon-badge';
import { HealthMetricRow } from '@/components/ui/health-metric-row';
import { EmptyState, ErrorState, LoadingState, ScreenContainer } from '@/components/ui/screen-states';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusPill } from '@/components/ui/status-pill';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Radius, Spacing } from '@/constants/theme';
import { usePalette, type ThemePalette } from '@/hooks/use-palette';
import { mockDashboard, mockDelay, mockHealthMetrics } from '@/lib/api/mock';
import type { DashboardSummary, HealthMetric } from '@/types';

interface DashboardData {
  summary: DashboardSummary;
  metrics: HealthMetric[];
}

async function loadDashboard(): Promise<DashboardData> {
  // TODO: replace with real calls, e.g.
  // const [summary, metrics] = await Promise.all([
  //   api.get<DashboardSummary>('/dashboard/summary'),
  //   api.get<HealthMetric[]>('/dashboard/metrics'),
  // ]);
  return mockDelay({ summary: mockDashboard, metrics: mockHealthMetrics });
}

export default function DashboardScreen() {
  const router = useRouter();
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    loadDashboard()
      .then(setData)
      .catch(() => setError('Could not load your dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <LoadingState label="Loading your dashboard…" />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!data) return <EmptyState message="Nothing to show yet." />;

  const { summary, metrics } = data;

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.greeting}>Good morning, Ema</ThemedText>
          <ThemedText style={styles.greetingSub}>How are you feeling today?</ThemedText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          onPress={() => router.push('/notifications')}
          hitSlop={8}
          style={styles.bellButton}>
          <MaterialIcons name="notifications-none" size={24} color={theme.iconDefault} />
        </Pressable>
        <View style={styles.avatarPlaceholder}>
          <MaterialIcons name="person" size={22} color={theme.avatarIcon} />
        </View>
      </View>

      {/* Health Summary */}
      <SurfaceCard>
        <SectionHeader label="HEALTH SUMMARY" />
        <View style={{ gap: Spacing.sm }}>
          {metrics.map((metric) => (
            <HealthMetricRow key={metric.id} metric={metric} />
          ))}
        </View>
        <Pressable style={styles.analyticsButton} accessibilityRole="button">
          <ThemedText style={styles.analyticsLabel}>Detailed Analytics</ThemedText>
          <MaterialIcons name="arrow-forward" size={16} color={theme.white} />
        </Pressable>
      </SurfaceCard>

      {/* Today's Medication */}
      <SurfaceCard>
        <SectionHeader
          label="TODAY'S MEDICATION"
          trailing={
            <StatusPill
              label="1/3 COMPLETED"
              color={theme.successPillText}
              backgroundColor={theme.successPillBg}
            />
          }
        />
        <View style={styles.medRow}>
          <IconBadge icon="medication" color={theme.blueIcon} backgroundColor={theme.blueTint} size={36} />
          <View style={{ flex: 1 }}>
            <ThemedText type="defaultSemiBold">Vitamin D</ThemedText>
            <View style={styles.medTimeRow}>
              <MaterialIcons name="schedule" size={14} color={theme.iconMuted} />
              <ThemedText style={styles.medTime}>8:00 AM</ThemedText>
            </View>
          </View>
          <View style={styles.medStatus}>
            <MaterialIcons name="check-circle" size={16} color={theme.greenIcon} />
            <ThemedText style={styles.medStatusText}>Completed</ThemedText>
          </View>
        </View>
      </SurfaceCard>

      {/* Upcoming Appointment */}
      {summary.upcomingAppointment ? (
        <SurfaceCard>
          <SectionHeader
            label="UPCOMING APPOINTMENT"
            trailing={<MaterialIcons name="calendar-today" size={18} color={theme.iconMuted} />}
          />
          <View style={styles.apptRow}>
            <View style={styles.avatarPlaceholder}>
              <MaterialIcons name="person" size={22} color={theme.avatarIcon} />
            </View>
            <View>
              <ThemedText type="defaultSemiBold">
                {summary.upcomingAppointment.title === 'Annual Checkup'
                  ? 'Dr. Sarah Ahmed'
                  : summary.upcomingAppointment.title}
              </ThemedText>
              <ThemedText style={styles.apptSpecialty}>General Physician</ThemedText>
            </View>
          </View>
          <View style={styles.apptTimeRow}>
            <MaterialIcons name="event" size={16} color={theme.primary} />
            <ThemedText style={styles.apptTimeText}>Tomorrow 10:00 AM</ThemedText>
            <View style={{ flex: 1 }} />
            <MaterialIcons name="chevron-right" size={20} color={theme.iconMuted} />
          </View>
        </SurfaceCard>
      ) : null}

      {/* Quick Actions */}
      <View>
        <SectionHeader label="QUICK ACTIONS" />
        <View style={styles.quickActionsRow}>
          <Pressable style={styles.quickActionCard} accessibilityRole="button">
            <MaterialIcons name="mood" size={26} color={theme.accent} />
            <ThemedText style={styles.quickActionLabel}>Track Symptoms</ThemedText>
          </Pressable>
          <Pressable style={styles.quickActionCard} accessibilityRole="button">
            <MaterialIcons name="add-circle-outline" size={26} color={theme.redIcon} />
            <ThemedText style={styles.quickActionLabel}>Book Appointment</ThemedText>
          </Pressable>
        </View>
      </View>

      {/* AI Assistant CTA */}
      <LinearGradient
        colors={[theme.primary, theme.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.ctaBanner}>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.ctaTitle}>Need medical advice?</ThemedText>
          <ThemedText style={styles.ctaSubtitle}>Talk to our trained AI Health Assistant</ThemedText>
        </View>
        <Pressable
          style={styles.ctaButton}
          accessibilityRole="button"
          accessibilityLabel="Open AI Health Assistant"
          onPress={() => router.push('/(tabs)/assistant')}>
          <MaterialIcons name="chat-bubble-outline" size={20} color={theme.primary} />
        </Pressable>
      </LinearGradient>
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    greeting: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.accent,
    },
    greetingSub: {
      fontSize: 13,
      color: theme.textSecondary,
    },
    bellButton: {
      padding: 4,
    },
    avatarPlaceholder: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.avatarBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    analyticsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.xs,
      backgroundColor: theme.primary,
      borderRadius: Radius.pill,
      paddingVertical: Spacing.sm + 2,
      marginTop: Spacing.xs,
    },
    analyticsLabel: {
      color: theme.white,
      fontWeight: '600',
    },
    medRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    medTimeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    medTime: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    medStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    medStatusText: {
      fontSize: 12,
      color: theme.greenIcon,
      fontWeight: '600',
    },
    apptRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    apptSpecialty: {
      fontSize: 13,
      color: theme.accent,
    },
    apptTimeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      backgroundColor: theme.screenBg,
      borderRadius: Radius.md,
      padding: Spacing.sm,
    },
    apptTimeText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.textPrimary,
    },
    quickActionsRow: {
      flexDirection: 'row',
      gap: Spacing.sm,
      marginTop: Spacing.xs,
    },
    quickActionCard: {
      flex: 1,
      backgroundColor: theme.cardBg,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      paddingVertical: Spacing.md,
      alignItems: 'center',
      gap: Spacing.xs,
    },
    quickActionLabel: {
      fontSize: 12,
      fontWeight: '600',
      textAlign: 'center',
      color: theme.textPrimary,
    },
    ctaBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: Radius.lg,
      padding: Spacing.md,
      gap: Spacing.sm,
    },
    ctaTitle: {
      color: theme.white,
      fontWeight: '700',
      fontSize: 15,
    },
    ctaSubtitle: {
      color: theme.white,
      fontSize: 12,
      opacity: 0.9,
    },
    ctaButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.white,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
