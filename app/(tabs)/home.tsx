import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { HealthMetricRow } from "@/components/ui/health-metric-row";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  ScreenContainer,
} from "@/components/ui/screen-states";
import { SectionHeader } from "@/components/ui/section-header";
import { SurfaceCard } from "@/components/ui/surface-card";
import { Radius, Spacing } from "@/constants/theme";
import { usePalette, type ThemePalette } from "@/hooks/use-palette";
import { mockDashboard, mockDelay, mockHealthMetrics } from "@/lib/api/mock";
import type { DashboardSummary, HealthMetric } from "@/types";
import { useProfile } from "@/providers/profile-provider";

interface DashboardData {
  summary: DashboardSummary;
  metrics: HealthMetric[];
}

async function loadDashboard(): Promise<DashboardData> {
  return mockDelay({
    summary: mockDashboard,
    metrics: mockHealthMetrics,
  });
}

export default function DashboardScreen() {
  const router = useRouter();
  const { profile } = useProfile();

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
      .catch(() => setError("Could not load your dashboard."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <LoadingState label="Loading your dashboard..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  if (!data) {
    return <EmptyState message="Nothing to show yet." />;
  }

  const { summary, metrics } = data;
  const hour = new Date().getHours();
  const dayPart = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  const firstName = profile?.full_name.trim().split(/\s+/)[0];
  const greeting = firstName ? `Good ${dayPart}, ${firstName}` : `Good ${dayPart}`;

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <ThemedText style={styles.greeting}>{greeting}</ThemedText>

          <ThemedText style={styles.greetingSub}>
            How are you feeling today?
          </ThemedText>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          onPress={() => router.push("/notifications" as never)}
          hitSlop={8}
          style={styles.bellButton}
        >
          <MaterialIcons
            name="notifications-none"
            size={24}
            color={theme.iconDefault}
          />
        </Pressable>

      </View>

      {/* Health Summary */}
      <SurfaceCard>
        <SectionHeader label="HEALTH SUMMARY" />

        <View style={styles.metricList}>
          {metrics.map((metric) => (
            <HealthMetricRow key={metric.id} metric={metric} />
          ))}
        </View>

      </SurfaceCard>

      {/* Upcoming Appointment */}
      {summary.upcomingAppointment ? (
        <SurfaceCard>
          <SectionHeader
            label="UPCOMING APPOINTMENT"
            trailing={
              <MaterialIcons
                name="calendar-today"
                size={18}
                color={theme.iconMuted}
              />
            }
          />

          <View style={styles.apptRow}>
            <View style={styles.avatarPlaceholder}>
              <MaterialIcons name="person" size={22} color={theme.avatarIcon} />
            </View>

            <View style={styles.apptInfo}>
              <ThemedText type="defaultSemiBold">
                {summary.upcomingAppointment.title === "Annual Checkup"
                  ? "Dr. Sarah Ahmed"
                  : summary.upcomingAppointment.title}
              </ThemedText>

              <ThemedText style={styles.apptSpecialty}>
                General Physician
              </ThemedText>
            </View>
          </View>

          <View style={styles.apptTimeRow}>
            <MaterialIcons name="event" size={16} color={theme.primary} />

            <ThemedText style={styles.apptTimeText}>
              Tomorrow 10:00 AM
            </ThemedText>

            <View style={styles.spacer} />

            <MaterialIcons
              name="chevron-right"
              size={20}
              color={theme.iconMuted}
            />
          </View>
        </SurfaceCard>
      ) : null}

      {/* Quick Actions */}
      <View>
        <SectionHeader label="QUICK ACTIONS" />

        <View style={styles.quickActionsRow}>
          <Pressable
            style={styles.quickActionCard}
            accessibilityRole="button"
            onPress={() => router.push("/(tabs)/symptoms" as never)}
          >
            <View style={styles.symptomIcon}>
              <MaterialIcons
                name="health-and-safety"
                size={26}
                color="#005EA4"
              />
            </View>

            <ThemedText style={styles.quickActionLabel}>
              Track Symptoms
            </ThemedText>

            <ThemedText style={styles.quickActionSub}>
              AI-guided health check
            </ThemedText>
          </Pressable>

        </View>
      </View>

      {/* AI Assistant */}
      <LinearGradient
        colors={[theme.primary, theme.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.ctaBanner}
      >
        <View style={styles.ctaContent}>
          <View style={styles.aiBadge}>
            <MaterialIcons name="auto-awesome" size={22} color="#FFFFFF" />
          </View>

          <View style={styles.ctaText}>
            <ThemedText style={styles.ctaTitle}>
              Need health guidance?
            </ThemedText>

            <ThemedText style={styles.ctaSubtitle}>
              Ask AI Care about symptoms, medications, or your health trends.
            </ThemedText>
          </View>
        </View>

        <Pressable
          style={styles.ctaButton}
          accessibilityRole="button"
          accessibilityLabel="Open AI Care Assistant"
          onPress={() => router.push("/(tabs)/assistant" as never)}
        >
          <MaterialIcons name="arrow-forward" size={21} color={theme.primary} />
        </Pressable>
      </LinearGradient>

      {/* Safety message */}
      <View style={styles.safetyCard}>
        <MaterialIcons name="verified-user" size={22} color="#00714D" />

        <View style={styles.safetyText}>
          <ThemedText style={styles.safetyTitle}>
            Your health data matters
          </ThemedText>

          <ThemedText style={styles.safetyDescription}>
            AI features provide informational guidance and do not replace
            professional medical care.
          </ThemedText>
        </View>
      </View>
    </ScreenContainer>
  );
}

const makeStyles = (theme: ThemePalette) =>
  StyleSheet.create({
    content: {
      padding: Spacing.md,
      gap: Spacing.md,
      backgroundColor: theme.screenBg,
      paddingBottom: 110,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.sm,
    },

    headerText: {
      flex: 1,
    },

    greeting: {
      fontSize: 20,
      fontWeight: "700",
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
      alignItems: "center",
      justifyContent: "center",
    },

    metricList: {
      gap: Spacing.sm,
    },

    analyticsButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.xs,
      backgroundColor: theme.primary,
      borderRadius: Radius.pill,
      paddingVertical: Spacing.sm + 2,
      marginTop: Spacing.xs,
    },

    analyticsLabel: {
      color: theme.white,
      fontWeight: "600",
    },

    medRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.sm,
    },

    medInfo: {
      flex: 1,
    },

    medTimeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },

    medTime: {
      fontSize: 12,
      color: theme.textSecondary,
    },

    medStatus: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },

    medStatusText: {
      fontSize: 12,
      color: theme.greenIcon,
      fontWeight: "600",
    },

    apptRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.sm,
    },

    apptInfo: {
      flex: 1,
    },

    apptSpecialty: {
      fontSize: 13,
      color: theme.accent,
    },

    apptTimeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.xs,
      backgroundColor: theme.screenBg,
      borderRadius: Radius.md,
      padding: Spacing.sm,
    },

    apptTimeText: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.textPrimary,
    },

    spacer: {
      flex: 1,
    },

    quickActionsRow: {
      flexDirection: "row",
      gap: Spacing.sm,
      marginTop: Spacing.xs,
    },

    quickActionCard: {
      flex: 1,
      minHeight: 130,
      backgroundColor: theme.cardBg,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.sm,
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },

    symptomIcon: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: "#E4F0FA",
      alignItems: "center",
      justifyContent: "center",
    },

    aiInsightIcon: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: "#EEE9F8",
      alignItems: "center",
      justifyContent: "center",
    },

    quickActionLabel: {
      fontSize: 13,
      fontWeight: "700",
      textAlign: "center",
      color: theme.textPrimary,
    },

    quickActionSub: {
      fontSize: 10,
      textAlign: "center",
      color: theme.textSecondary,
    },

    ctaBanner: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: Radius.lg,
      padding: Spacing.md,
      gap: Spacing.sm,
    },

    ctaContent: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    aiBadge: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: "rgba(255,255,255,0.15)",
      alignItems: "center",
      justifyContent: "center",
    },

    ctaText: {
      flex: 1,
    },

    ctaTitle: {
      color: theme.white,
      fontWeight: "700",
      fontSize: 15,
    },

    ctaSubtitle: {
      color: theme.white,
      fontSize: 12,
      lineHeight: 17,
      opacity: 0.9,
    },

    ctaButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: theme.white,
      alignItems: "center",
      justifyContent: "center",
    },

    safetyCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      backgroundColor: "#ECF8F2",
      borderWidth: 1,
      borderColor: "#CBE8DA",
      borderRadius: Radius.md,
      padding: Spacing.md,
    },

    safetyText: {
      flex: 1,
    },

    safetyTitle: {
      color: "#006C49",
      fontSize: 13,
      fontWeight: "700",
    },

    safetyDescription: {
      color: theme.textSecondary,
      fontSize: 11,
      lineHeight: 16,
      marginTop: 2,
    },
  });
