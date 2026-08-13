import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/ui/screen-states";
import { Brand } from "@/constants/theme";

export default function HealthLogScreen() {
  const router = useRouter();

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Brand.primary} />
        </Pressable>

        <Text style={styles.headerTitle}>Health Log</Text>

        <View style={styles.headerIcon}>
          <MaterialIcons name="health-and-safety" size={23} color={Brand.secondary} />
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <MaterialIcons name="auto-awesome" size={27} color="#FFFFFF" />
        </View>

        <View style={styles.summaryContent}>
          <Text style={styles.summaryLabel}>AI WELLNESS SUMMARY</Text>

          <Text style={styles.summaryTitle}>Your recent health activity</Text>

          <Text style={styles.summaryText}>
            Your medication adherence is strong and your latest symptom
            assessment was classified for monitoring.
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Today</Text>

      <LogCard
        icon="health-and-safety"
        iconColor={Brand.secondary}
        iconBackground={Brand.backgroundWash}
        time="2:10 PM"
        title="Symptom Assessment"
        description="Headache • Moderate severity"
        status="Monitor"
        statusColor={Brand.secondary}
        statusBackground={Brand.backgroundWash}
      />

      <LogCard
        icon="medication"
        iconColor="#00714D"
        iconBackground="#DFF5EC"
        time="8:05 AM"
        title="Vitamin D"
        description="1 tablet • Scheduled 8:00 AM"
        status="Taken"
        statusColor="#00714D"
        statusBackground="#DFF5EC"
      />

      <LogCard
        icon="directions-walk"
        iconColor={Brand.secondary}
        iconBackground={Brand.backgroundWash}
        time="12:30 PM"
        title="Activity Update"
        description="8,432 steps recorded"
        status="Synced"
        statusColor={Brand.secondary}
        statusBackground={Brand.backgroundWash}
      />

      <Text style={styles.sectionTitle}>Yesterday</Text>

      <LogCard
        icon="bedtime"
        iconColor={Brand.secondary}
        iconBackground={Brand.backgroundWash}
        time="7:45 AM"
        title="Sleep Record"
        description="7h 45m total sleep"
        status="Good"
        statusColor="#00714D"
        statusBackground="#DFF5EC"
      />

      <View style={styles.aiCard}>
        <View style={styles.aiHeader}>
          <View style={styles.aiIcon}>
            <MaterialIcons name="psychology" size={25} color={Brand.primary} />
          </View>

          <View style={styles.aiHeaderText}>
            <Text style={styles.aiTitle}>AI Pattern Insight</Text>

            <Text style={styles.aiSubtitle}>Based on your recent logs</Text>
          </View>
        </View>

        <Text style={styles.aiText}>
          Your activity and medication routine have remained consistent.
          Continue tracking symptoms so changes can be compared with your
          wellness patterns over time.
        </Text>

        <Pressable
          style={styles.aiButton}
          onPress={() => router.push("/(tabs)/assistant" as never)}
        >
          <MaterialIcons name="auto-awesome" size={20} color="#FFFFFF" />

          <Text style={styles.aiButtonText}>Ask AI About My Health Log</Text>
        </Pressable>
      </View>

      <View style={styles.privacyCard}>
        <MaterialIcons name="lock" size={21} color={Brand.primary} />

        <View style={styles.privacyText}>
          <Text style={styles.privacyTitle}>Private health information</Text>

          <Text style={styles.privacyDescription}>
            Health logs should only be accessible by the authenticated user and
            protected by database access controls.
          </Text>
        </View>
      </View>

    </ScreenContainer>
  );
}

function LogCard({
  icon,
  iconColor,
  iconBackground,
  time,
  title,
  description,
  status,
  statusColor,
  statusBackground,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  iconBackground: string;
  time: string;
  title: string;
  description: string;
  status: string;
  statusColor: string;
  statusBackground: string;
}) {
  return (
    <View style={styles.logCard}>
      <View
        style={[
          styles.logIcon,
          {
            backgroundColor: iconBackground,
          },
        ]}
      >
        <MaterialIcons name={icon} size={23} color={iconColor} />
      </View>

      <View style={styles.logContent}>
        <Text style={styles.logTime}>{time}</Text>

        <Text style={styles.logTitle}>{title}</Text>

        <Text style={styles.logDescription}>{description}</Text>
      </View>

      <View
        style={[
          styles.statusBadge,
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

const styles = StyleSheet.create({
  content: {
    padding: 18,
    paddingBottom: 110,
    gap: 15,
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
    flex: 1,
    color: Brand.primary,
    fontSize: 24,
    fontWeight: "700",
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E4F0FA",
    alignItems: "center",
    justifyContent: "center",
  },

  summaryCard: {
    backgroundColor: Brand.bannerBackground,
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    gap: 13,
  },

  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  summaryContent: {
    flex: 1,
  },

  summaryLabel: {
    color: "#D5E8FF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },

  summaryTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
    marginTop: 4,
  },

  summaryText: {
    color: "#FFFFFF",
    opacity: 0.9,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  sectionTitle: {
    color: "#191C1E",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 5,
  },

  logCard: {
    minHeight: 92,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E5E9",
    borderRadius: 15,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  logIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  logContent: {
    flex: 1,
  },

  logTime: {
    color: "#858B94",
    fontSize: 9,
    fontWeight: "600",
  },

  logTitle: {
    color: "#191C1E",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
  },

  logDescription: {
    color: "#707783",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
  },

  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  statusText: {
    fontSize: 9,
    fontWeight: "700",
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
    color: Brand.primary,
    fontSize: 16,
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

  aiButton: {
    height: 48,
    borderRadius: 11,
    backgroundColor: Brand.primaryButtonBackground,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },

  aiButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
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
    color: Brand.primary,
    fontSize: 13,
    fontWeight: "700",
  },

  privacyDescription: {
    color: "#59616D",
    fontSize: 10,
    lineHeight: 16,
    marginTop: 3,
  },

});
