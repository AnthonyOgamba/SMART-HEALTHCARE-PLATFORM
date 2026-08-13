export type AIMessageRole = 'system' | 'user' | 'assistant';

export interface AIMessage {
  role: AIMessageRole;
  content: string;
}

export interface AIProviderHealth {
  provider: string;
  available: boolean;
  model: string;
  detail?: string;
}

export interface AIProvider {
  readonly name: string;
  chat(messages: AIMessage[]): Promise<string>;
  generateStructured(messages: AIMessage[], schema: Record<string, unknown>): Promise<unknown>;
  healthCheck(): Promise<AIProviderHealth>;
}
