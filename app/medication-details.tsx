import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/ui/screen-states";

const adherenceDays = [true, true, true, false, true, true, true];

export default function MedicationDetailsScreen() {
  const router = useRouter();
  const [taken, setTaken] = useState(false);

  const deleteMedication = () => {
    Alert.alert(
      "Delete Medication",
      "Are you sure you want to remove this medication?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => router.back(),
        },
      ],
    );
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={23} color="#00288E" />
        </Pressable>

        <Text style={styles.headerTitle}>Medication Manager</Text>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroText}>
          <Text style={styles.activeLabel}>ACTIVE PRESCRIPTION</Text>

          <Text style={styles.medicationTitle}>Vitamin D3 Details</Text>

          <Text style={styles.medicationSubtitle}>
            Cholecalciferol • 2000 IU Capsule
          </Text>
        </View>

        <View style={styles.heroIcon}>
          <MaterialIcons name="medication" size={34} color="#00288E" />
        </View>
      </View>

      <View style={styles.nextDoseCard}>
        <Text style={styles.nextDoseLabel}>Next Dose</Text>

        <Text style={styles.nextDoseTime}>Tomorrow, 9:00 AM</Text>

        <Text style={styles.nextDoseSub}>With breakfast</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Prescription Instructions</Text>

        <InfoRow
          icon="description"
          title="Instructions"
          text="Take 1 capsule daily with food. Follow the medication label and instructions from your healthcare professional."
        />

        <InfoRow icon="refresh" title="Refills" text="2 remaining" />

        <InfoRow icon="event" title="Started On" text="October 12, 2023" />

        <Pressable
          style={[styles.primaryButton, taken && styles.takenButton]}
          onPress={() => setTaken(true)}
        >
          <MaterialIcons
            name={taken ? "check-circle" : "check-circle-outline"}
            size={20}
            color="#FFFFFF"
          />

          <Text style={styles.primaryButtonText}>
            {taken ? "Dose Taken" : "Mark as Taken"}
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push("/add-medication" as never)}
        >
          <MaterialIcons name="edit" size={18} color="#444653" />

          <Text style={styles.secondaryButtonText}>Edit Details</Text>
        </Pressable>
      </View>

      <View style={styles.aiInsight}>
        <View style={styles.aiIcon}>
          <MaterialIcons name="auto-awesome" size={23} color="#00288E" />
        </View>

        <View style={styles.aiText}>
          <Text style={styles.aiTitle}>AI Care Insight</Text>

          <Text style={styles.aiDescription}>
            Taking medication consistently at the scheduled time can make
            routines easier to follow. Always follow the label or advice from
            your healthcare professional.
          </Text>
        </View>
      </View>

      <View style={styles.adherenceCard}>
        <Text style={styles.sectionTitle}>Adherence Stats</Text>

        <View style={styles.circle}>
          <Text style={styles.percent}>95%</Text>

          <Text style={styles.adherenceLabel}>ADHERENCE</Text>
        </View>

        <Text style={styles.adherenceDescription}>
          Over the last 30 days, you missed only 1 scheduled dose.
        </Text>

        <Text style={styles.lastSevenTitle}>Last 7 Days</Text>

        <View style={styles.bars}>
          {adherenceDays.map((completed, index) => (
            <View key={index} style={styles.barColumn}>
              <View
                style={[
                  styles.bar,
                  completed ? styles.completedBar : styles.missedBar,
                ]}
              />

              <Text style={styles.day}>
                {["M", "T", "W", "T", "F", "S", "S"][index]}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.warningCard}>
        <MaterialIcons name="info-outline" size={20} color="#BA1A1A" />

        <Text style={styles.warningText}>
          Refill request suggested soon to avoid interruption in your medication
          schedule.
        </Text>
      </View>

      <Pressable style={styles.deleteButton} onPress={deleteMedication}>
        <MaterialIcons name="delete-outline" size={19} color="#BA1A1A" />

        <Text style={styles.deleteText}>Delete Medication</Text>
      </Pressable>
    </ScreenContainer>
  );
}

