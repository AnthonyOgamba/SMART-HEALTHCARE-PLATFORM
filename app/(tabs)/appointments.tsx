import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/ui/screen-states";
import { Brand, PageTypography } from "@/constants/theme";

export default function CareScheduleScreen() {
  const router = useRouter();

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Care Schedule</Text>

          <Text style={styles.subtitle}>Your health activities for today</Text>
        </View>

        <View style={styles.calendarIcon}>
          <MaterialIcons name="calendar-month" size={25} color="#005EA4" />
        </View>
      </View>

      <LinearGradient
        colors={["#00288E", "#087F8C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.aiSummary}
      >
        <View style={styles.aiIcon}>
          <MaterialIcons name="auto-awesome" size={25} color="#FFFFFF" />
        </View>

        <View style={styles.aiContent}>
          <Text style={styles.aiLabel}>AI DAILY SUMMARY</Text>

          <Text style={styles.aiTitle}>You have 3 health activities today</Text>

          <Text style={styles.aiDescription}>
            Your medication routine is on track. Remember to complete your
            evening wellness check.
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.dateRow}>
        <DateCard day="MON" number="10" />
        <DateCard day="TUE" number="11" selected />
        <DateCard day="WED" number="12" />
        <DateCard day="THU" number="13" />
        <DateCard day="FRI" number="14" />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today</Text>

        <View style={styles.todayBadge}>
          <Text style={styles.todayBadgeText}>3 ACTIVITIES</Text>
        </View>
      </View>

      <ScheduleCard
        time="8:00 AM"
        title="Vitamin D"
        description="1 tablet with breakfast"
        icon="medication"
        iconColor="#00714D"
        iconBackground="#DFF5EC"
        status="Completed"
        completed
        onPress={() => router.push("/(tabs)/medications" as never)}
      />

      <ScheduleCard
        time="2:00 PM"
        title="Wellness Check"
        description="Record how you are feeling today"
        icon="health-and-safety"
        iconColor="#005EA4"
        iconBackground="#E4F0FA"
        status="Due"
        onPress={() => router.push("/(tabs)/symptoms" as never)}
      />

      <ScheduleCard
        time="8:30 PM"
        title="Omega 3"
        description="2 capsules with food"
        icon="medical-services"
        iconColor="#6246A6"
        iconBackground="#EEE9F8"
        status="Upcoming"
        onPress={() => router.push("/(tabs)/medications" as never)}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Health Follow-up</Text>
      </View>

      <View style={styles.followUpCard}>
        <View style={styles.followUpTop}>
          <View style={styles.doctorIcon}>
            <MaterialIcons name="medical-services" size={26} color="#005EA4" />
          </View>

          <View style={styles.followUpInfo}>
            <Text style={styles.followUpTitle}>General health follow-up</Text>

            <Text style={styles.followUpSubtitle}>Tomorrow • 10:00 AM</Text>
          </View>

          <View style={styles.reminderBadge}>
            <MaterialIcons
              name="notifications-none"
              size={16}
              color="#005EA4"
            />

            <Text style={styles.reminderText}>Reminder</Text>
          </View>
        </View>

        <Text style={styles.followUpDescription}>
          Review your recent symptoms, medications, and health trends before
          speaking with a healthcare professional.
        </Text>
      </View>

      <View style={styles.aiRecommendationCard}>
        <View style={styles.aiRecommendationHeader}>
          <View style={styles.recommendationIcon}>
            <MaterialIcons name="psychology" size={24} color="#00288E" />
          </View>

          <View style={styles.recommendationTitleArea}>
            <Text style={styles.recommendationTitle}>
              AI Care Recommendation
            </Text>

            <Text style={styles.recommendationSub}>
              Based on your current routine
            </Text>
          </View>
        </View>

        <Text style={styles.recommendationText}>
          You have been consistent with your morning medication. Completing a
          short symptom check later today can provide more context for your
          health trends.
        </Text>

        <Pressable
          style={styles.aiButton}
          onPress={() => router.push("/(tabs)/assistant" as never)}
        >
          <MaterialIcons name="auto-awesome" size={20} color="#FFFFFF" />

          <Text style={styles.aiButtonText}>Ask AI Care</Text>
        </Pressable>
      </View>

      <View style={styles.weekSummary}>
        <View style={styles.weekSummaryHeader}>
          <Text style={styles.weekSummaryTitle}>Weekly Routine</Text>

          <Text style={styles.weekSummaryPercent}>86%</Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>

        <Text style={styles.weekSummaryText}>
          12 of 14 planned health activities completed this week.
        </Text>
      </View>

      <View style={styles.scopeNotice}>
        <MaterialIcons name="info-outline" size={20} color="#59616D" />

        <Text style={styles.scopeText}>
          HealthNexus currently focuses on personal health scheduling and
          reminders. Appointment booking can be managed directly with your
          healthcare provider.
        </Text>
      </View>
    </ScreenContainer>
  );
}

function DateCard({
  day,
  number,
  selected = false,
}: {
  day: string;
  number: string;
  selected?: boolean;
}) {
  return (
    <View style={[styles.dateCard, selected && styles.selectedDateCard]}>
      <Text style={[styles.dateDay, selected && styles.selectedDateText]}>
        {day}
      </Text>

      <Text style={[styles.dateNumber, selected && styles.selectedDateText]}>
        {number}
      </Text>
    </View>
  );
}

