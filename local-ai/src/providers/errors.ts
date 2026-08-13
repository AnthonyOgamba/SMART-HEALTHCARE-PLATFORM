export const ollamaUnavailable = (detail?: string) =>
  Object.assign(
    new Error('AI Care is currently unavailable. Start the local AI service and try again.'),
    { status: 503, code: 'OLLAMA_UNAVAILABLE', stage: 'provider', detail },
  );

export const providerFailure = (message = 'AI Care could not complete this request.') =>
  Object.assign(new Error(message), { status: 502, code: 'AI_PROVIDER_REQUEST_FAILED', stage: 'provider' });

export const groqFailure = (code: 'AI_PROVIDER_AUTH_ERROR'|'AI_PROVIDER_MODEL_ERROR'|'AI_PROVIDER_REQUEST_ERROR'|'AI_RATE_LIMITED'|'AI_TIMEOUT'|'AI_PROVIDER_UNAVAILABLE', status: number) =>
  Object.assign(new Error('Genie Cares is temporarily unavailable. Please try again.'), { status, code, stage: 'provider' });
