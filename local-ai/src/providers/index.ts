import { config } from '../config.js';
import { OllamaProvider } from './ollama-provider.js';
import { GroqProvider } from './groq-provider.js';
import type { AIMessage, AIProvider } from './types.js';

const createProvider = (): AIProvider => {
  switch (config.aiProvider) {
    case 'groq': return new GroqProvider();
    case 'ollama': return new OllamaProvider();
    default: throw new Error(`Unsupported AI_PROVIDER: ${config.aiProvider}`);
  }
};

export const aiProvider = createProvider();

export const generateAiResponse = (prompt: string) =>
  aiProvider.chat([{ role: 'user', content: prompt }]);

export const generateStructuredResponse = (prompt: string, schema: Record<string, unknown>) =>
  aiProvider.generateStructured([{ role: 'user', content: prompt }], schema);

export type { AIMessage, AIProvider } from './types.js';
