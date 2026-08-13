import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Switch, Text, View } from "react-native";

import { ErrorState, LoadingState, ScreenContainer } from "@/components/ui/screen-states";
import { getLatestConsents, recordConsent } from "@/lib/services/consents";
import type { ConsentType } from "@/lib/supabase/database.types";
import { PageTypography } from "@/constants/theme";
import { usePalette, type ThemePalette } from '@/hooks/use-palette';

export default function ConsentManagementScreen() {
  const router = useRouter();
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const [healthDataSharing, setHealthDataSharing] = useState(true);

  const [aiAssistantUsage, setAiAssistantUsage] = useState(true);

  const [notificationPermissions, setNotificationPermissions] = useState(false);

  const [saved, setSaved] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConsents = useCallback(() => {
    setLoading(true);
    setError(null);
    getLatestConsents()
      .then((consents) => {
        setHealthDataSharing(consents.health_data?.granted ?? false);
        setAiAssistantUsage(consents.ai_processing?.granted ?? false);
        setNotificationPermissions(consents.notifications?.granted ?? false);
      })
      .catch((loadError) =>
        setError(loadError instanceof Error ? loadError.message : "Could not load consent settings."),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => fetchConsents(), [fetchConsents]);

  const changeConsent = async (
    type: ConsentType,
    granted: boolean,
    apply: (value: boolean) => void,
    previous: boolean,
  ) => {
    apply(granted);
    setSaved(false);
    try {
      await recordConsent(type, granted);
      setSaved(true);
    } catch (saveError) {
      apply(previous);
      Alert.alert(
        "Could Not Save Consent",
        saveError instanceof Error ? saveError.message : "Try again.",
      );
    }
  };

  const savePreferences = () => {
    Alert.alert(
      "Preferences Saved Automatically",
      "Each consent decision is saved when you change its switch.",
    );
  };

  if (loading) return <LoadingState label="Loading consent preferences..." />;
  if (error) return <ErrorState message={error} onRetry={fetchConsents} />;

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={theme.primary} />
        </Pressable>

        <Text style={styles.headerTitle}>Consent Management</Text>

        <MaterialIcons name="privacy-tip" size={24} color={theme.iconDefault} />
      </View>

      <Text style={styles.intro}>
        Control how your health information is used within Genie Cares. You can
        update these preferences at any time.
      </Text>

      <View style={styles.card}>
        <ConsentRow
          icon="health-and-safety"
          iconColor={theme.primary}
          iconBackground={theme.backgroundWash}
          title="Health Data Sharing"
          description="Allow your health information to be used by approved Genie Cares features and services."
          value={healthDataSharing}
          onValueChange={(value) =>
            changeConsent("health_data", value, setHealthDataSharing, healthDataSharing)
          }
        />

        <View style={styles.divider} />

        <ConsentRow
          icon="psychology"
          iconColor={theme.primary}
          iconBackground={theme.backgroundWash}
          title="Genie Cares Usage"
          description="Allow Genie Cares to analyze the health information you provide to generate personalized guidance and insights."
          value={aiAssistantUsage}
          onValueChange={(value) =>
            changeConsent("ai_processing", value, setAiAssistantUsage, aiAssistantUsage)
          }
        />

        <View style={styles.divider} />

        <ConsentRow
          icon="notifications-active"
          iconColor={theme.secondary}
          iconBackground={theme.backgroundWash}
          title="Notification Permissions"
          description="Receive medication reminders, health alerts, wellness reminders, and other important updates."
          value={notificationPermissions}
          onValueChange={(value) =>
            changeConsent(
              "notifications",
              value,
              setNotificationPermissions,
              notificationPermissions,
            )
          }
        />
      </View>

      <View style={styles.aiNotice}>
        <View style={styles.aiNoticeIcon}>
          <MaterialIcons name="auto-awesome" size={22} color={theme.primary} />
        </View>

        <View style={styles.noticeContent}>
          <Text style={styles.noticeTitle}>Genie Cares Consent</Text>

          <Text style={styles.noticeText}>
            If Genie Cares Usage is disabled, Genie Cares should not process your
            personal health information for personalized analysis.
          </Text>
        </View>
      </View>

      <View style={styles.securityNotice}>
        <MaterialIcons name="shield" size={21} color={theme.primary} />

        <Text style={styles.securityText}>
          Health information is sensitive. Production services should enforce
          authentication, authorization, encryption, secure API communication,
          and database access controls.
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Current Permissions</Text>

        <PermissionStatus label="Health Data" enabled={healthDataSharing} />

        <PermissionStatus label="Genie Cares Analysis" enabled={aiAssistantUsage} />

        <PermissionStatus
          label="Notifications"
          enabled={notificationPermissions}
        />
      </View>

      <Pressable style={styles.saveButton} onPress={savePreferences}>
        <MaterialIcons name="save" size={20} color={theme.white} />

        <Text style={styles.saveButtonText}>Save Preferences</Text>
      </Pressable>

      <Pressable
        style={styles.securityButton}
        onPress={() => router.push("/security-center" as never)}
      >
        <MaterialIcons name="security" size={20} color={theme.secondary} />

        <Text style={styles.securityButtonText}>Review Security Center</Text>
      </Pressable>

      <Text style={styles.updated}>
        {saved
          ? "Preferences updated just now"
          : "Review your permissions before continuing"}
      </Text>
    </ScreenContainer>
  );
}

function ConsentRow({
  icon,
  iconColor,
  iconBackground,
  title,
  description,
  value,
  onValueChange,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  iconBackground: string;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={styles.consentRow}>
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: iconBackground,
          },
        ]}
      >
        <MaterialIcons name={icon} size={22} color={iconColor} />
      </View>

      <View style={styles.consentInfo}>
        <View style={styles.titleRow}>
          <Text style={styles.consentTitle}>{title}</Text>

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

        <Text style={styles.consentDescription}>{description}</Text>
      </View>
    </View>
  );
}

