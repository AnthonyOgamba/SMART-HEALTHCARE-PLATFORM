import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Switch, Text, View } from "react-native";

import { ErrorState, LoadingState, ScreenContainer } from "@/components/ui/screen-states";
import { getUserSettings, updateUserSettings, type UserSettingsUpdate } from "@/lib/services/settings";
import { PageTypography } from "@/constants/theme";
import { reconcileMedicationReminders } from "@/lib/services/local-medication-reminders";
import { getActiveMedications } from "@/lib/services/medications";
import { getUpcomingAppointments } from "@/lib/services/appointments";
import { reconcileAppointmentReminders } from "@/lib/services/local-appointment-reminders";
import { usePalette, type ThemePalette } from '@/hooks/use-palette';

export default function SettingsScreen() {
  const router = useRouter();
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const [medicationReminders, setMedicationReminders] = useState(true);

  const [appointmentReminders, setAppointmentReminders] = useState(true);

  const [criticalAlerts, setCriticalAlerts] = useState(true);

  const [aiInsights, setAiInsights] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(() => {
    setLoading(true);
    setError(null);
    getUserSettings()
      .then((settings) => {
        if (!settings) throw new Error("Settings were not found for this account.");
        setMedicationReminders(settings.medication_reminders);
        setAppointmentReminders(settings.appointment_reminders);
        setCriticalAlerts(settings.critical_alerts);
        setAiInsights(settings.ai_enabled);
      })
      .catch((loadError) =>
        setError(loadError instanceof Error ? loadError.message : "Could not load settings."),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => fetchSettings(), [fetchSettings]);

  const persist = async (
    values: UserSettingsUpdate,
    apply: (value: boolean) => void,
    nextValue: boolean,
    previousValue: boolean,
  ) => {
    apply(nextValue);
    try {
      await updateUserSettings(values);
      if (values.medication_reminders !== undefined) {
        const medications = values.medication_reminders ? await getActiveMedications() : [];
        const granted = await reconcileMedicationReminders(medications, values.medication_reminders);
        if (values.medication_reminders && !granted) {
          Alert.alert("Reminders Disabled", "Medication reminder permission is not enabled on this device.");
        }
      }
      if (values.appointment_reminders !== undefined) {
        const appointments = values.appointment_reminders ? await getUpcomingAppointments() : [];
        const granted = await reconcileAppointmentReminders(appointments, values.appointment_reminders);
        if (values.appointment_reminders && !granted) {
          Alert.alert("Reminders Disabled", "Appointment reminder permission is not enabled on this device.");
        }
      }
    } catch (saveError) {
      apply(previousValue);
      Alert.alert(
        "Could Not Save Setting",
        saveError instanceof Error ? saveError.message : "Try again.",
      );
    }
  };

  if (loading) return <LoadingState label="Loading settings..." />;
  if (error) return <ErrorState message={error} onRetry={fetchSettings} />;

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={theme.primary} />
        </Pressable>

        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>

      <View style={styles.card}>
        <ToggleRow
          icon="medication"
          title="Medication Reminders"
          description="Receive reminders when it is time to take your medication."
          value={medicationReminders}
          onValueChange={(value) =>
            persist(
              { medication_reminders: value },
              setMedicationReminders,
              value,
              medicationReminders,
            )
          }
        />

        <View style={styles.divider} />

        <ToggleRow
          icon="event"
          title="Appointment Reminders"
          description="Receive reminders before your scheduled appointments."
          value={appointmentReminders}
          onValueChange={(value) =>
            persist(
              { appointment_reminders: value },
              setAppointmentReminders,
              value,
              appointmentReminders,
            )
          }
        />

        <View style={styles.divider} />

        <ToggleRow
          icon="notifications-active"
          title="Critical Health Alerts"
          description="Receive important alerts related to health and safety checks."
          value={criticalAlerts}
          onValueChange={(value) =>
            persist({ critical_alerts: value }, setCriticalAlerts, value, criticalAlerts)
          }
        />

        <View style={styles.divider} />

        <ToggleRow
          icon="auto-awesome"
          title="Genie Cares Health Insights"
          description="Receive Genie Cares wellness summaries and health pattern insights."
          value={aiInsights}
          onValueChange={(value) =>
            persist({ ai_enabled: value }, setAiInsights, value, aiInsights)
          }
        />
      </View>

      <Text style={styles.sectionLabel}>SECURITY</Text>
      <View style={styles.card}>
        <NavigationRow
          icon="security"
          title="Security Center"
          description="Review account, health-data, privacy, and Genie Cares safety controls."
          onPress={() => router.push("/security-center" as never)}
        />

        <View style={styles.divider} />

        <NavigationRow
          icon="lock"
          title="Change Password"
          description="Update your account credentials."
          onPress={() => router.push('/change-password' as never)}
        />
      </View>

      <Text style={styles.sectionLabel}>PRIVACY & DATA</Text>

      <View style={styles.card}>
        <NavigationRow
          icon="fact-check"
          title="Consent Management"
          description="Control Genie Cares, health-data, and notification permissions."
          onPress={() => router.push("/consent-management" as never)}
        />

        <View style={styles.divider} />

        <NavigationRow
          icon="privacy-tip"
          title="Privacy Policy"
          description="Review how your information is collected, used, and protected."
          onPress={() => router.push("/privacy-policy" as never)}
        />
      </View>

      <Text style={styles.sectionLabel}>APP</Text>
      <View style={styles.card}>
        <NavigationRow icon="notifications" title="Notifications" description="Review your notification feed." onPress={() => router.push('/notifications' as never)} />
      </View>

      <View style={styles.securityNotice}>
        <MaterialIcons name="shield" size={22} color={theme.primary} />

        <View style={styles.noticeContent}>
          <Text style={styles.noticeTitle}>Health Information Security</Text>

          <Text style={styles.noticeText}>
            Health information is sensitive. The deployed application should
            enforce authentication, authorization, secure database access,
            encryption, validation, and protected API communication.
          </Text>
        </View>
      </View>

      <Text style={styles.version}>Genie Cares 1.0</Text>
    </ScreenContainer>
  );
}

function ToggleRow({
  icon,
  title,
  description,
  value,
  onValueChange,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={styles.row}>
      <View style={styles.icon}>
        <MaterialIcons name={icon} size={22} color={theme.primary} />
      </View>

      <View style={styles.rowContent}>
        <Text style={styles.rowTitle}>{title}</Text>

        <Text style={styles.rowDescription}>{description}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: theme.disabledBackground,
          true: theme.primary,
        }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

function NavigationRow({
  icon,
  title,
  description,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
}) {
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.icon}>
        <MaterialIcons name={icon} size={22} color={theme.primary} />
      </View>

      <View style={styles.rowContent}>
        <Text style={styles.rowTitle}>{title}</Text>

        <Text style={styles.rowDescription}>{description}</Text>
      </View>

      <MaterialIcons name="chevron-right" size={24} color={theme.iconMuted} />
    </Pressable>
  );
}

