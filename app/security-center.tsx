import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";

import { ScreenContainer } from "@/components/ui/screen-states";
import { PageBanner } from "@/components/ui/page-banner";
import { usePalette, type ThemePalette } from '@/hooks/use-palette';

export default function SecurityCenterScreen() {
  const router = useRouter();
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const [hideSensitiveNotifications, setHideSensitiveNotifications] =
    useState(true);

  const [biometricLock, setBiometricLock] = useState(false);

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={theme.primary} />
        </Pressable>

        <Text style={styles.headerTitle}>Security Center</Text>
      </View>

      <PageBanner icon="verified-user" title="Protecting your health information" description="Health information is sensitive. This area brings together account, privacy, consent, and device-security controls." />

      <Text style={styles.sectionLabel}>ACCOUNT SECURITY</Text>

      <View style={styles.card}>
        <SecurityItem
          icon="lock"
          title="Secure Authentication"
          description="Access to personal health information requires an authenticated account."
          status="Required"
          statusColor={theme.primary}
          statusBackground={theme.backgroundWash}
        />

        <View style={styles.divider} />

        <SecurityItem
          icon="security"
          title="Password Protection"
          description="Account credentials are managed separately from health information."
          status="Enabled"
          statusColor={theme.primary}
          statusBackground={theme.backgroundWash}
        />

        <View style={styles.divider} />

        <SecurityItem
          icon="logout"
          title="Session Protection"
          description="Users should sign out on shared devices and inactive sessions should expire."
          status="Important"
          statusColor={theme.primary}
          statusBackground={theme.backgroundWash}
        />
      </View>

      <Text style={styles.sectionLabel}>DEVICE PRIVACY</Text>

      <View style={styles.card}>
        <ToggleSecurityRow
          icon="fingerprint"
          title="Biometric App Lock"
          description="Require device authentication before opening protected health information."
          value={biometricLock}
          onValueChange={setBiometricLock}
        />

        <View style={styles.divider} />

        <ToggleSecurityRow
          icon="notifications-off"
          title="Hide Sensitive Notifications"
          description="Avoid showing health details directly on the device lock screen."
          value={hideSensitiveNotifications}
          onValueChange={setHideSensitiveNotifications}
        />
      </View>

      <Text style={styles.sectionLabel}>HEALTH DATA PROTECTION</Text>

      <View style={styles.protectionGrid}>
        <ProtectionCard
          icon="storage"
          title="Database Access"
          text="Health records should only be accessible to the authenticated user."
        />

        <ProtectionCard
          icon="lock"
          title="Encryption"
          text="Sensitive data should be encrypted during transmission and protected at rest."
        />

        <ProtectionCard
          icon="check-circle"
          title="Input Validation"
          text="User and Genie Cares inputs should be validated before processing or storage."
        />

        <ProtectionCard
          icon="visibility"
          title="Least Access"
          text="Users and services should receive only the permissions they need."
        />
      </View>

      <Text style={styles.sectionLabel}>GENIE CARES SAFETY</Text>

      <View style={styles.aiSafetyCard}>
        <View style={styles.aiHeader}>
          <View style={styles.aiIcon}>
            <MaterialIcons name="psychology" size={25} color={theme.primary} />
          </View>

          <View style={styles.aiHeaderText}>
            <Text style={styles.aiTitle}>Safe Genie Cares Health Guidance</Text>

            <Text style={styles.aiSubtitle}>
              Additional safeguards for Genie Cares health guidance
            </Text>
          </View>
        </View>

        <SafetyPoint text="Genie Cares responses should provide guidance, not claim to diagnose the patient." />

        <SafetyPoint text="Emergency or red-flag symptoms should direct users to emergency services or professional care." />

        <SafetyPoint text="Genie Cares should not tell users to stop or change prescribed medication without professional advice." />

        <SafetyPoint text="Genie Cares access to personal health information should depend on user consent." />
      </View>

      <Text style={styles.sectionLabel}>PRIVACY CONTROLS</Text>

      <Pressable
        style={styles.navCard}
        onPress={() => router.push("/privacy-policy" as never)}
      >
        <View style={styles.navIconBlue}>
          <MaterialIcons name="privacy-tip" size={24} color={theme.primary} />
        </View>

        <View style={styles.navContent}>
          <Text style={styles.navTitle}>Privacy Policy</Text>

          <Text style={styles.navText}>
            Review what information is collected and how it is used.
          </Text>
        </View>

        <MaterialIcons name="chevron-right" size={25} color={theme.iconMuted} />
      </Pressable>

      <View style={styles.reminderCard}>
        <MaterialIcons name="info-outline" size={21} color={theme.primary} />

        <Text style={styles.reminderText}>
          Frontend controls are only one layer of security. Authentication,
          authorization, database rules, encryption, secure API handling, secret
          management, and server-side validation must also be enforced by the
          deployed application.
        </Text>
      </View>
    </ScreenContainer>
  );
}

