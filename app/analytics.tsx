import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/ui/screen-states";

const heartRateData = [68, 72, 70, 76, 73, 71, 72];
const stepData = [5200, 7200, 6400, 8400, 9100, 7600, 8432];

export default function AnalyticsScreen() {
  const router = useRouter();

  const maxHeartRate = Math.max(...heartRateData);
  const maxSteps = Math.max(...stepData);

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#00288E" />
        </Pressable>

        <Text style={styles.headerTitle}>Health Analytics</Text>

        <Pressable
          style={styles.watchButton}
          onPress={() => router.push("/wearable-data" as never)}
        >
          <MaterialIcons name="watch" size={23} color="#005EA4" />
        </Pressable>
      </View>

      <LinearGradient
        colors={["#00288E", "#006C49"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.aiBanner}
      >
        <View style={styles.aiIcon}>
          <MaterialIcons name="auto-awesome" size={28} color="#FFFFFF" />
        </View>

        <View style={styles.aiBannerText}>
          <Text style={styles.aiLabel}>AI HEALTH INSIGHT</Text>

          <Text style={styles.aiTitle}>Your health looks stable</Text>

          <Text style={styles.aiDescription}>
            Your recent heart rate, sleep, and activity patterns appear
            generally consistent this week.
          </Text>
        </View>
      </LinearGradient>

      <Pressable
        style={styles.wearableCard}
        onPress={() => router.push("/wearable-data" as never)}
      >
        <View style={styles.wearableIcon}>
          <MaterialIcons name="watch" size={26} color="#005EA4" />
        </View>

        <View style={styles.wearableInfo}>
          <Text style={styles.wearableTitle}>Connected Health Data</Text>

          <Text style={styles.wearableSubtitle}>
            Activity, heart rate, and sleep data synced
          </Text>
        </View>

        <View style={styles.connectedBadge}>
          <View style={styles.connectedDot} />

          <Text style={styles.connectedText}>Connected</Text>
        </View>

        <MaterialIcons name="chevron-right" size={24} color="#858B94" />
      </Pressable>

      <Text style={styles.sectionTitle}>Today&apos;s Summary</Text>

      <View style={styles.metricsGrid}>
        <MetricCard
          icon="favorite"
          iconColor="#B42318"
          iconBackground="#FFE9E7"
          label="Heart Rate"
          value="72"
          unit="BPM"
          change="Normal range"
        />

        <MetricCard
          icon="bedtime"
          iconColor="#6246A6"
          iconBackground="#EEE9F8"
          label="Sleep"
          value="7h 45m"
          change="Good"
        />

        <MetricCard
          icon="directions-walk"
          iconColor="#00714D"
          iconBackground="#DFF5EC"
          label="Steps"
          value="8,432"
          change="84% of goal"
        />

        <MetricCard
          icon="water-drop"
          iconColor="#005EA4"
          iconBackground="#E4F0FA"
          label="Hydration"
          value="6"
          unit="cups"
          change="2 remaining"
        />
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>Heart Rate Trend</Text>

            <Text style={styles.cardSubtitle}>Last 7 days</Text>
          </View>

          <View style={styles.normalPill}>
            <View style={styles.greenDot} />

            <Text style={styles.normalText}>Stable</Text>
          </View>
        </View>

        <View style={styles.chart}>
          {heartRateData.map((value, index) => (
            <View key={`${value}-${index}`} style={styles.barColumn}>
              <Text style={styles.barValue}>{value}</Text>

              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.heartBar,
                    {
                      height: `${(value / maxHeartRate) * 100}%`,
                    },
                  ]}
                />
              </View>

              <Text style={styles.dayLabel}>
                {["M", "T", "W", "T", "F", "S", "S"][index]}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>Activity</Text>

            <Text style={styles.cardSubtitle}>Daily step count</Text>
          </View>

          <MaterialIcons name="directions-walk" size={24} color="#00714D" />
        </View>

        <View style={styles.chart}>
          {stepData.map((value, index) => (
            <View key={`${value}-${index}`} style={styles.barColumn}>
              <Text style={styles.smallBarValue}>
                {Math.round(value / 1000)}k
              </Text>

              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.stepBar,
                    {
                      height: `${(value / maxSteps) * 100}%`,
                    },
                  ]}
                />
              </View>

              <Text style={styles.dayLabel}>
                {["M", "T", "W", "T", "F", "S", "S"][index]}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <View style={styles.insightIcon}>
            <MaterialIcons name="psychology" size={26} color="#00288E" />
          </View>

          <View>
            <Text style={styles.insightTitle}>AI Pattern Analysis</Text>

            <Text style={styles.insightSubtitle}>
              Based on recent wellness data
            </Text>
          </View>
        </View>

        <InsightItem
          icon="check-circle"
          text="Your average heart rate has remained consistent."
        />

        <InsightItem
          icon="bedtime"
          text="Sleep duration has improved compared with earlier this week."
        />

        <InsightItem
          icon="trending-up"
          text="Activity is trending upward, with your strongest day on Friday."
        />

        <InsightItem
          icon="info"
          text="More connected health data can improve future AI pattern analysis."
        />
      </View>

      <Pressable
        style={styles.askAiButton}
        onPress={() => router.push("/(tabs)/assistant" as never)}
      >
        <MaterialIcons name="auto-awesome" size={21} color="#FFFFFF" />

        <Text style={styles.askAiText}>Ask AI About My Trends</Text>
      </Pressable>

      <Text style={styles.disclaimer}>
        Health insights are informational and are not a medical diagnosis.
        Contact a healthcare professional if you have concerns about your
        health.
      </Text>
    </ScreenContainer>
  );
}

function MetricCard({
  icon,
  iconColor,
  iconBackground,
  label,
  value,
  unit,
  change,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  iconBackground: string;
  label: string;
  value: string;
  unit?: string;
  change: string;
}) {
  return (
    <View style={styles.metricCard}>
      <View
        style={[
          styles.metricIcon,
          {
            backgroundColor: iconBackground,
          },
        ]}
      >
        <MaterialIcons name={icon} size={22} color={iconColor} />
      </View>

      <Text style={styles.metricLabel}>{label}</Text>

      <View style={styles.valueRow}>
        <Text style={styles.metricValue}>{value}</Text>

        {unit ? <Text style={styles.metricUnit}>{unit}</Text> : null}
      </View>

      <Text style={styles.metricChange}>{change}</Text>
    </View>
  );
}

function InsightItem({
  icon,
  text,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.insightRow}>
      <MaterialIcons name={icon} size={20} color="#005EA4" />

      <Text style={styles.insightText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 110,
    gap: 18,
    backgroundColor: "#F7F9FB",
  },

  header: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 44,
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    color: "#00288E",
    fontSize: 24,
    fontWeight: "700",
  },

  watchButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E4F0FA",
    alignItems: "center",
    justifyContent: "center",
  },

  aiBanner: {
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    gap: 14,
  },

  aiIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  aiBannerText: {
    flex: 1,
  },

  aiLabel: {
    color: "#CDE5FF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },

  aiTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "700",
    marginTop: 4,
  },

  aiDescription: {
    color: "#FFFFFF",
    opacity: 0.9,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
  },

  wearableCard: {
    minHeight: 82,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E5E9",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  wearableIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#E4F0FA",
    alignItems: "center",
    justifyContent: "center",
  },

  wearableInfo: {
    flex: 1,
  },

  wearableTitle: {
    color: "#191C1E",
    fontSize: 14,
    fontWeight: "700",
  },

  wearableSubtitle: {
    color: "#707783",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },

  connectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DFF5EC",
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  connectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#00714D",
  },

  connectedText: {
    color: "#00714D",
    fontSize: 9,
    fontWeight: "700",
  },

  sectionTitle: {
    color: "#191C1E",
    fontSize: 21,
    fontWeight: "700",
  },

  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  metricCard: {
    width: "48%",
    minHeight: 150,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E8EC",
    borderRadius: 16,
    padding: 15,
  },

  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  metricLabel: {
    color: "#59616D",
    fontSize: 13,
    marginTop: 12,
  },

  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginTop: 2,
  },

  metricValue: {
    color: "#191C1E",
    fontSize: 22,
    fontWeight: "700",
  },

  metricUnit: {
    color: "#59616D",
    fontSize: 12,
    fontWeight: "600",
  },

  metricChange: {
    color: "#00714D",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 5,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E8EC",
    borderRadius: 16,
    padding: 18,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  cardTitle: {
    color: "#191C1E",
    fontSize: 19,
    fontWeight: "700",
  },

  cardSubtitle: {
    color: "#707783",
    fontSize: 12,
    marginTop: 2,
  },

  normalPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#DFF5EC",
  },

  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#00714D",
  },

  normalText: {
    color: "#00714D",
    fontSize: 11,
    fontWeight: "700",
  },

  chart: {
    height: 180,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 22,
  },

  barColumn: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
  },

  barTrack: {
    width: 18,
    height: 125,
    backgroundColor: "#EDF1F5",
    borderRadius: 9,
    justifyContent: "flex-end",
    overflow: "hidden",
  },

  heartBar: {
    width: "100%",
    backgroundColor: "#005EA4",
    borderRadius: 9,
  },

  stepBar: {
    width: "100%",
    backgroundColor: "#00714D",
    borderRadius: 9,
  },

  barValue: {
    color: "#444653",
    fontSize: 10,
    marginBottom: 5,
  },

  smallBarValue: {
    color: "#444653",
    fontSize: 9,
    marginBottom: 5,
  },

  dayLabel: {
    color: "#757684",
    fontSize: 11,
    marginTop: 6,
  },

  insightCard: {
    backgroundColor: "#EEF4FF",
    borderWidth: 1,
    borderColor: "#CEDCF5",
    borderRadius: 16,
    padding: 18,
    gap: 15,
  },

  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  insightIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#DDE8FF",
    alignItems: "center",
    justifyContent: "center",
  },

  insightTitle: {
    color: "#00288E",
    fontSize: 18,
    fontWeight: "700",
  },

  insightSubtitle: {
    color: "#59616D",
    fontSize: 12,
  },

  insightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  insightText: {
    flex: 1,
    color: "#344054",
    fontSize: 14,
    lineHeight: 20,
  },

  askAiButton: {
    height: 54,
    borderRadius: 12,
    backgroundColor: "#00288E",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  askAiText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  disclaimer: {
    color: "#757684",
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    paddingHorizontal: 14,
  },
});
