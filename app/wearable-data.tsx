import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";

import { ScreenContainer } from "@/components/ui/screen-states";

export default function WearableDataScreen() {
  const router = useRouter();

  const [healthSync, setHealthSync] = useState(true);

  const [heartRate, setHeartRate] = useState(true);

  const [sleep, setSleep] = useState(true);

  const [activity, setActivity] = useState(true);

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#00288E" />
        </Pressable>

        <Text style={styles.headerTitle}>Health Data</Text>
      </View>

      <LinearGradient colors={["#005EA4", "#087F8C"]} style={styles.deviceCard}>
        <View style={styles.watchCircle}>
          <MaterialIcons name="watch" size={38} color="#FFFFFF" />
        </View>

        <View style={styles.deviceInfo}>
          <Text style={styles.connectedLabel}>CONNECTED DEVICE</Text>

          <Text style={styles.deviceName}>Health Wearable</Text>

          <Text style={styles.lastSync}>Last synced 4 minutes ago</Text>
        </View>

        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />

          <Text style={styles.liveText}>Live</Text>
        </View>
      </LinearGradient>

      <View style={styles.syncCard}>
        <View style={styles.syncHeader}>
          <View style={styles.syncIcon}>
            <MaterialIcons name="sync" size={24} color="#005EA4" />
          </View>

          <View style={styles.syncInfo}>
            <Text style={styles.syncTitle}>Health Data Sync</Text>

            <Text style={styles.syncSubtitle}>
              Allow HealthNexus to use connected wellness data
            </Text>
          </View>

          <Switch
            value={healthSync}
            onValueChange={setHealthSync}
            trackColor={{
              false: "#C8CDD3",
              true: "#005EA4",
            }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Live Health Summary</Text>

      <View style={styles.metricsGrid}>
        <MetricCard
          icon="favorite"
          title="Heart Rate"
          value="72"
          unit="BPM"
          status="Normal"
          iconColor="#B42318"
          background="#FFE9E7"
        />

        <MetricCard
          icon="directions-walk"
          title="Steps"
          value="8,432"
          unit="steps"
          status="84% goal"
          iconColor="#00714D"
          background="#DFF5EC"
        />

        <MetricCard
          icon="bedtime"
          title="Sleep"
          value="7h 45m"
          status="Good"
          iconColor="#6246A6"
          background="#EEE9F8"
        />

        <MetricCard
          icon="local-fire-department"
          title="Active Energy"
          value="462"
          unit="kcal"
          status="Active"
          iconColor="#C75B12"
          background="#FFF0E3"
        />
      </View>

      <View style={styles.aiCard}>
        <View style={styles.aiHeader}>
          <View style={styles.aiIcon}>
            <MaterialIcons name="psychology" size={26} color="#00288E" />
          </View>

          <View style={styles.aiHeaderText}>
            <Text style={styles.aiTitle}>AI Wearable Insight</Text>

            <Text style={styles.aiSubtitle}>
              Pattern detected from recent data
            </Text>
          </View>
        </View>

        <Text style={styles.aiText}>
          Your activity increased this week while your resting heart rate
          remained stable. Your sleep duration also improved over the last three
          nights.
        </Text>

        <View style={styles.insightPoint}>
          <MaterialIcons name="trending-up" size={19} color="#00714D" />

          <Text style={styles.insightText}>Activity trend is improving</Text>
        </View>

        <View style={styles.insightPoint}>
          <MaterialIcons name="favorite" size={19} color="#B42318" />

          <Text style={styles.insightText}>
            Heart-rate pattern is currently stable
          </Text>
        </View>

        <Pressable
          style={styles.askButton}
          onPress={() => router.push("/(tabs)/assistant" as never)}
        >
          <MaterialIcons name="auto-awesome" size={20} color="#FFFFFF" />

          <Text style={styles.askButtonText}>Ask AI About This Data</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Data Permissions</Text>

      <View style={styles.permissionsCard}>
        <PermissionRow
          icon="favorite"
          title="Heart Rate"
          description="Use heart-rate readings for trends"
          enabled={heartRate}
          setEnabled={setHeartRate}
        />

        <View style={styles.divider} />

        <PermissionRow
          icon="bedtime"
          title="Sleep"
          description="Use sleep duration and patterns"
          enabled={sleep}
          setEnabled={setSleep}
        />

        <View style={styles.divider} />

        <PermissionRow
          icon="directions-walk"
          title="Activity"
          description="Use steps and movement information"
          enabled={activity}
          setEnabled={setActivity}
        />
      </View>

      <View style={styles.privacyCard}>
        <MaterialIcons name="lock" size={22} color="#00714D" />

        <View style={styles.privacyText}>
          <Text style={styles.privacyTitle}>Privacy first</Text>

          <Text style={styles.privacyDescription}>
            Connected health data should only be processed with your permission
            and protected by authenticated access and database security
            controls.
          </Text>
        </View>
      </View>

      <Pressable
        style={styles.analyticsButton}
        onPress={() => router.push("/analytics" as never)}
      >
        <MaterialIcons name="insights" size={21} color="#FFFFFF" />

        <Text style={styles.analyticsButtonText}>View Full Analytics</Text>
      </Pressable>

      <Text style={styles.disclaimer}>
        Wearable readings can vary by device and should not be treated as a
        medical diagnosis.
      </Text>
    </ScreenContainer>
  );
}