function SecurityItem({
  icon,
  title,
  description,
  status,
  statusColor,
  statusBackground,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
  status: string;
  statusColor: string;
  statusBackground: string;
}) {
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={styles.securityRow}>
      <View style={styles.securityIcon}>
        <MaterialIcons name={icon} size={22} color={theme.primary} />
      </View>

      <View style={styles.securityInfo}>
        <Text style={styles.securityTitle}>{title}</Text>

        <Text style={styles.securityDescription}>{description}</Text>
      </View>

      <View
        style={[
          styles.statusPill,
          {
            backgroundColor: statusBackground,
          },
        ]}
      >
        <Text
          style={[
            styles.statusText,
            {
              color: statusColor,
            },
          ]}
        >
          {status}
        </Text>
      </View>
    </View>
  );
}

function ToggleSecurityRow({
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
    <View style={styles.securityRow}>
      <View style={styles.securityIcon}>
        <MaterialIcons name={icon} size={22} color={theme.primary} />
      </View>

      <View style={styles.securityInfo}>
        <Text style={styles.securityTitle}>{title}</Text>

        <Text style={styles.securityDescription}>{description}</Text>
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

function ProtectionCard({
  icon,
  title,
  text,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  text: string;
}) {
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={styles.protectionCard}>
      <View style={styles.protectionIcon}>
        <MaterialIcons name={icon} size={23} color={theme.primary} />
      </View>

      <Text style={styles.protectionTitle}>{title}</Text>

      <Text style={styles.protectionText}>{text}</Text>
    </View>
  );
}

function SafetyPoint({ text }: { text: string }) {
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={styles.safetyPoint}>
      <MaterialIcons name="check-circle" size={19} color={theme.primary} />

      <Text style={styles.safetyPointText}>{text}</Text>
    </View>
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },

  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
  },

  headerTitle: {
    color: theme.accent,
    fontSize: 24,
    fontWeight: "700",
  },

  heroCard: {
    alignItems: "center",
    backgroundColor: theme.primary,
    borderRadius: 18,
    padding: 24,
  },

  shield: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 13,
  },

  heroText: {
    color: "#D8E1FF",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 7,
  },

  sectionLabel: {
    color: theme.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginTop: 8,
  },

  card: {
    backgroundColor: theme.cardBg,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 16,
    paddingHorizontal: 15,
  },

  securityRow: {
    minHeight: 86,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 14,
  },

  securityIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: theme.backgroundWash,
    alignItems: "center",
    justifyContent: "center",
  },

  securityInfo: {
    flex: 1,
  },

  securityTitle: {
    color: theme.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },

  securityDescription: {
    color: theme.textSecondary,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },

  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  statusText: {
    fontSize: 9,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: theme.cardBorder,
  },

  protectionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  protectionCard: {
    width: "48.5%",
    minHeight: 145,
    backgroundColor: theme.cardBg,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 15,
    padding: 14,
  },

  protectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.blueTint,
    alignItems: "center",
    justifyContent: "center",
  },

  protectionTitle: {
    color: theme.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 10,
  },

  protectionText: {
    color: theme.textSecondary,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 5,
  },

  aiSafetyCard: {
    backgroundColor: theme.backgroundWash,
    borderWidth: 1,
    borderColor: theme.infoBoxBorder,
    borderRadius: 16,
    padding: 17,
    gap: 13,
  },

  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  aiIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.infoBoxBg,
    alignItems: "center",
    justifyContent: "center",
  },

  aiHeaderText: {
    flex: 1,
  },

  aiTitle: {
    color: theme.secondary,
    fontSize: 16,
    fontWeight: "700",
  },

  aiSubtitle: {
    color: theme.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },

  safetyPoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },

  safetyPointText: {
    flex: 1,
    color: theme.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },

  navCard: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: theme.cardBg,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 15,
    padding: 14,
  },

  navIconGreen: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: theme.backgroundWash,
    alignItems: "center",
    justifyContent: "center",
  },

  navIconBlue: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: theme.blueTint,
    alignItems: "center",
    justifyContent: "center",
  },

  navContent: {
    flex: 1,
  },

  navTitle: {
    color: theme.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },

  navText: {
    color: theme.textSecondary,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
  },

  reminderCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: theme.infoBoxBg,
    borderRadius: 13,
    padding: 15,
    marginTop: 3,
  },

  reminderText: {
    flex: 1,
    color: theme.infoBoxText,
    fontSize: 11,
    lineHeight: 17,
  },
});
