import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/ui/screen-states";
import { Brand } from "@/constants/theme";

type Symptom = {
  id: string;
  name: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  logs?: string;
};

const symptoms: Symptom[] = [
  {
    id: "headache",
    name: "Headache",
    subtitle: "Head pain or pressure",
    icon: "medication",
    logs: "3 active logs",
  },
  {
    id: "fatigue",
    name: "Fatigue",
    subtitle: "Low energy, drowsiness",
    icon: "battery-alert",
  },
  {
    id: "cough",
    name: "Cough",
    subtitle: "Dry, wet, or persistent",
    icon: "air",
  },
  {
    id: "nausea",
    name: "Nausea",
    subtitle: "Stomach discomfort",
    icon: "sick",
  },
];

export default function SymptomsScreen() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("headache");

  const filteredSymptoms = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return symptoms;
    }

    return symptoms.filter((symptom) =>
      symptom.name.toLowerCase().includes(term),
    );
  }, [search]);

  const goNext = () => {
    router.push({
      pathname: "/symptom-details",
      params: {
        symptom: selected,
      },
    } as never);
  };

  return (
    <ScreenContainer style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Brand.primary} />
        </Pressable>

        <Text style={styles.headerTitle}>Track Symptoms</Text>

        <Pressable style={styles.helpButton}>
          <MaterialIcons name="help-outline" size={23} color="#444653" />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={24} color="#858694" />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search symptoms..."
            placeholderTextColor="#A8A9B5"
            style={styles.searchInput}
          />
        </View>

        <Text style={styles.sectionLabel}>POPULAR CATEGORIES</Text>

        <View style={styles.list}>
          {filteredSymptoms.map((symptom) => {
            const isSelected = selected === symptom.id;

            return (
              <Pressable
                key={symptom.id}
                onPress={() => setSelected(symptom.id)}
                style={[styles.symptomCard, isSelected && styles.selectedCard]}
              >
                <View
                  style={[
                    styles.iconContainer,
                    isSelected
                      ? styles.selectedIconContainer
                      : styles.normalIconContainer,
                  ]}
                >
                  <MaterialIcons
                    name={symptom.icon}
                    size={24}
                    color={Brand.primary}
                  />
                </View>

                <View style={styles.symptomText}>
                  <Text
                    style={[
                      styles.symptomName,
                      isSelected && styles.selectedSymptomName,
                    ]}
                  >
                    {symptom.name}
                  </Text>

                  <Text
                    style={[
                      styles.symptomSubtitle,
                      isSelected && styles.selectedSubtitle,
                    ]}
                  >
                    {isSelected && symptom.logs
                      ? symptom.logs
                      : symptom.subtitle}
                  </Text>
                </View>

                {isSelected ? (
                  <View style={styles.checkCircle}>
                    <MaterialIcons name="check" size={16} color="#FFFFFF" />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={[styles.nextButton, !selected && styles.nextButtonDisabled]}
          disabled={!selected}
          onPress={goNext}
        >
          <Text style={styles.nextButtonText}>Next: Details</Text>

          <MaterialIcons name="arrow-forward" size={22} color="#FFFFFF" />
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 0,
    paddingBottom: 110,
    backgroundColor: "#F8F9FF",
  },

  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FF",
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E1E3EB",
  },

  headerButton: {
    width: 40,
    height: 44,
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    marginLeft: 1,
    color: Brand.primary,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "700",
  },

  helpButton: {
    width: 36,
    height: 40,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  searchContainer: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#C4C5D5",
    borderRadius: 12,
  },

  searchInput: {
    flex: 1,
    color: "#121C28",
    fontSize: 16,
    height: 48,
  },

  sectionLabel: {
    color: "#757684",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.7,
    marginTop: 26,
    marginBottom: 16,
  },

  list: {
    gap: 16,
  },

  symptomCard: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(196,197,213,0.30)",
    padding: 17,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    elevation: 1,
  },

  selectedCard: {
    minHeight: 88,
    backgroundColor: Brand.backgroundWash,
    borderWidth: 2,
    borderColor: "rgba(0,40,142,0.20)",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 3,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },

  selectedIconContainer: {
    backgroundColor: "rgba(255,255,255,0.35)",
  },

  normalIconContainer: {
    backgroundColor: "#E5EEFF",
  },

  symptomText: {
    flex: 1,
  },

  symptomName: {
    color: "#121C28",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },

  selectedSymptomName: {
    color: Brand.primary,
    fontSize: 18,
    lineHeight: 28,
    fontWeight: "700",
  },

  symptomSubtitle: {
    marginTop: 2,
    color: "#757684",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
  },

  selectedSubtitle: {
    color: Brand.primary,
    opacity: 0.8,
  },

  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  nextButton: {
    height: 52,
    marginTop: 16,
    backgroundColor: Brand.primary,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 4,
  },

  nextButtonDisabled: {
    opacity: 0.45,
  },

  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    letterSpacing: 0.14,
  },
});
