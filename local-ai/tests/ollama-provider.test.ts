import assert from 'node:assert/strict';
import test from 'node:test';

import { OllamaProvider } from '../src/providers/ollama-provider.js';

const originalFetch = globalThis.fetch;

test.afterEach(() => { globalThis.fetch = originalFetch; });

test('basic chat uses Ollama and returns content without a fallback', async () => {
  let requestBody: Record<string, unknown> | undefined;
  globalThis.fetch = async (_input, init) => {
    requestBody = JSON.parse(String(init?.body));
    return new Response(JSON.stringify({ message: { content: 'Hello from Ollama' } }), { status: 200 });
  };
  const output = await new OllamaProvider().chat([{ role: 'user', content: 'Hello' }]);
  assert.equal(output, 'Hello from Ollama');
  assert.equal(requestBody?.stream, false);
  assert.equal(requestBody?.keep_alive, '0');
});

test('structured symptom response sends the JSON schema and parses output', async () => {
  const schema = { type: 'object', properties: { urgency: { type: 'string' } }, required: ['urgency'] };
  let requestBody: Record<string, unknown> | undefined;
  globalThis.fetch = async (_input, init) => {
    requestBody = JSON.parse(String(init?.body));
    return new Response(JSON.stringify({ message: { content: '{"urgency":"routine"}' } }), { status: 200 });
  };
  const output = await new OllamaProvider().generateStructured([{ role: 'user', content: 'headache' }], schema);
  assert.deepEqual(output, { urgency: 'routine' });
  assert.deepEqual(requestBody?.format, schema);
});

test('health check reports configured model availability', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ models: [{ name: 'llama3.2:3b' }] }), { status: 200 });
  assert.deepEqual(await new OllamaProvider().healthCheck(), { provider: 'ollama', available: true, model: 'llama3.2:3b', detail: undefined });
});

test('connection failure returns the explicit unavailable error', async () => {
  globalThis.fetch = async () => { throw new Error('connection refused'); };
  await assert.rejects(
    () => new OllamaProvider().chat([{ role: 'user', content: 'Hello' }]),
    (error: unknown) => {
      const value = error as { code?: string; message?: string };
      return value.code === 'OLLAMA_UNAVAILABLE' && value.message === 'AI Care is currently unavailable. Start the local AI service and try again.';
    },
  );
});