const makeStyles = (theme: ThemePalette) => StyleSheet.create({
  content: {
    padding: 18,
    paddingBottom: 110,
    gap: 14,
    backgroundColor: theme.screenBg,
  },

  header: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
  },

  headerTitle: {
    color: theme.accent,
    ...PageTypography.title,
  },

  sectionLabel: {
    color: theme.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginTop: 7,
  },

  card: {
    backgroundColor: theme.cardBg,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 16,
    paddingHorizontal: 15,
  },

  row: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
  },

  icon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: theme.backgroundWash,
    alignItems: "center",
    justifyContent: "center",
  },

  rowContent: {
    flex: 1,
  },

  rowTitle: {
    color: theme.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },

  rowDescription: {
    color: theme.textSecondary,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },

  divider: {
    height: 1,
    backgroundColor: theme.cardBorder,
  },

  securityNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    backgroundColor: theme.infoBoxBg,
    borderWidth: 1,
    borderColor: theme.infoBoxBorder,
    borderRadius: 14,
    padding: 15,
  },

  noticeContent: {
    flex: 1,
  },

  noticeTitle: {
    color: theme.primary,
    fontSize: 13,
    fontWeight: "700",
  },

  noticeText: {
    color: theme.infoBoxText,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 3,
  },

  deleteButton: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0BBB5",
    backgroundColor: theme.cardBg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  deleteText: {
    color: "#BA1A1A",
    fontSize: 15,
    fontWeight: "700",
  },

  version: {
    color: theme.textMuted,
    fontSize: 11,
    textAlign: "center",
  },
});
