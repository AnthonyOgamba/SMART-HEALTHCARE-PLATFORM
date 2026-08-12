import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/ui/screen-states";
import { Brand, PageTypography } from "@/constants/theme";

export default function SymptomAssessmentScreen() {
  const router = useRouter();

  const continueAssessment = () => {
    router.push("/assessment-result" as never);
  };

  const answerYes = () => {
    Alert.alert(
      "Possible Red-Flag Symptom",
      "Shortness of breath or significant dizziness may require urgent medical attention. If symptoms are severe, sudden, or worsening, call 911 or seek emergency care immediately.",
      [
        {
          text: "Continue",
          onPress: continueAssessment,
        },
      ],
    );
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#00288E" />
        </Pressable>

        <Text style={styles.headerTitle}>Health Check</Text>
      </View>

      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>ASSESSMENT PROGRESS</Text>

        <Text style={styles.stepLabel}>Step 3 of 4</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={styles.progressFill} />
      </View>

      <View style={styles.visualCard}>
        <View style={styles.visualCenter}>
          <MaterialIcons name="favorite" size={86} color="#71A8D2" />

          <View style={styles.heartCircle}>
            <MaterialIcons name="favorite" size={27} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.visualFooter}>
          <View style={styles.greenDot} />

          <Text style={styles.visualLabel}>Red-Flag Screening</Text>
        </View>
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.question}>
          Are you experiencing shortness of breath or dizziness?
        </Text>

        <Text style={styles.questionDescription}>
          Please answer honestly for the most accurate AI-assisted health
          assessment.
        </Text>
      </View>

      <Pressable style={styles.answerCard} onPress={answerYes}>
        <View style={styles.answerLeft}>
          <View style={styles.yesIcon}>
            <MaterialIcons name="warning" size={28} color="#B42318" />
          </View>

          <View style={styles.answerTextArea}>
            <Text style={styles.answerTitle}>Yes</Text>

            <Text style={styles.answerSubtitle}>I feel these symptoms now</Text>
          </View>
        </View>

        <MaterialIcons name="chevron-right" size={26} color="#858694" />
      </Pressable>

      <Pressable style={styles.answerCard} onPress={continueAssessment}>
        <View style={styles.answerLeft}>
          <View style={styles.noIcon}>
            <MaterialIcons name="check-circle" size={27} color="#00714D" />
          </View>

          <View style={styles.answerTextArea}>
            <Text style={styles.answerTitle}>No</Text>

            <Text style={styles.answerSubtitle}>
              I do not feel these symptoms
            </Text>
          </View>
        </View>

        <MaterialIcons name="chevron-right" size={26} color="#858694" />
      </Pressable>

      <View style={styles.aiNotice}>
        <MaterialIcons name="psychology" size={22} color="#00288E" />

        <View style={styles.aiNoticeContent}>
          <Text style={styles.aiNoticeTitle}>AI Safety Check</Text>

          <Text style={styles.aiNoticeText}>
            Your answers are used to determine whether general guidance is
            appropriate or whether professional or emergency care should be
            recommended.
          </Text>
        </View>
      </View>

      <Text style={styles.emergencyText}>
        If you are experiencing a life-threatening emergency, call 911 or seek
        emergency care immediately.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 100,
    backgroundColor: "#F8F9FF",
  },

  header: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  backButton: {
    width: 46,
    height: 44,
    justifyContent: "center",
  },

  headerTitle: {
    color: Brand.accent,
    ...PageTypography.title,
  },

  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  progressLabel: {
    color: "#444653",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.7,
  },

  stepLabel: {
    color: "#00288E",
    fontSize: 14,
    fontWeight: "700",
  },

  progressTrack: {
    height: 8,
    backgroundColor: "#D9E3F4",
    borderRadius: 999,
    marginTop: 8,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    width: "75%",
    backgroundColor: "#00288E",
    borderRadius: 999,
  },

  visualCard: {
    height: 186,
    marginTop: 30,
    backgroundColor: "#DDEAF4",
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
  },

  visualCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  heartCircle: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#2781B9",
    alignItems: "center",
    justifyContent: "center",
  },

  visualFooter: {
    position: "absolute",
    left: 16,
    bottom: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6FFBBE",
  },

  visualLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  questionCard: {
    marginTop: 30,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 26,
    paddingVertical: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEF0F3",
  },

  question: {
    color: "#121C28",
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "600",
    textAlign: "center",
  },

  questionDescription: {
    color: "#444653",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 16,
  },

  answerCard: {
    minHeight: 104,
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#C4C5D5",
    borderRadius: 12,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  answerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  answerTextArea: {
    flex: 1,
  },

  yesIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFDAD6",
    alignItems: "center",
    justifyContent: "center",
  },

  noIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#6CF8BB",
    alignItems: "center",
    justifyContent: "center",
  },

  answerTitle: {
    color: "#121C28",
    fontSize: 22,
    fontWeight: "600",
  },

  answerSubtitle: {
    color: "#444653",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
  },

  aiNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    marginTop: 20,
    backgroundColor: "#EEF4FF",
    borderRadius: 13,
    padding: 15,
  },

  aiNoticeContent: {
    flex: 1,
  },

  aiNoticeTitle: {
    color: "#00288E",
    fontSize: 13,
    fontWeight: "700",
  },

  aiNoticeText: {
    color: "#59616D",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 3,
  },

  emergencyText: {
    color: "#757684",
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 24,
    paddingHorizontal: 26,
    fontWeight: "600",
  },
});
