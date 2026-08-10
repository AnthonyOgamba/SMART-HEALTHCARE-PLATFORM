import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/ui/screen-states";

export default function MedicationScreen() {
  const router = useRouter();
  const [omegaTaken, setOmegaTaken] = useState(false);

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <Text style={styles.title}>My Medications</Text>

      <View style={styles.tabs}>
        <Pressable style={styles.activeTab}>
          <Text style={styles.activeTabText}>Today</Text>
        </Pressable>

        <Pressable
          style={styles.inactiveTab}
          onPress={() => router.push("/medication-history" as never)}
        >
          <Text style={styles.inactiveTabText}>History</Text>
        </Pressable>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressCircle}>
          <Text style={styles.progressPercent}>
            {omegaTaken ? "100%" : "50%"}
          </Text>
        </View>

        <View style={styles.progressContent}>
          <Text style={styles.progressTitle}>Daily Progress</Text>

          <Text style={styles.progressSubtitle}>
            {omegaTaken
              ? "2 of 2 medications taken today"
              : "1 of 2 medications taken today"}
          </Text>
        </View>
      </View>

      <View style={styles.sectionTitleRow}>
        <MaterialIcons name="schedule" size={23} color="#005EA4" />

        <Text style={styles.sectionTitle}>Scheduled for today</Text>
      </View>

      <View style={styles.medicationCard}>
        <View style={styles.cardTop}>
          <View style={styles.medicationInfo}>
            <View style={styles.greenIcon}>
              <MaterialIcons name="medication" size={25} color="#008738" />
            </View>

            <View>
              <Text style={styles.medicationName}>Vitamin D</Text>

              <Text style={styles.medicationDose}>1 tablet • 8:00 AM</Text>
            </View>
          </View>

          <View style={styles.completedBadge}>
            <MaterialIcons
              name="check-circle-outline"
              size={15}
              color="#006B2B"
            />

            <Text style={styles.completedText}>Completed</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBottom}>
          <Text style={styles.takenText}>Taken at 8:05 AM</Text>

          <Pressable
            style={styles.detailsButton}
            onPress={() => router.push("/medication-details" as never)}
          >
            <Text style={styles.detailsText}>Details</Text>

            <MaterialIcons name="chevron-right" size={20} color="#005EA4" />
          </Pressable>
        </View>
      </View>

      <View style={styles.omegaCard}>
        <View style={styles.cardTop}>
          <View style={styles.medicationInfo}>
            <View style={styles.blueIcon}>
              <MaterialIcons
                name="medical-services"
                size={24}
                color="#0077CE"
              />
            </View>

            <View>
              <Text style={styles.medicationName}>Omega 3</Text>

              <Text style={styles.medicationDose}>2 capsules • 8:30 PM</Text>
            </View>
          </View>

          {omegaTaken ? (
            <View style={styles.completedBadge}>
              <MaterialIcons
                name="check-circle-outline"
                size={15}
                color="#006B2B"
              />

              <Text style={styles.completedText}>Completed</Text>
            </View>
          ) : (
            <View style={styles.upcomingBadge}>
              <MaterialIcons name="more-horiz" size={15} color="#404752" />

              <Text style={styles.upcomingText}>Upcoming</Text>
            </View>
          )}
        </View>

        {!omegaTaken && (
          <View style={styles.actionRow}>
            <Pressable
              style={styles.markTakenButton}
              onPress={() => setOmegaTaken(true)}
            >
              <MaterialIcons name="done-all" size={20} color="#FFFFFF" />

              <Text style={styles.markTakenText}>Mark as Taken</Text>
            </Pressable>

            <Pressable style={styles.notificationButton}>
              <MaterialIcons
                name="notifications-off"
                size={23}
                color="#707783"
              />
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.refillCard}>
        <View style={styles.refillTitleRow}>
          <MaterialIcons name="info-outline" size={23} color="#005EA4" />

          <Text style={styles.refillTitle}>Refill Warning</Text>
        </View>

        <Text style={styles.refillDescription}>
          Omega 3 stock is low. You have 3 days left based on your current
          schedule.
        </Text>

        <Pressable>
          <Text style={styles.refillLink}>Order Refill</Text>
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add Medication"
        style={styles.fab}
        onPress={() => router.push("/add-medication" as never)}
      >
        <MaterialIcons name="add" size={31} color="#FFFFFF" />
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
    gap: 16,
    backgroundColor: "#F7F9FB",
  },

  title: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700",
    color: "#191C1E",
    marginBottom: 20,
  },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#EEF4FF",
    padding: 4,
    borderRadius: 999,
    marginBottom: 8,
  },

  activeTab: {
    flex: 1,
    height: 40,
    backgroundColor: "#005EA4",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  inactiveTab: {
    flex: 1,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  activeTabText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  inactiveTabText: {
    color: "#404752",
    fontSize: 14,
    fontWeight: "600",
  },

  progressCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E7EB",
    borderRadius: 16,
    padding: 22,
    gap: 20,
  },

  progressCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 6,
    borderColor: "#1976B8",
    alignItems: "center",
    justifyContent: "center",
  },

  progressPercent: {
    color: "#005EA4",
    fontSize: 15,
    fontWeight: "700",
  },

  progressContent: {
    flex: 1,
  },

  progressTitle: {
    color: "#191C1E",
    fontSize: 22,
    fontWeight: "600",
  },

  progressSubtitle: {
    color: "#404752",
    fontSize: 14,
    marginTop: 3,
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },

  sectionTitle: {
    color: "#191C1E",
    fontSize: 22,
    fontWeight: "600",
  },

  medicationCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6EAED",
    borderRadius: 16,
    padding: 18,
  },

  omegaCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: "#005EA4",
    borderRadius: 16,
    padding: 18,
    gap: 22,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },

  medicationInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  greenIcon: {
    width: 50,
    height: 50,
    borderRadius: 13,
    backgroundColor: "#E4F3EB",
    alignItems: "center",
    justifyContent: "center",
  },

  blueIcon: {
    width: 50,
    height: 50,
    borderRadius: 13,
    backgroundColor: "#E4F0FA",
    alignItems: "center",
    justifyContent: "center",
  },

  medicationName: {
    color: "#191C1E",
    fontSize: 21,
    fontWeight: "600",
  },

  medicationDose: {
    color: "#404752",
    fontSize: 14,
    marginTop: 2,
  },

  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#CDEAD8",
  },

  completedText: {
    color: "#006B2B",
    fontSize: 12,
    fontWeight: "600",
  },

  upcomingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#E6E8EA",
  },

  upcomingText: {
    color: "#404752",
    fontSize: 12,
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: "#EDF0F2",
    marginVertical: 17,
  },

  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  takenText: {
    color: "#707783",
    fontSize: 13,
    fontWeight: "600",
  },

  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
  },

  detailsText: {
    color: "#005EA4",
    fontSize: 17,
  },

  actionRow: {
    flexDirection: "row",
    gap: 12,
  },

  markTakenButton: {
    flex: 1,
    height: 50,
    backgroundColor: "#005EA4",
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  markTakenText: {
    color: "#FFFFFF",
    fontSize: 16,
  },

  notificationButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C0C7D4",
    alignItems: "center",
    justifyContent: "center",
  },

  refillCard: {
    backgroundColor: "#EDF7FC",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#8EC7EA",
    borderRadius: 16,
    padding: 18,
    gap: 10,
  },

  refillTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  refillTitle: {
    color: "#191C1E",
    fontSize: 17,
  },

  refillDescription: {
    color: "#404752",
    fontSize: 15,
    lineHeight: 21,
  },

  refillLink: {
    color: "#005EA4",
    fontSize: 13,
    fontWeight: "700",
    textDecorationLine: "underline",
  },

  fab: {
    alignSelf: "flex-end",
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#005EA4",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
});
