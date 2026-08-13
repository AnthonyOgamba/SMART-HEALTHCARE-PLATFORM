import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { cleanAiText } from '@/components/my-day-summary-modal';
import { Spacing } from '@/constants/theme';
import { usePalette, type ThemePalette } from '@/hooks/use-palette';
import {
  AiCareError,
  getConversationMessages,
  getConversations,
  sendAiMessage,
  type ConversationMessage,
} from '@/lib/services/ai-care';
import { useAuth } from '@/providers/auth-provider';

type Message = Pick<ConversationMessage, 'id' | 'role' | 'content'>;

const suggestions = [
  'How did I do with my medications this week?',
  "What's on my schedule today?",
  'How active was I today?',
  'Help me prepare for my next appointment.',
  'Summarize my recent health activity.',
  'Review my recent sleep.',
];

export default function AssistantScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const listRef = useRef<FlatList<Message>>(null);
  const tabBarHeight = useBottomTabBarHeight();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>();

  const scrollToLatest = useCallback(() => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, []);

  useEffect(() => {
    let active = true;
    setConversationId(undefined);
    setMessages([]);
    setErrorMessage(undefined);
    setHistoryLoading(true);
    (async () => {
      try {
        const recent = await getConversations();
        const latest = recent[0];
        if (!active || !latest) return;
        const history = await getConversationMessages(latest.id);
        if (!active) return;
        setConversationId(latest.id);
        setMessages(history);
      } catch (error) {
        if (__DEV__) console.debug('[AI Care] Conversation history unavailable', error);
        if (active) setErrorMessage('Recent conversations could not be loaded. You can still start a new chat.');
      } finally {
        if (active) setHistoryLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user?.id]);

  useEffect(scrollToLatest, [messages, scrollToLatest]);

  const showError = (error: unknown) => {
    if (error instanceof AiCareError) {
      if (error.code === 'AI_CONSENT_REQUIRED' || error.code === 'CONSENT_REQUIRED') {
        setErrorMessage('Genie Cares processing consent is required. Tap here to review consent.');
        return;
      }
      if (error.code === 'AI_DISABLED') {
        setErrorMessage('Genie Cares is disabled. Tap here to open Settings.');
        return;
      }
      if (error.code === 'AUTH_REQUIRED') {
        setErrorMessage('Your session has expired. Please log in again.');
        return;
      }
      setErrorMessage(error.message);
      return;
    }
    setErrorMessage('Genie Cares is temporarily unavailable. Please try again.');
  };

  const ask = async (text = input) => {
    const clean = text.trim();
    if (!clean || loading) return;
    const pending: Message = { id: `user-${Date.now()}`, role: 'user', content: clean };
    setMessages((current) => [...current, pending]);
    setInput('');
    setErrorMessage(undefined);
    setLoading(true);
    try {
      const result = await sendAiMessage(clean, conversationId);
      setConversationId(result.conversation_id);
      setMessages((current) => [...current, { id: `assistant-${Date.now()}`, ...result.message }]);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleErrorPress = () => {
    if (errorMessage?.includes('consent')) router.push('/consent-management');
    else if (errorMessage?.includes('disabled')) router.push('/settings');
  };

  const newChat = () => {
    setConversationId(undefined);
    setMessages([]);
    setInput('');
    setErrorMessage(undefined);
  };

  const emptyChat = (
    <View style={styles.emptyState}>
      <View style={styles.aiMark}><MaterialIcons name="health-and-safety" size={24} color={theme.primary} /></View>
      <ThemedText style={styles.emptyTitle}>Hello. I&apos;m Genie, your AI care assistant.</ThemedText>
      <ThemedText style={styles.emptyBody}>How can I help with your care today?</ThemedText>
      <View style={styles.suggestions}>
        {suggestions.map((suggestion) => (
          <Pressable key={suggestion} style={styles.suggestion} onPress={() => void ask(suggestion)}>
            <ThemedText style={styles.suggestionText}>{suggestion}</ThemedText>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? tabBarHeight : 0}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Genie Cares</ThemedText>
          {(messages.length > 0 || conversationId) && (
            <Pressable accessibilityRole="button" onPress={newChat} hitSlop={8}>
              <ThemedText style={styles.newChat}>New Chat</ThemedText>
            </Pressable>
          )}
        </View>

        <View style={styles.safetyBanner}>
          <MaterialIcons name="info-outline" size={18} color={theme.infoBoxText} />
          <ThemedText style={styles.safetyText}>Genie Cares provides general health information and can summarize information you record. It does not replace professional medical advice.</ThemedText>
        </View>

        {errorMessage && (
          <Pressable style={styles.errorBanner} onPress={handleErrorPress}>
            <MaterialIcons name="error-outline" size={17} color={theme.danger} />
            <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
          </Pressable>
        )}

        <FlatList
          showsVerticalScrollIndicator={false}
          ref={listRef}
          style={styles.messageList}
          contentContainerStyle={[styles.messageContent, messages.length === 0 && styles.emptyContent]}
          data={messages}
          keyExtractor={(item) => item.id}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={scrollToLatest}
          ListEmptyComponent={historyLoading ? <ActivityIndicator color={theme.primary} /> : emptyChat}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
              <ThemedText style={item.role === 'user' ? styles.userText : styles.aiText}>{item.role === 'assistant' ? cleanAiText(item.content) : item.content}</ThemedText>
            </View>
          )}
          ListFooterComponent={loading ? (
            <View style={[styles.bubble, styles.aiBubble, styles.thinkingBubble]}>
              <ActivityIndicator size="small" color={theme.primary} />
              <ThemedText style={styles.thinkingText}>Genie Cares is thinking…</ThemedText>
            </View>
          ) : null}
        />

        <View style={styles.composer}>
          <TextInput
            accessibilityLabel="Ask Genie Cares"
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask Genie Cares..."
            placeholderTextColor={theme.placeholder}
            multiline
            maxLength={4000}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send message"
            disabled={!input.trim() || loading}
            style={({ pressed }) => [styles.send, (!input.trim() || loading) && styles.sendDisabled, pressed && styles.pressed]}
            onPress={() => void ask()}>
            <MaterialIcons name="send" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (theme: ThemePalette) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.screenBg },
  keyboardView: { flex: 1, paddingHorizontal: Spacing.md },
  header: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 26, lineHeight: 34, fontWeight: '800', color: theme.primary },
  newChat: { color: theme.secondary, fontSize: 14, fontWeight: '700' },
  safetyBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: theme.infoBoxBg, borderColor: theme.infoBoxBorder, borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 },
  safetyText: { flex: 1, color: theme.infoBoxText, fontSize: 11.5, lineHeight: 16 },
  actionRow: { flexDirection:'row', flexWrap:'wrap', gap: 8, paddingVertical: 10 },
  action: { width: '48%', minHeight: 64, flexGrow:1, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 14, borderWidth: 1, borderColor: theme.cardBorder, backgroundColor: theme.cardBg, paddingHorizontal: 11 },
  actionText: { flex: 1, color: theme.textPrimary, fontSize: 12, lineHeight: 16, fontWeight: '700' },
  dayAction: { backgroundColor: theme.primary, borderColor: theme.primary },
  dayActionText: { flex: 1, color: '#FFFFFF', fontSize: 12, lineHeight: 16, fontWeight: '700' },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: theme.redTint, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 4 },
  errorText: { flex: 1, color: theme.danger, fontSize: 12, lineHeight: 17 },
  messageList: { flex: 1 },
  messageContent: { flexGrow: 1, gap: 9, paddingVertical: 8 },
  emptyContent: { justifyContent: 'center' },
  emptyState: { alignItems: 'center', paddingHorizontal: 16, gap: 7 },
  aiMark: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.blueTint },
  emptyTitle: { color: theme.textPrimary, fontSize: 17, fontWeight: '700' },
  emptyBody: { maxWidth: 320, color: theme.textSecondary, fontSize: 13, lineHeight: 18, textAlign: 'center' },
  suggestions: { width: '100%', flexDirection:'row', flexWrap:'wrap', justifyContent:'center', gap: 7, marginTop: 8 },
  suggestion: { maxWidth: '100%', borderWidth: 1, borderColor: theme.inputBorder, backgroundColor: theme.cardBg, borderRadius: 18, paddingHorizontal: 13, paddingVertical: 8 },
  suggestionText: { color: theme.secondary, fontSize: 12, lineHeight: 16, textAlign: 'center' },
  bubble: { maxWidth: '86%', borderRadius: 16, paddingHorizontal: 13, paddingVertical: 9 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: theme.primary, borderBottomRightRadius: 5 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: theme.cardBg, borderWidth: 1, borderColor: theme.cardBorder, borderBottomLeftRadius: 5 },
  userText: { color: '#FFFFFF', fontSize: 14, lineHeight: 20 },
  aiText: { color: theme.textPrimary, fontSize: 14, lineHeight: 20 },
  thinkingBubble: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  thinkingText: { color: theme.textSecondary, fontSize: 13 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, backgroundColor: theme.cardBg, borderWidth: 1, borderColor: theme.inputBorder, borderRadius: 18, padding: 7, marginTop: 5, marginBottom: 7 },
  input: { flex: 1, minHeight: 42, maxHeight: 112, color: theme.textPrimary, paddingHorizontal: 10, paddingVertical: 10, fontSize: 15 },
  send: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#1B4F72', alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { backgroundColor: theme.disabledBackground },
  pressed: { opacity: 0.82 },
});
