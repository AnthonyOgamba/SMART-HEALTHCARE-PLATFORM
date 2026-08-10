import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Switch, Text, View } from "react-native";

import { ScreenContainer } from "@/components/ui/screen-states";

export default function ConsentManagementScreen() {
  const router = useRouter();

  const [healthDataSharing, setHealthDataSharing] = useState(true);

  const [aiAssistantUsage, setAiAssistantUsage] = useState(true);

  const [wearableData, setWearableData] = useState(true);

  const [notificationPermissions, setNotificationPermissions] = useState(false);

  const [saved, setSaved] = useState(false);

  const savePreferences = () => {
    setSaved(true);

    Alert.alert(
      "Preferences Saved",
      "Your privacy and consent preferences have been updated.",
    );
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#005EA4" />
        </Pressable>

        <Text style={styles.headerTitle}>Consent Management</Text>

        <MaterialIcons name="privacy-tip" size={24} color="#404752" />
      </View>

      <Text style={styles.intro}>
        Control how your health information is used within HealthNexus. You can
        update these preferences at any time.
      </Text>

      <View style={styles.card}>
        <ConsentRow
          icon="health-and-safety"
          iconColor="#00714D"
          iconBackground="#89FA9B"
          title="Health Data Sharing"
          description="Allow your health information to be used by approved HealthNexus features and services."
          value={healthDataSharing}
          onValueChange={setHealthDataSharing}
        />

        <View style={styles.divider} />

        <ConsentRow
          icon="psychology"
          iconColor="#005EA4"
          iconBackground="#D3E4FF"
          title="AI Assistant Usage"
          description="Allow AI Care to analyze the health information you provide to generate personalized guidance and insights."
          value={aiAssistantUsage}
          onValueChange={setAiAssistantUsage}
        />

        <View style={styles.divider} />

        <ConsentRow
          icon="watch"
          iconColor="#6246A6"
          iconBackground="#EEE9F8"
          title="Wearable Health Data"
          description="Allow connected wearable data such as activity, sleep, and heart-rate information to support health insights."
          value={wearableData}
          onValueChange={setWearableData}
        />

        <View style={styles.divider} />

        <ConsentRow
          icon="notifications-active"
          iconColor="#087F8C"
          iconBackground="#79F6F5"
          title="Notification Permissions"
          description="Receive medication reminders, health alerts, wellness reminders, and other important updates."
          value={notificationPermissions}
          onValueChange={setNotificationPermissions}
        />
      </View>

      <View style={styles.aiNotice}>
        <View style={styles.aiNoticeIcon}>
          <MaterialIcons name="auto-awesome" size={22} color="#6246A6" />
        </View>

        <View style={styles.noticeContent}>
          <Text style={styles.noticeTitle}>AI Consent</Text>

          <Text style={styles.noticeText}>
            If AI Assistant Usage is disabled, AI Care should not process your
            personal health information for personalized analysis.
          </Text>
        </View>
      </View>

      <View style={styles.securityNotice}>
        <MaterialIcons name="shield" size={21} color="#005EA4" />

        <Text style={styles.securityText}>
          Health information is sensitive. Production services should enforce
          authentication, authorization, encryption, secure API communication,
          and database access controls.
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Current Permissions</Text>

        <PermissionStatus label="Health Data" enabled={healthDataSharing} />

        <PermissionStatus label="AI Analysis" enabled={aiAssistantUsage} />

        <PermissionStatus label="Wearable Data" enabled={wearableData} />

        <PermissionStatus
          label="Notifications"
          enabled={notificationPermissions}
        />
      </View>

      <Pressable style={styles.saveButton} onPress={savePreferences}>
        <MaterialIcons name="save" size={20} color="#FFFFFF" />

        <Text style={styles.saveButtonText}>Save Preferences</Text>
      </Pressable>

      <Pressable
        style={styles.securityButton}
        onPress={() => router.push("/security-center" as never)}
      >
        <MaterialIcons name="security" size={20} color="#005EA4" />

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
              false: "#E6E8EA",
              true: "#005EA4",
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
  return (
    <View style={styles.permissionRow}>
      <View style={styles.permissionLeft}>
        <MaterialIcons
          name={enabled ? "check-circle" : "cancel"}
          size={18}
          color={enabled ? "#00714D" : "#BA1A1A"}
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
              color: enabled ? "#00714D" : "#BA1A1A",
            },
          ]}
        >
          {enabled ? "Allowed" : "Disabled"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 110,
    gap: 18,
    backgroundColor: "#F7F9FB",
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
    color: "#005EA4",
    fontSize: 22,
    fontWeight: "700",
  },

  intro: {
    color: "#404752",
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 4,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6E8EA",
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
    color: "#191C1E",
    fontSize: 16,
    fontWeight: "700",
  },

  consentDescription: {
    color: "#707783",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },

  divider: {
    height: 1,
    backgroundColor: "#E6E8EA",
    marginLeft: 58,
  },

  aiNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#F2EEFA",
    borderWidth: 1,
    borderColor: "#DED5EE",
    borderRadius: 12,
    padding: 16,
  },

  aiNoticeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3DAF3",
    alignItems: "center",
    justifyContent: "center",
  },

  noticeContent: {
    flex: 1,
  },

  noticeTitle: {
    color: "#523990",
    fontSize: 14,
    fontWeight: "700",
  },

  noticeText: {
    color: "#59616D",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },

  securityNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#F7F9FB",
    borderWidth: 1,
    borderColor: "#E6E8EA",
    borderRadius: 12,
    padding: 16,
  },

  securityText: {
    flex: 1,
    color: "#707783",
    fontSize: 12,
    lineHeight: 18,
  },

  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6E8EA",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },

  summaryTitle: {
    color: "#191C1E",
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
    color: "#404752",
    fontSize: 13,
    fontWeight: "600",
  },

  permissionBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },

  permissionEnabled: {
    backgroundColor: "#DFF5EC",
  },

  permissionDisabled: {
    backgroundColor: "#FFE9E7",
  },

  permissionBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },

  saveButton: {
    height: 56,
    borderRadius: 12,
    backgroundColor: "#005EA4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,

    shadowColor: "#005EA4",
    shadowOpacity: 0.2,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  securityButton: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#A8CCE5",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  securityButtonText: {
    color: "#005EA4",
    fontSize: 15,
    fontWeight: "700",
  },

  updated: {
    color: "#707783",
    fontSize: 12,
    textAlign: "center",
  },
});
