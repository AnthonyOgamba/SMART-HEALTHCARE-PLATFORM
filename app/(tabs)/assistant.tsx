import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/ui/screen-states";
import { PageTypography } from "@/constants/theme";
import { usePalette, type ThemePalette } from "@/hooks/use-palette";

type Message = {
  id: number;
  sender: "ai" | "user";
  text: string;
  time: string;
  emergency?: boolean;
};

const initialMessages: Message[] = [
  {
    id: 1,
    sender: "ai",
    text: "Hello! I'm your AI Health Assistant. I noticed your blood pressure was slightly elevated this morning. How are you feeling right now?",
    time: "10:42 AM",
  },
  {
    id: 2,
    sender: "user",
    text: "I'm feeling a bit dizzy and have a mild headache. I took my prescribed Lisinopril about 30 minutes ago.",
    time: "10:45 AM",
  },
];

export default function AssistantScreen() {
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [typing, setTyping] = useState(true);

  const getTime = () =>
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const sendMessage = () => {
    const cleanMessage = input.trim();

    if (!cleanMessage) {
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: cleanMessage,
      time: getTime(),
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setTyping(true);

    const lower = cleanMessage.toLowerCase();

    let response =
      "Thanks for sharing that. Based on what you described, monitor how you feel, stay hydrated, and avoid sudden movements. If your symptoms become severe, persistent, or concerning, contact a healthcare professional.";

    let emergency = false;

    if (
      lower.includes("chest pain") ||
      lower.includes("cannot breathe") ||
      lower.includes("can't breathe") ||
      lower.includes("difficulty breathing") ||
      lower.includes("severe bleeding") ||
      lower.includes("unconscious")
    ) {
      emergency = true;

      response =
        "Severe chest pain, trouble breathing, heavy bleeding, or loss of consciousness can be a medical emergency. Call 911 or seek emergency care immediately.";
    } else if (lower.includes("dizzy") || lower.includes("dizziness")) {
      response =
        "Dizziness can have several causes. Sit or lie down somewhere safe, stand up slowly, drink water if appropriate, and monitor your symptoms. If you faint, develop chest pain, have trouble breathing, or your symptoms become severe, seek urgent medical care.";
    } else if (lower.includes("headache")) {
      response =
        "For a mild headache, resting, drinking water, and limiting bright light may help. A sudden extremely severe headache, confusion, weakness, fainting, or vision changes need urgent medical evaluation.";
    } else if (lower.includes("medication") || lower.includes("lisinopril")) {
      response =
        "I can help you review your medication schedule and general medication information, but do not change or stop a prescribed medication without speaking with your doctor or pharmacist.";
    }

    setTimeout(() => {
      const aiMessage: Message = {
        id: Date.now() + 1,
        sender: "ai",
        text: response,
        time: getTime(),
        emergency,
      };

      setMessages((current) => [...current, aiMessage]);
      setTyping(false);
    }, 700);
  };

  return (
    <ScreenContainer style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Care Assistant</Text>
      </View>

      <View style={styles.dateRow}>
        <View style={styles.datePill}>
          <Text style={styles.dateText}>Today</Text>
        </View>
      </View>

      <View style={styles.featureRow}>
        <Pressable
          style={styles.featureCard}
          onPress={() => setInput("I want to check my symptoms")}
        >
          <View style={styles.featureIconBlue}>
            <MaterialIcons name="health-and-safety" size={22} color={theme.primary} />
          </View>

          <Text style={styles.featureTitle}>Check Symptoms</Text>
        </Pressable>

        <Pressable
          style={styles.featureCard}
          onPress={() => setInput("Help me understand my medications")}
        >
          <View style={styles.featureIconGreen}>
            <MaterialIcons name="medication" size={22} color={theme.accent} />
          </View>

          <Text style={styles.featureTitle}>Medication Help</Text>
        </Pressable>

        <Pressable
          style={styles.featureCard}
          onPress={() => setInput("Explain my recent health trends")}
        >
          <View style={styles.featureIconPurple}>
            <MaterialIcons name="insights" size={22} color={theme.accent} />
          </View>

          <Text style={styles.featureTitle}>Health Insights</Text>
        </Pressable>
      </View>

      <View style={styles.chatArea}>
        {messages.map((message) =>
          message.sender === "ai" ? (
            <View key={message.id} style={styles.aiMessageRow}>
              <View style={styles.aiAvatar}>
                <MaterialIcons name="auto-awesome" size={19} color="#FFFFFF" />
              </View>

              <View
                style={[
                  styles.aiBubble,
                  message.emergency && styles.emergencyBubble,
                ]}
              >
                {message.emergency && (
                  <View style={styles.emergencyHeader}>
                    <MaterialIcons name="warning" size={20} color="#B42318" />

                    <Text style={styles.emergencyTitle}>Emergency Warning</Text>
                  </View>
                )}

                <Text
                  style={[
                    styles.aiMessageText,
                    message.emergency && styles.emergencyText,
                  ]}
                >
                  {message.text}
                </Text>

                <Text style={styles.aiTime}>{message.time}</Text>

                {message.emergency && (
                  <Pressable style={styles.emergencyButton}>
                    <MaterialIcons name="phone" size={20} color="#FFFFFF" />

                    <Text style={styles.emergencyButtonText}>
                      Call Emergency Services
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          ) : (
            <View key={message.id} style={styles.userMessageRow}>
              <View style={styles.userBubble}>
                <Text style={styles.userMessageText}>{message.text}</Text>

                <Text style={styles.userTime}>{message.time}</Text>
              </View>

              <View style={styles.userAvatar}>
                <MaterialIcons
                  name="person-outline"
                  size={21}
                  color="#FFFFFF"
                />
              </View>
            </View>
          ),
        )}

        {typing && (
          <View style={styles.aiMessageRow}>
            <View style={styles.aiAvatarMuted}>
              <MaterialIcons name="auto-awesome" size={19} color="#FFFFFF" />
            </View>

            <View>
              <View style={styles.typingBubble}>
                <View style={styles.dot} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>

              <Text style={styles.typingText}>SmartCare AI is typing...</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.inputSection}>
        <View style={styles.inputContainer}>
          <Pressable style={styles.plusButton}>
            <MaterialIcons
              name="add-circle-outline"
              size={24}
              color="#757684"
            />
          </Pressable>

          <TextInput
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
            placeholder="Ask about your health..."
            placeholderTextColor="#757684"
            style={styles.input}
            returnKeyType="send"
          />

          <Pressable style={styles.micButton}>
            <MaterialIcons name="mic-none" size={23} color="#757684" />
          </Pressable>

          <Pressable style={styles.sendButton} onPress={sendMessage}>
            <MaterialIcons name="send" size={21} color="#FFFFFF" />
          </Pressable>
        </View>

        <Text style={styles.disclaimer}>
          AI insights are for informational purposes. Consult a doctor for
          medical concerns and seek emergency care when needed.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const makeStyles = (theme: ThemePalette) => StyleSheet.create({
  content: {
    padding: 0,
    paddingBottom: 110,
    backgroundColor: theme.screenBg,
  },

  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: theme.screenBg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.cardBorder,
  },

  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
  },

  headerTitle: {
    color: theme.accent,
    ...PageTypography.title,
  },

  dateRow: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 16,
  },

  datePill: {
    backgroundColor: theme.blueTint,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },

  dateText: {
    color: theme.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },

  featureRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 24,
  },

  featureCard: {
    flex: 1,
    minHeight: 92,
    backgroundColor: theme.cardBg,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  featureIconBlue: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.blueTint,
    alignItems: "center",
    justifyContent: "center",
  },

  featureIconGreen: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.backgroundWash,
    alignItems: "center",
    justifyContent: "center",
  },

  featureIconPurple: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.backgroundWash,
    alignItems: "center",
    justifyContent: "center",
  },

  featureTitle: {
    color: theme.textPrimary,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },

  chatArea: {
    paddingHorizontal: 16,
    gap: 24,
  },

  aiMessageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.accent,
    alignItems: "center",
    justifyContent: "center",
  },

  aiAvatarMuted: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.blueIcon,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.8,
  },

  aiBubble: {
    flex: 1,
    backgroundColor: theme.cardBg,
    borderWidth: 1,
    borderColor: theme.inputBorder,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 17,
  },

  aiMessageText: {
    color: theme.textPrimary,
    fontSize: 16,
    lineHeight: 24,
  },

  aiTime: {
    color: theme.textMuted,
    fontSize: 10,
    marginTop: 8,
  },

  userMessageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-end",
    gap: 12,
  },

  userBubble: {
    flex: 1,
    maxWidth: "80%",
    backgroundColor: theme.primary,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 16,
  },

  userMessageText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 24,
  },

  userTime: {
    color: "#B8C4FF",
    fontSize: 10,
    marginTop: 8,
    textAlign: "right",
  },

  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.accent,
    alignItems: "center",
    justifyContent: "center",
  },

  typingBubble: {
    height: 50,
    minWidth: 110,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: theme.blueTint,
    borderWidth: 1,
    borderColor: theme.inputBorder,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#757684",
  },

  typingText: {
    color: theme.textMuted,
    fontSize: 12,
    fontStyle: "italic",
    fontWeight: "600",
    marginTop: 8,
  },

  emergencyBubble: {
    backgroundColor: "#FFF2F0",
    borderColor: "#D92D20",
  },

  emergencyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 8,
  },

  emergencyTitle: {
    color: "#B42318",
    fontSize: 14,
    fontWeight: "700",
  },

  emergencyText: {
    color: "#7A271A",
    fontWeight: "600",
  },

  emergencyButton: {
    minHeight: 48,
    marginTop: 14,
    backgroundColor: "#B42318",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
  },

  emergencyButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  inputSection: {
    paddingHorizontal: 16,
    paddingTop: 32,
    gap: 12,
  },

  inputContainer: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.cardBg,
    borderWidth: 1,
    borderColor: theme.inputBorder,
    borderRadius: 999,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  plusButton: {
    width: 34,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  input: {
    flex: 1,
    minHeight: 48,
    color: theme.textPrimary,
    fontSize: 16,
    paddingHorizontal: 8,
  },

  micButton: {
    width: 38,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  disclaimer: {
    color: theme.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 12,
  },
});