function MetricCard({
  icon,
  title,
  value,
  unit,
  status,
  iconColor,
  background,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  value: string;
  unit?: string;
  status: string;
  iconColor: string;
  background: string;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: background }]}>
        <MaterialIcons name={icon} size={22} color={iconColor} />
      </View>

      <Text style={styles.metricTitle}>{title}</Text>

      <View style={styles.metricValueRow}>
        <Text style={styles.metricValue}>{value}</Text>

        {unit ? <Text style={styles.metricUnit}>{unit}</Text> : null}
      </View>

      <Text style={styles.metricStatus}>{status}</Text>
    </View>
  );
}

function PermissionRow({
  icon,
  title,
  description,
  enabled,
  setEnabled,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
  enabled: boolean;
  setEnabled: (value: boolean) => void;
}) {
  return (
    <View style={styles.permissionRow}>
      <View style={styles.permissionIcon}>
        <MaterialIcons name={icon} size={21} color="#005EA4" />
      </View>

      <View style={styles.permissionInfo}>
        <Text style={styles.permissionTitle}>{title}</Text>

        <Text style={styles.permissionDescription}>{description}</Text>
      </View>

      <Switch
        value={enabled}
        onValueChange={setEnabled}
        trackColor={{
          false: "#C8CDD3",
          true: "#005EA4",
        }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 18,
    paddingBottom: 110,
    gap: 16,
    backgroundColor: "#F7F9FB",
  },

  header: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 44,
  },

  headerTitle: {
    color: "#00288E",
    fontSize: 24,
    fontWeight: "700",
  },

  deviceCard: {
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },

  watchCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  deviceInfo: {
    flex: 1,
  },

  connectedLabel: {
    color: "#CDE5FF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },

  deviceName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 3,
  },

  lastSync: {
    color: "#FFFFFF",
    opacity: 0.85,
    fontSize: 11,
    marginTop: 3,
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#6CF8BB",
  },

  liveText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },

  syncCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E5E9",
    borderRadius: 15,
    padding: 15,
  },

  syncHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  syncIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#E4F0FA",
    alignItems: "center",
    justifyContent: "center",
  },

  syncInfo: {
    flex: 1,
  },

  syncTitle: {
    color: "#191C1E",
    fontSize: 14,
    fontWeight: "700",
  },

  syncSubtitle: {
    color: "#707783",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },

  sectionTitle: {
    color: "#191C1E",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 3,
  },

  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 11,
  },

  metricCard: {
    width: "48.5%",
    minHeight: 144,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E5E9",
    borderRadius: 15,
    padding: 14,
  },

  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  metricTitle: {
    color: "#59616D",
    fontSize: 12,
    marginTop: 10,
  },

  metricValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginTop: 2,
  },

  metricValue: {
    color: "#191C1E",
    fontSize: 21,
    fontWeight: "700",
  },

  metricUnit: {
    color: "#707783",
    fontSize: 10,
  },

  metricStatus: {
    color: "#00714D",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 4,
  },

  aiCard: {
    backgroundColor: "#EEF4FF",
    borderWidth: 1,
    borderColor: "#CEDCF5",
    borderRadius: 16,
    padding: 17,
  },

  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  aiIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#DDE8FF",
    alignItems: "center",
    justifyContent: "center",
  },

  aiHeaderText: {
    flex: 1,
  },

  aiTitle: {
    color: "#00288E",
    fontSize: 17,
    fontWeight: "700",
  },

  aiSubtitle: {
    color: "#59616D",
    fontSize: 10,
    marginTop: 2,
  },

  aiText: {
    color: "#344054",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 14,
  },

  insightPoint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 11,
  },

  insightText: {
    flex: 1,
    color: "#444653",
    fontSize: 12,
  },

  askButton: {
    height: 48,
    borderRadius: 11,
    backgroundColor: "#00288E",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },

  askButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  permissionsCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E5E9",
    borderRadius: 15,
    paddingHorizontal: 15,
  },

  permissionRow: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 12,
  },

  permissionIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: "#E4F0FA",
    alignItems: "center",
    justifyContent: "center",
  },

  permissionInfo: {
    flex: 1,
  },

  permissionTitle: {
    color: "#191C1E",
    fontSize: 14,
    fontWeight: "700",
  },

  permissionDescription: {
    color: "#707783",
    fontSize: 10,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: "#EDF0F2",
  },

  privacyCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    backgroundColor: "#ECF8F2",
    borderWidth: 1,
    borderColor: "#CBE8DA",
    borderRadius: 14,
    padding: 15,
  },

  privacyText: {
    flex: 1,
  },

  privacyTitle: {
    color: "#006C49",
    fontSize: 14,
    fontWeight: "700",
  },

  privacyDescription: {
    color: "#59616D",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 3,
  },

  analyticsButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#005EA4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  analyticsButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  disclaimer: {
    color: "#757684",
    fontSize: 10,
    lineHeight: 15,
    textAlign: "center",
    paddingHorizontal: 15,
  },
});
