import { config } from '../config.js';
import { MEDICAL_POLICY } from '../safety/response-policy.js';
import { groqFailure, providerFailure } from './errors.js';
import type { AIMessage, AIProvider, AIProviderHealth } from './types.js';

interface GroqResponse { choices?: Array<{ message?: { content?: string } }> }

export class GroqProvider implements AIProvider {
  readonly name = 'groq';

  private async request(messages: AIMessage[], schema?: Record<string, unknown>): Promise<string> {
    const fail = (stage: string, status: number | null, code: Parameters<typeof groqFailure>[0], type: string, message: string) => {
      if (process.env.NODE_ENV !== 'production') console.debug('[GroqProvider]', { stage, status, code, type, message });
      return groqFailure(code, status === 429 ? 429 : status === 504 ? 504 : 503);
    };
    if (!config.groqApiKey) throw fail('configuration', null, 'AI_PROVIDER_AUTH_ERROR', 'configuration', 'GROQ_API_KEY is missing');
    let response: Response;
    try {
      response = await fetch(`${config.groqBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: { authorization: `Bearer ${config.groqApiKey}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          model: config.groqModel,
          messages: [{ role: 'system', content: MEDICAL_POLICY }, ...messages],
          temperature: 0.2,
          ...(schema ? { response_format: { type: 'json_schema', json_schema: { name: 'response', strict: true, schema } } } : {}),
        }),
        signal: AbortSignal.timeout(config.providerTimeoutMs),
      });
    } catch (error) {
      if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) throw fail('request',504,'AI_TIMEOUT',error.name,'Groq request timed out');
      throw fail('request',null,'AI_PROVIDER_UNAVAILABLE',error instanceof Error?error.name:'NetworkError','Groq is unreachable');
    }
    if (response.status === 401 || response.status === 403) throw fail('response',response.status,'AI_PROVIDER_AUTH_ERROR','authentication','Groq rejected the server API key');
    if (response.status === 404) throw fail('response',404,'AI_PROVIDER_MODEL_ERROR','model_or_endpoint','Configured Groq model or endpoint was not found');
    if (response.status === 400) throw fail('response',400,'AI_PROVIDER_REQUEST_ERROR','request_validation','Groq rejected the request payload');
    if (response.status === 429) throw fail('response',429,'AI_RATE_LIMITED','rate_limit','Groq rate limit reached');
    if (response.status >= 500) throw fail('response',response.status,'AI_PROVIDER_UNAVAILABLE','provider','Groq service is unavailable');
    if (!response.ok) throw fail('response',response.status,'AI_PROVIDER_REQUEST_ERROR','provider','Groq request failed');
    const payload = await response.json() as GroqResponse;
    const output = payload.choices?.[0]?.message?.content?.trim();
    if (!output) throw providerFailure('AI Care returned an empty response.');
    return output;
  }

  chat(messages: AIMessage[]) { return this.request(messages); }
  async generateStructured(messages: AIMessage[], schema: Record<string, unknown>) {
    const output = await this.request(messages, schema);
    try { return JSON.parse(output); } catch { throw providerFailure('AI Care returned an invalid structured response.'); }
  }
  async healthCheck(): Promise<AIProviderHealth> {
    return { provider: this.name, available: Boolean(config.groqApiKey), model: config.groqModel, detail: config.groqApiKey ? undefined : 'GROQ_API_KEY is not configured' };
  }
}
