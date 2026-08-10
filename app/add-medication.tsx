import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    Pressable,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";

import { ScreenContainer } from "@/components/ui/screen-states";
import { usePalette, type ThemePalette } from "@/hooks/use-palette";

export default function AddMedicationScreen() {
  const router = useRouter();
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("Once Daily");
  const [doseTime, setDoseTime] = useState("08:00 AM");
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsReminders, setSmsReminders] = useState(false);

  const saveMedication = () => {
    if (!name.trim() || !dosage.trim()) {
      return;
    }

    router.back();
  };
  return (
    <ScreenContainer style={styles.content}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={22} color="#00288E" />
        </Pressable>

        <Text style={styles.topBarTitle}>Medication Manager</Text>
      </View>

      <View style={styles.main}>
        <View style={styles.headingSection}>
          <Text style={styles.title}>Add Medication</Text>
          <Text style={styles.subtitle}>
            Schedule your next dose and set up reminders.
          </Text>
        </View>

        <View style={styles.imagePlaceholder}>
          <MaterialIcons
            name="medication"
            size={62}
            color="rgba(0,40,142,0.35)"
          />
        </View>

        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>Medication Name</Text>

            <View style={styles.inputWithIcon}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g., Lisinopril"
                placeholderTextColor="#6B7280"
                style={styles.inputFlex}
              />

              <MaterialIcons name="medication" size={18} color="#A7A8B4" />
            </View>
          </View>

          <View style={styles.twoColumnRow}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Dosage</Text>
              <TextInput
                value={dosage}
                onChangeText={setDosage}
                placeholder="e.g., 10mg"
                placeholderTextColor="#6B7280"
                style={styles.input}
              />
            </View>

            <View style={styles.halfField}>
              <Text style={styles.label}>Frequency</Text>

              <Pressable
                style={styles.selectInput}
                onPress={() =>
                  setFrequency((current) =>
                    current === "Once Daily" ? "Twice Daily" : "Once Daily",
                  )
                }
              >
                <Text style={styles.selectText}>{frequency}</Text>
                <MaterialIcons
                  name="keyboard-arrow-down"
                  size={21}
                  color="#444653"
                />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="schedule" size={18} color="#00288E" />
            <Text style={styles.sectionHeaderText}>Dose Schedule</Text>
          </View>

          <View style={styles.scheduleRow}>
            <View style={styles.timeInput}>
              <Text style={styles.timeText}>{doseTime}</Text>
            </View>

            <Pressable
              style={styles.addTimeButton}
              onPress={() =>
                setDoseTime((current) =>
                  current === "08:00 AM" ? "08:30 AM" : "08:00 AM",
                )
              }
            >
              <MaterialIcons name="add" size={24} color="#00288E" />
            </Pressable>
          </View>

          <View style={styles.timePill}>
            <Text style={styles.timePillText}>{doseTime}</Text>
            <MaterialIcons name="close" size={13} color="#00714D" />
          </View>
        </View>

        <View style={styles.reminderCard}>
          <Text style={styles.reminderHeading}>Reminder Settings</Text>

          <View style={styles.reminderRow}>
            <View style={styles.reminderLeft}>
              <View style={styles.notificationIcon}>
                <MaterialIcons
                  name="notifications-none"
                  size={22}
                  color="#00288E"
                />
              </View>

              <View>
                <Text style={styles.reminderTitle}>Push Notifications</Text>
                <Text style={styles.reminderSubtitle}>
                  Alert me on this device
                </Text>
              </View>
            </View>

            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{
                false: "#C4C5D5",
                true: "#00288E",
              }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.reminderRow}>
            <View style={styles.reminderLeft}>
              <View style={styles.smsIcon}>
                <MaterialIcons name="sms" size={21} color="#00714D" />
              </View>

              <View>
                <Text style={styles.reminderTitle}>SMS Reminders</Text>
                <Text style={styles.reminderSubtitle}>
                  Text alerts for critical doses
                </Text>
              </View>
            </View>

            <Switch
              value={smsReminders}
              onValueChange={setSmsReminders}
              trackColor={{
                false: "#C4C5D5",
                true: "#00288E",
              }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            style={[
              styles.saveButton,
              (!name.trim() || !dosage.trim()) && styles.saveButtonDisabled,
            ]}
            onPress={saveMedication}
          >
            <MaterialIcons name="save" size={20} color="#FFFFFF" />

            <Text style={styles.saveButtonText}>Save Medication</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.discardButton}
          >
            <Text style={styles.discardText}>Discard Changes</Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