function PermissionStatus({
  label,
  enabled,
}: {
  label: string;
  enabled: boolean;
}) {
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={styles.permissionRow}>
      <View style={styles.permissionLeft}>
        <MaterialIcons
          name={enabled ? "check-circle" : "cancel"}
          size={18}
          color={enabled ? theme.greenIcon : theme.redIcon}
        />

        <Text style={styles.permissionLabel}>{label}</Text>
      </View>

      <View
        style={[
          styles.permissionBadge,
          enabled ? styles.permissionEnabled : styles.permissionDisabled,
        ]}
      >
        <Text
          style={[
            styles.permissionBadgeText,
            {
              color: enabled ? theme.greenIcon : theme.redIcon,
            },
          ]}
        >
          {enabled ? "Allowed" : "Disabled"}
        </Text>
      </View>
    </View>
  );
}

const makeStyles = (theme: ThemePalette) => StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 110,
    gap: 18,
    backgroundColor: theme.screenBg,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 40,
    height: 44,
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    color: theme.accent,
    ...PageTypography.title,
  },

  intro: {
    color: theme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 4,
  },

  card: {
    backgroundColor: theme.cardBg,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 20,

    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 2,
  },

  consentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    paddingVertical: 20,
  },

  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },

  consentInfo: {
    flex: 1,
  },

  titleRow: {
    minHeight: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  consentTitle: {
    flex: 1,
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },

  consentDescription: {
    color: theme.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },

  divider: {
    height: 1,
    backgroundColor: theme.cardBorder,
    marginLeft: 58,
  },

  aiNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: theme.infoBoxBg,
    borderWidth: 1,
    borderColor: theme.infoBoxBorder,
    borderRadius: 12,
    padding: 16,
  },

  aiNoticeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.backgroundWash,
    alignItems: "center",
    justifyContent: "center",
  },

  noticeContent: {
    flex: 1,
  },

  noticeTitle: {
    color: theme.secondary,
    fontSize: 14,
    fontWeight: "700",
  },

  noticeText: {
    color: theme.infoBoxText,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },

  securityNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: theme.backgroundWash,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 12,
    padding: 16,
  },

  securityText: {
    flex: 1,
    color: theme.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },

  summaryCard: {
    backgroundColor: theme.cardBg,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },

  summaryTitle: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },

  permissionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  permissionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  permissionLabel: {
    color: theme.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },

  permissionBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },

  permissionEnabled: {
    backgroundColor: theme.greenTint,
  },

  permissionDisabled: {
    backgroundColor: theme.redTint,
  },

  permissionBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },

  saveButton: {
    height: 56,
    borderRadius: 12,
    backgroundColor: theme.primaryButtonBackground,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,

    shadowColor: theme.primary,
    shadowOpacity: 0.2,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  saveButtonText: {
    color: theme.white,
    fontSize: 16,
    fontWeight: "700",
  },

  securityButton: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.infoBoxBorder,
    backgroundColor: theme.cardBg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  securityButtonText: {
    color: theme.secondary,
    fontSize: 15,
    fontWeight: "700",
  },

  updated: {
    color: theme.textMuted,
    fontSize: 12,
    textAlign: "center",
  },
});
