import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/ui/screen-states";

const dates = [
  { day: "MON", number: 12 },
  { day: "TUE", number: 13 },
  { day: "WED", number: 14 },
  { day: "THU", number: 15 },
  { day: "FRI", number: 16 },
];

export default function MedicationHistoryScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(14);

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={23} color="#00288E" />
        </Pressable>

        <Text style={styles.headerTitle}>Meds History</Text>
      </View>

      <View style={styles.tabs}>
        <Pressable
          style={styles.inactiveTab}
          onPress={() => router.replace("/(tabs)/medications" as never)}
        >
          <Text style={styles.inactiveText}>Today</Text>
        </Pressable>

        <View style={styles.activeTab}>
          <Text style={styles.activeText}>History</Text>
        </View>
      </View>

      <View style={styles.dateHeading}>
        <Text style={styles.sectionTitle}>Select Date</Text>

        <Pressable style={styles.calendarButton}>
          <MaterialIcons name="calendar-month" size={17} color="#00288E" />

          <Text style={styles.calendarText}>Full Calendar</Text>
        </Pressable>
      </View>

      <View style={styles.dateRow}>
        {dates.map((date) => {
          const selected = selectedDate === date.number;

          return (
            <Pressable
              key={date.number}
              style={[styles.dateCard, selected && styles.selectedDateCard]}
              onPress={() => setSelectedDate(date.number)}
            >
              <Text
                style={[styles.dateDay, selected && styles.selectedDateText]}
              >
                {date.day}
              </Text>

              <Text
                style={[styles.dateNumber, selected && styles.selectedDateText]}
              >
                {date.number}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.groupTitle}>WEDNESDAY, AUGUST 14</Text>

      <HistoryCard
        name="Lisinopril"
        dose="10mg • 08:00 AM"
        status="Taken 08:05 AM"
        taken
        icon="medication"
      />

      <HistoryCard
        name="Metformin"
        dose="500mg • 09:30 AM"
        status="Taken 09:35 AM"
        taken
        icon="medication-liquid"
      />

      <Text style={styles.groupTitle}>TUESDAY, AUGUST 13</Text>

      <HistoryCard
        name="Lisinopril"
        dose="10mg • 08:00 AM"
        status="Taken 08:00 AM"
        taken
        icon="medication"
      />

      <HistoryCard
        name="Multivitamin"
        dose="1 tablet • 01:00 PM"
        status="Skipped"
        taken={false}
        icon="medication"
      />

      <HistoryCard
        name="Atorvastatin"
        dose="20mg • 09:00 PM"
        status="Taken 09:15 PM"
        taken
        icon="medication-liquid"
      />

      <Text style={styles.groupTitle}>COMPLIANCE INSIGHTS</Text>

      <View style={styles.adherenceCard}>
        <Text style={styles.adherenceLabel}>WEEKLY ADHERENCE</Text>

        <Text style={styles.adherencePercent}>94%</Text>

        <Text style={styles.adherenceText}>
          You completed nearly all scheduled doses this week. Keep following
          your medication plan.
        </Text>
      </View>

      <View style={styles.streakCard}>
        <View style={styles.streakIcon}>
          <MaterialIcons name="trending-up" size={24} color="#00714D" />
        </View>

        <Text style={styles.streakLabel}>STREAK</Text>

        <Text style={styles.streakValue}>5 Days</Text>

        <Text style={styles.streakBest}>Personal best: 12 days</Text>
      </View>
    </ScreenContainer>
  );
}

function HistoryCard({
  name,
  dose,
  status,
  taken,
  icon,
}: {
  name: string;
  dose: string;
  status: string;
  taken: boolean;
  icon: keyof typeof MaterialIcons.glyphMap;
}) {
  return (
    <View style={[styles.historyCard, !taken && styles.skippedCard]}>
      <View
        style={[styles.medIcon, taken ? styles.takenIcon : styles.skippedIcon]}
      >
        <MaterialIcons
          name={icon}
          size={22}
          color={taken ? "#00714D" : "#BA1A1A"}
        />
      </View>

      <View style={styles.historyInfo}>
        <Text style={styles.historyName}>{name}</Text>

        <Text style={styles.historyDose}>{dose}</Text>
      </View>

      <View style={styles.historyStatus}>
        <MaterialIcons
          name={taken ? "check-circle" : "cancel"}
          size={22}
          color={taken ? "#00714D" : "#BA1A1A"}
        />

        <Text
          style={[
            styles.historyStatusText,
            {
              color: taken ? "#00714D" : "#BA1A1A",
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
    padding: 16,
    paddingBottom: 110,
    gap: 14,
    backgroundColor: "#F8F9FF",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  backButton: {
    width: 42,
    height: 44,
    justifyContent: "center",
  },

  headerTitle: {
    color: "#00288E",
    fontSize: 24,
    fontWeight: "700",
  },

  tabs: {
    flexDirection: "row",
    padding: 4,
    backgroundColor: "#EEF4FF",
    borderRadius: 999,
  },

  inactiveTab: {
    flex: 1,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },

  activeTab: {
    flex: 1,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00288E",
    borderRadius: 999,
  },

  inactiveText: {
    color: "#444653",
    fontSize: 13,
    fontWeight: "600",
  },

  activeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  dateHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },

  sectionTitle: {
    color: "#121C28",
    fontSize: 22,
    fontWeight: "700",
  },

  calendarButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  calendarText: {
    color: "#00288E",
    fontSize: 13,
  },

  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },

  dateCard: {
    flex: 1,
    minHeight: 78,
    borderWidth: 1,
    borderColor: "#C4C5D5",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  selectedDateCard: {
    backgroundColor: "#00288E",
    borderColor: "#00288E",
  },

  dateDay: {
    color: "#757684",
    fontSize: 10,
    fontWeight: "700",
  },

  dateNumber: {
    color: "#121C28",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 3,
  },

  selectedDateText: {
    color: "#FFFFFF",
  },

  groupTitle: {
    color: "#757684",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.7,
    marginTop: 12,
  },

  historyCard: {
    minHeight: 88,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#C4C5D5",
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },

  skippedCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#BA1A1A",
  },

  medIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  takenIcon: {
    backgroundColor: "#6CF8BB",
  },

  skippedIcon: {
    backgroundColor: "#FFDAD6",
  },

  historyInfo: {
    flex: 1,
  },

  historyName: {
    color: "#121C28",
    fontSize: 16,
    fontWeight: "600",
  },

  historyDose: {
    color: "#757684",
    fontSize: 12,
    marginTop: 3,
  },

  historyStatus: {
    alignItems: "flex-end",
    gap: 4,
  },

  historyStatusText: {
    fontSize: 10,
    fontWeight: "700",
  },

  adherenceCard: {
    backgroundColor: "#163DAF",
    borderRadius: 24,
    padding: 22,
    marginTop: 2,
  },

  adherenceLabel: {
    color: "#FFFFFF",
    opacity: 0.8,
    fontSize: 11,
    fontWeight: "700",
  },

  adherencePercent: {
    color: "#FFFFFF",
    fontSize: 46,
    fontWeight: "700",
    marginTop: 7,
  },

  adherenceText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
  },

  streakCard: {
    backgroundColor: "#D9E3F4",
    borderRadius: 24,
    padding: 22,
  },

  streakIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#6CF8BB",
    alignItems: "center",
    justifyContent: "center",
  },

  streakLabel: {
    color: "#757684",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 16,
  },

  streakValue: {
    color: "#121C28",
    fontSize: 30,
    fontWeight: "700",
    marginTop: 3,
  },

  streakBest: {
    color: "#444653",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
  },
});
