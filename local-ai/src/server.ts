import express from 'express';
import { ZodError } from 'zod';

import { verifyToken } from './auth/verify-supabase-token.js';
import { config } from './config.js';
import { requireAiAccess } from './db.js';
import { chatRouter } from './routes/chat.js';
import { summariesRouter } from './routes/summaries.js';
import { symptomsRouter } from './routes/symptoms.js';
import { aiProvider } from './providers/index.js';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));
app.get('/health', async (_req, res) => res.json({ gateway: 'ok', ...(await aiProvider.healthCheck()) }));
app.use('/v1', async (req, res, next) => {
  try {
    const { user } = await verifyToken(req.headers.authorization);
    res.locals.user = user;
    await requireAiAccess(user.id);
    next();
  } catch (error) { next(error); }
});
app.use('/v1/chat', chatRouter);
app.use('/v1/symptoms', symptomsRouter);
app.use('/v1', summariesRouter);
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const value = error as { status?: number; code?: string; stage?: string; message?: string };
  const status = error instanceof ZodError ? 400 : Number(value?.status ?? 500);
  const code = value?.code ?? (status === 400 ? 'INVALID_REQUEST' : 'AI_UNAVAILABLE');
  const stage = value?.stage ?? (error instanceof ZodError ? 'validation' : 'gateway');
  const safeCodes = new Set(['AUTH_REQUIRED','AI_DISABLED','AI_CONSENT_REQUIRED','OLLAMA_UNAVAILABLE','AI_PROVIDER_REQUEST_FAILED','AI_PROVIDER_AUTH_ERROR','AI_PROVIDER_MODEL_ERROR','AI_PROVIDER_REQUEST_ERROR','AI_RATE_LIMITED','AI_TIMEOUT','AI_PROVIDER_UNAVAILABLE','AI_CONTEXT_UNAVAILABLE','AI_HISTORY_UNAVAILABLE','CONVERSATION_NOT_FOUND']);
  const message = safeCodes.has(code) ? String(value?.message) : status >= 500 ? 'AI Care is temporarily unavailable. Please try again.' : String(value?.message ?? 'Request failed');
  if (process.env.NODE_ENV !== 'production') console.debug('[AI Gateway]', { stage, status, code, message });
  res.status(status).json({ error: { stage, code, message } });
});
app.listen(config.port, '0.0.0.0', () => console.log(`Genie Cares AI gateway listening on ${config.port}`));