function ScheduleCard({
  time,
  title,
  description,
  icon,
  iconColor,
  iconBackground,
  status,
  completed = false,
  onPress,
}: {
  time: string;
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  iconBackground: string;
  status: string;
  completed?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.scheduleCard} onPress={onPress}>
      <View style={styles.timeColumn}>
        <Text style={styles.time}>{time}</Text>

        <View style={styles.timelineLine} />
      </View>

      <View
        style={[
          styles.scheduleIcon,
          {
            backgroundColor: iconBackground,
          },
        ]}
      >
        <MaterialIcons name={icon} size={23} color={iconColor} />
      </View>

      <View style={styles.scheduleInfo}>
        <Text style={styles.scheduleTitle}>{title}</Text>

        <Text style={styles.scheduleDescription}>{description}</Text>
      </View>

      <View
        style={[
          styles.statusBadge,
          completed ? styles.completedBadge : styles.upcomingBadge,
        ]}
      >
        {completed ? (
          <MaterialIcons name="check-circle" size={14} color="#00714D" />
        ) : null}

        <Text
          style={[
            styles.statusText,
            {
              color: completed ? "#00714D" : "#005EA4",
            },
          ]}
        >
          {status}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 18,
    paddingBottom: 120,
    gap: 16,
    backgroundColor: "#F7F9FB",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  title: {
    color: Brand.accent,
    ...PageTypography.title,
  },

  subtitle: {
    color: Brand.textSecondary,
    ...PageTypography.subtitle,
    marginTop: 3,
  },

  calendarIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#E4F0FA",
    alignItems: "center",
    justifyContent: "center",
  },

  aiSummary: {
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

  aiContent: {
    flex: 1,
  },

  aiLabel: {
    color: "#D5E8FF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },

  aiTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 5,
  },

  aiDescription: {
    color: "#FFFFFF",
    opacity: 0.9,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },

  dateRow: {
    flexDirection: "row",
    gap: 7,
  },

  dateCard: {
    flex: 1,
    minHeight: 70,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D8DDE3",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  selectedDateCard: {
    backgroundColor: "#005EA4",
    borderColor: "#005EA4",
  },

  dateDay: {
    color: "#707783",
    fontSize: 10,
    fontWeight: "700",
  },

  dateNumber: {
    color: "#191C1E",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 3,
  },

  selectedDateText: {
    color: "#FFFFFF",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },

  sectionTitle: {
    color: "#191C1E",
    fontSize: 21,
    fontWeight: "700",
  },

  todayBadge: {
    backgroundColor: "#EEF4FF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  todayBadgeText: {
    color: "#005EA4",
    fontSize: 10,
    fontWeight: "700",
  },

  scheduleCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E5E9",
    borderRadius: 15,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  timeColumn: {
    width: 57,
    alignItems: "center",
  },

  time: {
    color: "#404752",
    fontSize: 11,
    fontWeight: "700",
  },

  timelineLine: {
    width: 1,
    height: 17,
    backgroundColor: "#D7DCE1",
    marginTop: 6,
  },

  scheduleIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  scheduleInfo: {
    flex: 1,
  },

  scheduleTitle: {
    color: "#191C1E",
    fontSize: 15,
    fontWeight: "700",
  },

  scheduleDescription: {
    color: "#707783",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  completedBadge: {
    backgroundColor: "#DFF5EC",
  },

  upcomingBadge: {
    backgroundColor: "#E4F0FA",
  },

  statusText: {
    fontSize: 9,
    fontWeight: "700",
  },

  followUpCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E5E9",
    borderRadius: 16,
    padding: 17,
  },

  followUpTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  doctorIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#E4F0FA",
    alignItems: "center",
    justifyContent: "center",
  },

  followUpInfo: {
    flex: 1,
  },

  followUpTitle: {
    color: "#191C1E",
    fontSize: 16,
    fontWeight: "700",
  },

  followUpSubtitle: {
    color: "#59616D",
    fontSize: 12,
    marginTop: 2,
  },

  reminderBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#EEF4FF",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  reminderText: {
    color: "#005EA4",
    fontSize: 9,
    fontWeight: "700",
  },

  followUpDescription: {
    color: "#59616D",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 14,
  },

  aiRecommendationCard: {
    backgroundColor: "#EEF4FF",
    borderWidth: 1,
    borderColor: "#CBDCF3",
    borderRadius: 16,
    padding: 17,
  },

  aiRecommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  recommendationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#DDE8FF",
    alignItems: "center",
    justifyContent: "center",
  },

  recommendationTitleArea: {
    flex: 1,
  },

  recommendationTitle: {
    color: "#00288E",
    fontSize: 16,
    fontWeight: "700",
  },

  recommendationSub: {
    color: "#59616D",
    fontSize: 11,
    marginTop: 2,
  },

  recommendationText: {
    color: "#344054",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 14,
  },

  aiButton: {
    height: 46,
    borderRadius: 11,
    backgroundColor: "#00288E",
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

  weekSummary: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E5E9",
    borderRadius: 16,
    padding: 17,
  },

  weekSummaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  weekSummaryTitle: {
    color: "#191C1E",
    fontSize: 16,
    fontWeight: "700",
  },

  weekSummaryPercent: {
    color: "#00714D",
    fontSize: 20,
    fontWeight: "700",
  },

  progressTrack: {
    height: 8,
    backgroundColor: "#E7EBEF",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 13,
  },

  progressFill: {
    height: "100%",
    width: "86%",
    backgroundColor: "#00714D",
    borderRadius: 999,
  },

  weekSummaryText: {
    color: "#59616D",
    fontSize: 12,
    marginTop: 10,
  },

  scopeNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#F0F2F4",
    borderRadius: 12,
    padding: 14,
  },

  scopeText: {
    flex: 1,
    color: "#59616D",
    fontSize: 11,
    lineHeight: 16,
  },
});
