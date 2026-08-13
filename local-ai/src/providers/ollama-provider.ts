import { config } from '../config.js';
import { MEDICAL_POLICY } from '../safety/response-policy.js';
import { ollamaUnavailable, providerFailure } from './errors.js';
import type { AIMessage, AIProvider, AIProviderHealth } from './types.js';

interface OllamaChatResponse { message?: { content?: string } }

export class OllamaProvider implements AIProvider {
  readonly name = 'ollama';

  private async request(messages: AIMessage[], format?: Record<string, unknown>): Promise<string> {
    let response: Response;
    try {
      response = await fetch(`${config.ollamaBaseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: 'system', content: MEDICAL_POLICY }, ...messages],
          stream: false,
          keep_alive: config.ollamaKeepAlive,
          ...(format ? { format } : {}),
        }),
        signal: AbortSignal.timeout(config.providerTimeoutMs),
      });
    } catch (error) {
      throw ollamaUnavailable(error instanceof Error ? error.message : 'Connection failed');
    }

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      if (response.status === 404 || response.status >= 500) throw ollamaUnavailable(detail);
      throw providerFailure();
    }

    const payload = await response.json() as OllamaChatResponse;
    const output = payload.message?.content?.trim();
    if (!output) throw providerFailure('AI Care returned an empty response.');
    return output;
  }

  chat(messages: AIMessage[]): Promise<string> {
    return this.request(messages);
  }

  async generateStructured(messages: AIMessage[], schema: Record<string, unknown>): Promise<unknown> {
    const output = await this.request(messages, schema);
    try {
      return JSON.parse(output);
    } catch {
      throw providerFailure('AI Care returned an invalid structured response.');
    }
  }

  async healthCheck(): Promise<AIProviderHealth> {
    try {
      const response = await fetch(`${config.ollamaBaseUrl}/api/tags`, {
        signal: AbortSignal.timeout(3_000),
      });
      if (!response.ok) return { provider: this.name, available: false, model: config.model, detail: `HTTP ${response.status}` };
      const payload = await response.json() as { models?: Array<{ name?: string; model?: string }> };
      const available = payload.models?.some(item => item.name === config.model || item.model === config.model) ?? false;
      return { provider: this.name, available, model: config.model, detail: available ? undefined : 'Configured model is not installed' };
    } catch {
      return { provider: this.name, available: false, model: config.model, detail: 'Ollama is not reachable' };
    }
  }
}
