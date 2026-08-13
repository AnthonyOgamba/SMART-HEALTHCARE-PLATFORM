import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/ui/screen-states";
import { Brand } from "@/constants/theme";

export default function AssessmentResultScreen() {
  const router = useRouter();

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={23} color={Brand.primary} />
        </Pressable>

        <Text style={styles.headerTitle}>Your Assessment</Text>

        <Pressable style={styles.shareButton}>
          <MaterialIcons name="share" size={20} color="#444653" />
        </Pressable>
      </View>

      <View style={styles.aiHero}>
        <View style={styles.aiCircle}>
          <MaterialIcons name="psychology" size={42} color="#FFFFFF" />
        </View>

        <Text style={styles.analysisComplete}>AI ANALYSIS COMPLETE</Text>
      </View>

      <Text style={styles.sectionTitle}>AI Triage Summary</Text>

      <View style={styles.concernCard}>
        <View style={styles.concernRow}>
          <View style={styles.concernIcon}>
            <MaterialIcons name="health-and-safety" size={25} color={Brand.primary} />
          </View>

          <View style={styles.concernContent}>
            <Text style={styles.concernTitle}>Symptoms require monitoring</Text>

            <Text style={styles.concernText}>
              Your answers have been reviewed by the AI-assisted triage flow.
              Continue monitoring your symptoms and seek professional medical
              advice if they persist, worsen, or concern you.
            </Text>
          </View>
        </View>

        <View style={styles.tags}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>AI Assisted</Text>
          </View>

          <View style={styles.tag}>
            <Text style={styles.tagText}>Informational</Text>
          </View>
        </View>
      </View>

      <View style={styles.guidanceCard}>
        <View style={styles.guidanceLabelRow}>
          <MaterialIcons name="info-outline" size={20} color="#DDE1FF" />

          <Text style={styles.guidanceLabel}>HEALTH GUIDANCE</Text>
        </View>

        <Text style={styles.guidanceTitle}>Monitor your symptoms</Text>

        <Text style={styles.guidanceText}>
          If your symptoms continue, become more severe, or interfere with
          normal activities, contact a qualified healthcare professional.
        </Text>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <MaterialIcons name="thermostat" size={21} color={Brand.primary} />

          <Text style={styles.metricLabel}>Severity</Text>

          <Text style={styles.metricValue}>Moderate</Text>
        </View>

        <View style={styles.metricCard}>
          <MaterialIcons name="schedule" size={21} color={Brand.secondary} />

          <Text style={styles.metricLabel}>Follow-up</Text>

          <Text style={styles.metricValue}>Monitor</Text>
        </View>
      </View>

      <View style={styles.careCard}>
        <Text style={styles.careTitle}>Recommended Care Steps</Text>

        <CareItem text="Rest and stay hydrated" />
        <CareItem text="Monitor changes in symptoms" />
        <CareItem text="Avoid activities that worsen symptoms" />
        <CareItem text="Seek professional advice if symptoms persist" />
      </View>

      <Pressable
        style={styles.aiButton}
        onPress={() => router.replace("/(tabs)/assistant" as never)}
      >
        <MaterialIcons name="psychology" size={21} color="#FFFFFF" />

        <Text style={styles.aiButtonText}>Continue with AI Care</Text>
      </Pressable>

      <Pressable
        style={styles.saveButton}
        onPress={() => router.push("/health-log" as never)}
      >
        <MaterialIcons name="save" size={20} color="#121C28" />

        <Text style={styles.saveButtonText}>Save to Health Log</Text>
      </Pressable>

      <Text style={styles.disclaimer}>
        This AI tool provides informational guidance and does not provide a
        medical diagnosis. If you experience a life-threatening emergency, call
        911 or seek emergency care immediately.
      </Text>
    </ScreenContainer>
  );
}

function CareItem({ text }: { text: string }) {
  return (
    <View style={styles.careRow}>
      <MaterialIcons name="check-circle-outline" size={20} color={Brand.secondary} />

      <Text style={styles.careText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 110,
    gap: 16,
    backgroundColor: "#F8F9FF",
  },

  header: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
  },

  headerButton: {
    width: 42,
  },

  headerTitle: {
    flex: 1,
    color: Brand.primary,
    fontSize: 23,
    fontWeight: "700",
  },

  shareButton: {
    width: 38,
    alignItems: "flex-end",
  },

  aiHero: {
    height: 160,
    borderRadius: 16,
    backgroundColor: Brand.bannerBackground,
    alignItems: "center",
    justifyContent: "center",
  },

  aiCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  analysisComplete: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1.4,
    marginTop: 10,
  },

  sectionTitle: {
    color: "#121C28",
    fontSize: 22,
    fontWeight: "600",
  },

  concernCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 20,
    gap: 16,
  },

  concernRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },

  concernIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: Brand.backgroundWash,
    alignItems: "center",
    justifyContent: "center",
  },

  concernContent: {
    flex: 1,
  },

  concernTitle: {
    color: "#121C28",
    fontSize: 18,
    fontWeight: "600",
  },

  concernText: {
    color: "#444653",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
  },

  tags: {
    flexDirection: "row",
    gap: 8,
  },

  tag: {
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#E5EEFF",
  },

  tagText: {
    color: "#444653",
    fontSize: 11,
    fontWeight: "600",
  },

  guidanceCard: {
    backgroundColor: Brand.bannerBackground,
    borderRadius: 16,
    padding: 22,
  },

  guidanceLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  guidanceLabel: {
    color: "#DDE1FF",
    fontSize: 12,
    letterSpacing: 0.7,
    fontWeight: "600",
  },

  guidanceTitle: {
    color: "#FFFFFF",
    fontSize: 27,
    lineHeight: 35,
    fontWeight: "700",
    marginTop: 10,
  },

  guidanceText: {
    color: "#B8C4FF",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },

  metricsRow: {
    flexDirection: "row",
    gap: 12,
  },

  metricCard: {
    flex: 1,
    minHeight: 110,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  metricLabel: {
    color: "#444653",
    fontSize: 13,
    marginTop: 9,
  },

  metricValue: {
    color: "#121C28",
    fontSize: 17,
    marginTop: 2,
  },

  careCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 17,
    gap: 12,
  },

  careTitle: {
    color: "#444653",
    fontSize: 14,
    fontWeight: "600",
  },

  careRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  careText: {
    flex: 1,
    color: "#121C28",
    fontSize: 15,
  },

  aiButton: {
    height: 56,
    borderRadius: 12,
    backgroundColor: Brand.primaryButtonBackground,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  aiButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
  },

  saveButton: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#757684",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  saveButtonText: {
    color: "#121C28",
    fontSize: 17,
  },

  disclaimer: {
    color: "#757684",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 16,
  },
});
