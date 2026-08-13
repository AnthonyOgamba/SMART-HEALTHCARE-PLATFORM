import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Brand, PageTypography } from "@/constants/theme";

const durationOptions = ["Just started", "Few hours", "Days"];

export default function SymptomDetailsScreen() {
  const router = useRouter();

  const [severity, setSeverity] = useState(5);
  const [duration, setDuration] = useState("Just started");

  const decreaseSeverity = () => {
    setSeverity((current) => Math.max(1, current - 1));
  };

  const increaseSeverity = () => {
    setSeverity((current) => Math.min(10, current + 1));
  };

  const getSeverityLabel = () => {
    if (severity <= 3) return "Mild";
    if (severity <= 7) return "Moderate";
    return "Severe";
  };

  const goNext = () => {
    router.push("/symptom-assessment" as never);
  };
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Brand.primary} />
        </Pressable>

        <Text style={styles.headerTitle}>Symptom Details</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.aiBanner}>
          <View style={styles.aiIcon}>
            <MaterialIcons name="psychology" size={34} color="#FFFFFF" />
          </View>

          <View style={styles.aiText}>
            <Text style={styles.aiTitle}>Symptom Severity</Text>

            <Text style={styles.aiDescription}>
              Providing accurate details helps Genie Cares analyze potential
              causes and urgency.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Pain Intensity</Text>

            <View style={styles.scoreBadge}>
              <Text style={styles.scoreText}>{severity}</Text>
            </View>
          </View>

          <View style={styles.sliderArea}>
            <View style={styles.sliderTrack}>
              <View
                style={[
                  styles.sliderProgress,
                  {
                    width: `${((severity - 1) / 9) * 100}%`,
                  },
                ]}
              />

              <View
                style={[
                  styles.sliderThumb,
                  {
                    left: `${((severity - 1) / 9) * 94}%`,
                  },
                ]}
              />
            </View>

            <View style={styles.labelsRow}>
              <Text style={styles.sliderLabel}>Mild</Text>

              <Text style={styles.sliderLabel}>Moderate</Text>

              <Text style={styles.sliderLabel}>Severe</Text>
            </View>
          </View>

          <View style={styles.adjustRow}>
            <Pressable style={styles.adjustButton} onPress={decreaseSeverity}>
              <MaterialIcons name="remove" size={22} color={Brand.primary} />
            </Pressable>

            <View style={styles.severitySummary}>
              <Text style={styles.severitySummaryLabel}>Current intensity</Text>

              <Text style={styles.severitySummaryValue}>
                {severity}/10 · {getSeverityLabel()}
              </Text>
            </View>

            <Pressable style={styles.adjustButton} onPress={increaseSeverity}>
              <MaterialIcons name="add" size={22} color={Brand.primary} />
            </Pressable>
          </View>

          <View style={styles.visualCard}>
            <View style={styles.bodyGraphic}>
              <MaterialIcons
                name="accessibility-new"
                size={82}
                color="#5EA3C8"
              />

              <View style={styles.pulseCircle}>
                <MaterialIcons name="favorite" size={24} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.visualOverlay}>
              <Text style={styles.visualText}>
                Current setting: {getSeverityLabel()} discomfort.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.durationCard}>
          <Text style={styles.durationTitle}>How long has this lasted?</Text>

          <View style={styles.durationControl}>
            {durationOptions.map((option) => {
              const selected = duration === option;

              return (
                <Pressable
                  key={option}
                  onPress={() => setDuration(option)}
                  style={[
                    styles.durationOption,
                    selected && styles.durationOptionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.durationText,
                      selected && styles.durationTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable style={styles.nextButton} onPress={goNext}>
          <Text style={styles.nextText}>Next</Text>

          <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
        </Pressable>

        <Text style={styles.stepText}>Step 2 of 4</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8F9FF",
  },

  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E4E6EC",
    backgroundColor: "#F8F9FF",
  },

  backButton: {
    width: 42,
    height: 44,
    justifyContent: "center",
  },

  headerTitle: {
    color: Brand.primary,
    ...PageTypography.title,
  },

  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 24,
  },

  aiBanner: {
    minHeight: 116,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    gap: 16,
    backgroundColor: Brand.primary,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 4,
  },

  aiIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  aiText: {
    flex: 1,
  },

  aiTitle: {
    color: "#FFFFFF",
    fontSize: 23,
    lineHeight: 30,
    fontWeight: "600",
  },

  aiDescription: {
    color: "#FFFFFF",
    opacity: 0.93,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 3,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(196,197,213,0.3)",
    padding: 20,
    gap: 22,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  cardTitle: {
    color: "#121C28",
    fontSize: 23,
    fontWeight: "600",
  },

  scoreBadge: {
    minWidth: 48,
    height: 42,
    borderRadius: 999,
    backgroundColor: Brand.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },

  scoreText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },

  sliderArea: {
    gap: 14,
    paddingTop: 16,
  },

  sliderTrack: {
    height: 8,
    backgroundColor: "#D9E3F4",
    borderRadius: 8,
    position: "relative",
  },

  sliderProgress: {
    height: 8,
    backgroundColor: Brand.primary,
    borderRadius: 8,
  },

  sliderThumb: {
    position: "absolute",
    top: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Brand.primary,
    borderWidth: 4,
    borderColor: "#DDE5F5",
  },

  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  sliderLabel: {
    color: "#444653",
    fontSize: 14,
  },

  adjustRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  adjustButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#E5EEFF",
    alignItems: "center",
    justifyContent: "center",
  },

  severitySummary: {
    flex: 1,
    alignItems: "center",
  },

  severitySummaryLabel: {
    color: "#757684",
    fontSize: 12,
    fontWeight: "600",
  },

  severitySummaryValue: {
    color: "#121C28",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2,
  },

  visualCard: {
    height: 150,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#DCEAF1",
    position: "relative",
  },

  bodyGraphic: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  pulseCircle: {
    position: "absolute",
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Brand.secondary,
    alignItems: "center",
    justifyContent: "center",
  },

  visualOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(0,0,0,0.38)",
  },

  visualText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 21,
  },

  durationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(196,197,213,0.3)",
    padding: 20,
    gap: 20,
  },

  durationTitle: {
    color: "#121C28",
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "600",
  },

  durationControl: {
    flexDirection: "row",
    backgroundColor: "#E5EEFF",
    borderRadius: 999,
    padding: 4,
  },

  durationOption: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    paddingHorizontal: 4,
  },

  durationOptionSelected: {
    backgroundColor: Brand.primary,
  },

  durationText: {
    color: "#444653",
    fontSize: 14,
    textAlign: "center",
  },

  durationTextSelected: {
    color: "#FFFFFF",
  },

  nextButton: {
    height: 52,
    borderRadius: 999,
    backgroundColor: Brand.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 4,
  },

  nextText: {
    color: "#FFFFFF",
    fontSize: 16,
  },

  stepText: {
    color: "#444653",
    fontSize: 14,
    textAlign: "center",
  },
});