const makeStyles = (theme: ThemePalette) =>
  StyleSheet.create({
    content: {
      padding: 0,
      backgroundColor: "#F8F9FF",
    },

    topBar: {
      height: 64,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      backgroundColor: "#F8F9FF",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: "#ECEEF3",
    },

    backButton: {
      width: 32,
      height: 40,
      alignItems: "flex-start",
      justifyContent: "center",
    },

    topBarTitle: {
      color: "#00288E",
      fontSize: 20,
      fontWeight: "700",
    },

    main: {
      paddingHorizontal: 20,
      paddingVertical: 28,
      gap: 16,
    },

    headingSection: {
      marginBottom: 8,
      gap: 4,
    },

    title: {
      color: "#121C28",
      fontSize: 28,
      lineHeight: 36,
      fontWeight: "700",
    },

    subtitle: {
      color: "#444653",
      fontSize: 16,
      lineHeight: 24,
      maxWidth: 320,
    },

    imagePlaceholder: {
      height: 192,
      borderRadius: 12,
      backgroundColor: "#DCE8F7",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },

    card: {
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "rgba(196,197,213,0.3)",
      borderRadius: 12,
      padding: 24,
      gap: 24,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 6,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 2,
    },

    field: {
      gap: 4,
    },

    label: {
      color: "#444653",
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "500",
    },

    input: {
      height: 48,
      backgroundColor: "#F8F9FF",
      borderWidth: 1,
      borderColor: "#C4C5D5",
      borderRadius: 8,
      paddingHorizontal: 16,
      color: "#121C28",
      fontSize: 16,
    },

    inputWithIcon: {
      height: 48,
      backgroundColor: "#F8F9FF",
      borderWidth: 1,
      borderColor: "#C4C5D5",
      borderRadius: 8,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
    },

    inputFlex: {
      flex: 1,
      color: "#121C28",
      fontSize: 16,
    },

    twoColumnRow: {
      flexDirection: "row",
      gap: 16,
    },

    halfField: {
      flex: 1,
      gap: 4,
    },

    selectInput: {
      height: 48,
      backgroundColor: "#F8F9FF",
      borderWidth: 1,
      borderColor: "#C4C5D5",
      borderRadius: 8,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    selectText: {
      color: "#121C28",
      fontSize: 15,
    },

    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    sectionHeaderText: {
      color: "#00288E",
      fontSize: 14,
      fontWeight: "500",
    },

    scheduleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },

    timeInput: {
      flex: 1,
      height: 48,
      backgroundColor: "#F8F9FF",
      borderWidth: 1,
      borderColor: "#C4C5D5",
      borderRadius: 8,
      justifyContent: "center",
      paddingHorizontal: 16,
    },

    timeText: {
      color: "#121C28",
      fontSize: 16,
    },

    addTimeButton: {
      width: 48,
      height: 48,
      borderRadius: 8,
      backgroundColor: "#E5EEFF",
      alignItems: "center",
      justifyContent: "center",
    },

    timePill: {
      alignSelf: "flex-start",
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: "#6CF8BB",
    },

    timePillText: {
      color: "#00714D",
      fontSize: 12,
      fontWeight: "600",
    },

    reminderCard: {
      backgroundColor: "rgba(30,64,175,0.05)",
      borderWidth: 1,
      borderColor: "rgba(30,64,175,0.1)",
      borderRadius: 12,
      padding: 24,
      gap: 16,
    },

    reminderHeading: {
      color: "#00288E",
      fontSize: 14,
      fontWeight: "500",
    },

    reminderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },

    reminderLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      flex: 1,
    },

    notificationIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(0,40,142,0.1)",
      alignItems: "center",
      justifyContent: "center",
    },

    smsIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(0,108,73,0.1)",
      alignItems: "center",
      justifyContent: "center",
    },

    reminderTitle: {
      color: "#121C28",
      fontSize: 16,
      fontWeight: "500",
    },

    reminderSubtitle: {
      color: "#444653",
      fontSize: 12,
      fontWeight: "600",
    },

    actions: {
      paddingTop: 24,
      gap: 8,
    },

    saveButton: {
      height: 56,
      borderRadius: 12,
      backgroundColor: "#00288E",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 6,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 3,
    },

    saveButtonDisabled: {
      opacity: 0.55,
    },

    saveButtonText: {
      color: "#FFFFFF",
      fontSize: 18,
      lineHeight: 28,
      fontWeight: "700",
    },

    discardButton: {
      height: 48,
      alignItems: "center",
      justifyContent: "center",
    },

    discardText: {
      color: "#757684",
      fontSize: 14,
      fontWeight: "500",
    },
  });