function InfoRow({
  icon,
  title,
  text,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  text: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <MaterialIcons name={icon} size={20} color="#00288E" />
      </View>

      <View style={styles.infoText}>
        <Text style={styles.infoTitle}>{title}</Text>

        <Text style={styles.infoDescription}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 110,
    gap: 16,
    backgroundColor: "#F8F9FF",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  backButton: {
    width: 42,
    height: 44,
    justifyContent: "center",
  },

  headerTitle: {
    color: "#00288E",
    fontSize: 22,
    fontWeight: "700",
  },

  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C4C5D5",
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
  },

  heroText: {
    flex: 1,
  },

  activeLabel: {
    color: "#006C49",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.7,
  },

  medicationTitle: {
    color: "#121C28",
    fontSize: 27,
    fontWeight: "700",
    lineHeight: 34,
    marginTop: 6,
  },

  medicationSubtitle: {
    color: "#444653",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },

  heroIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#E5EEFF",
    alignItems: "center",
    justifyContent: "center",
  },

  nextDoseCard: {
    backgroundColor: "#6CF8BB",
    borderRadius: 12,
    padding: 22,
  },

  nextDoseLabel: {
    color: "#005236",
    fontSize: 13,
    fontWeight: "600",
  },

  nextDoseTime: {
    color: "#002113",
    fontSize: 23,
    fontWeight: "700",
    marginTop: 4,
  },

  nextDoseSub: {
    color: "#005236",
    fontSize: 14,
    marginTop: 7,
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C4C5D5",
    padding: 22,
    gap: 20,
  },

  sectionTitle: {
    color: "#121C28",
    fontSize: 22,
    fontWeight: "700",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },

  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: "#E5EEFF",
    alignItems: "center",
    justifyContent: "center",
  },

  infoText: {
    flex: 1,
  },

  infoTitle: {
    color: "#121C28",
    fontSize: 13,
    fontWeight: "700",
  },

  infoDescription: {
    color: "#444653",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 3,
  },

  primaryButton: {
    height: 48,
    backgroundColor: "#00288E",
    borderRadius: 9,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  takenButton: {
    backgroundColor: "#00714D",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  secondaryButton: {
    height: 48,
    borderWidth: 1,
    borderColor: "#757684",
    borderRadius: 9,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryButtonText: {
    color: "#444653",
    fontSize: 14,
    fontWeight: "600",
  },

  aiInsight: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: "#E9F2F7",
    borderWidth: 1,
    borderColor: "#C6D7E0",
    borderRadius: 12,
    padding: 18,
  },

  aiIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#DDE8FF",
    alignItems: "center",
    justifyContent: "center",
  },

  aiText: {
    flex: 1,
  },

  aiTitle: {
    color: "#00288E",
    fontSize: 14,
    fontWeight: "700",
  },

  aiDescription: {
    color: "#444653",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },

  adherenceCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#C4C5D5",
    borderRadius: 12,
    padding: 22,
    alignItems: "center",
  },

  circle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 12,
    borderColor: "#00714D",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 26,
  },

  percent: {
    color: "#121C28",
    fontSize: 38,
    fontWeight: "700",
  },

  adherenceLabel: {
    color: "#444653",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },

  adherenceDescription: {
    color: "#444653",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 20,
  },

  lastSevenTitle: {
    alignSelf: "flex-start",
    color: "#121C28",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 28,
  },

  bars: {
    width: "100%",
    height: 110,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginTop: 12,
  },

  barColumn: {
    flex: 1,
    alignItems: "center",
  },

  bar: {
    width: "80%",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },

  completedBar: {
    height: 78,
    backgroundColor: "#00714D",
  },

  missedBar: {
    height: 12,
    backgroundColor: "#FFDAD6",
  },

  day: {
    color: "#757684",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 6,
  },

  warningCard: {
    backgroundColor: "#FFF1F0",
    borderWidth: 1,
    borderColor: "#FFDAD6",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },

  warningText: {
    flex: 1,
    color: "#93000A",
    fontSize: 13,
    lineHeight: 18,
  },

  deleteButton: {
    height: 48,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  deleteText: {
    color: "#BA1A1A",
    fontSize: 15,
  },
});
