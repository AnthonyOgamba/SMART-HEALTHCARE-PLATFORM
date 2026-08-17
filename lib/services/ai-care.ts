import { healthService } from '@/lib/health/health-service';
import { supabase } from '@/lib/supabase/client';

const baseUrl = process.env.EXPO_PUBLIC_AI_GATEWAY_URL;

export class AiCareError extends Error {
  constructor(message: string, public code: string, public status: number) { super(message); }
}

async function request<T>(path: string, body: unknown): Promise<T> {
  if (!baseUrl) throw new AiCareError('Genie Cares gateway is not configured on this device. Check EXPO_PUBLIC_AI_GATEWAY_URL and restart Expo.', 'NOT_CONFIGURED', 503);
  const { data, error: sessionError } = await supabase.auth.getSession();
  const session = data.session;
  const token = session?.access_token;
  if (__DEV__) console.debug('[AI Care]', { stage: 'mobile-session', hasSession: !!session, hasAccessToken: !!token, userId: session?.user?.id ?? null, expiresAt: session?.expires_at ?? null, sessionError: sessionError?.message ?? null, authorizationHeaderPresent: !!token, authorizationScheme: 'Bearer' });
  if (!token) throw new AiCareError('Log in to use Genie Cares.', 'AUTH_REQUIRED', 401);
  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
    const payload = await response.json();
    if (!response.ok) {
      const failure = new AiCareError(payload?.error?.message ?? 'Genie Cares request failed.', payload?.error?.code ?? 'REQUEST_FAILED', response.status);
      if (__DEV__) console.debug('[AI Care]', { stage: payload?.error?.stage ?? 'gateway', status: response.status, code: failure.code, message: failure.message });
      throw failure;
    }
    return payload as T;
  } catch (error) {
    if (error instanceof AiCareError) throw error;
    if (__DEV__) console.debug('[AI Care]', { stage: 'gateway', status: 0, code: 'GATEWAY_UNAVAILABLE', message: error instanceof Error ? error.message : 'Network request failed' });
    throw new AiCareError('This phone could not reach the Genie Cares gateway. Check the gateway address, Wi-Fi, and firewall, then try again.', 'GATEWAY_UNAVAILABLE', 503);
  }
}

export type AiMessage = { role: 'assistant'; content: string };
export type ConversationMessage = { id: string; role: 'user' | 'assistant'; content: string; created_at: string };
const asksAboutActivity = (message: string) => /\b(step|steps|walk|walking|active|activity)\b/i.test(message);

export const sendAiMessage = async (message: string, conversationId?: string, intent?: string) => {
  const activity = asksAboutActivity(message) ? await healthService.getTodayActivity() : null;
  const activity_context = activity?.steps === null || activity?.steps === undefined ? undefined : { steps: activity.steps, source: activity.source };
  return request<{ conversation_id: string; message: AiMessage; intent: string }>('/v1/chat', { message, conversation_id: conversationId, intent, timezone_offset_minutes: new Date().getTimezoneOffset(), activity_context });
};
export const summarizeMyDay = () => request<{ summary: string }>('/v1/day', { timezone_offset_minutes: new Date().getTimezoneOffset() });
export const prepareForAppointment = (id: string) => request<{ summary: string }>('/v1/appointment-prep', { id });
export const summarizeHealthHistory = (from: string, to: string) => request<{ summary: string }>('/v1/health-history', { from, to });
export const assessSymptoms = (input: { symptoms: string[]; severity: 'mild' | 'moderate' | 'severe'; duration: string; associated_symptoms: string[]; context?: string }) => request<any>('/v1/symptoms', input);

export async function getConversations() {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) throw new AiCareError('Log in to view conversations.', 'AUTH_REQUIRED', 401);
  const { data, error } = await supabase.from('conversations').select('*').eq('user_id', authData.user.id).is('archived_at', null).order('updated_at', { ascending: false }).limit(20);
  if (error) throw error;
  return data;
}
export async function getConversationMessages(conversationId: string) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) throw new AiCareError('Log in to view conversations.', 'AUTH_REQUIRED', 401);
  const { data: ownedConversation, error: ownerError } = await supabase.from('conversations').select('id').eq('id', conversationId).eq('user_id', authData.user.id).maybeSingle();
  if (ownerError) throw ownerError;
  if (!ownedConversation) throw new AiCareError('Conversation not found for this account.', 'CONVERSATION_NOT_FOUND', 404);
  const { data, error } = await supabase.from('conversation_messages').select('id,role,content,created_at').eq('conversation_id', conversationId).order('created_at');
  if (error) throw error;
  return (data ?? []).filter((item): item is ConversationMessage => item.role === 'user' || item.role === 'assistant');
}
