// Bootstrap: load env FIRST via dotenv before any other imports
// This works with ESM because this file is the entrypoint and uses dynamic imports

import { resolve } from 'node:path';
import { config } from 'dotenv';

// Load root .env — must run before any other module initializes
config({ path: resolve(process.cwd(), '../../.env') });

// Fallback: Some SDKs (like LangChain's OpenAI) strictly check for OPENAI_API_KEY
// even when using a custom baseURL like OpenRouter.
if (!process.env.OPENAI_API_KEY && process.env.OPENROUTER_API_KEY) {
  process.env.OPENAI_API_KEY = process.env.OPENROUTER_API_KEY;
}

// Now dynamically import the app so env vars are available for all modules
const { serve } = await import('@hono/node-server');
const { app } = await import('./app');

const port = Number(process.env.PORT) || 3000;

serve({ fetch: app.fetch, port }, (info) => {
  console.info(`✅ API running at http://localhost:${info.port}`);
  console.info(`   Turso: ${process.env.TURSO_DATABASE_URL ? '✅ configured' : '❌ missing'}`);
  console.info(`   OpenRouter: ${process.env.OPENROUTER_API_KEY ? '✅ configured' : '❌ missing'}`);
  console.info(`   Groc: ${process.env.GROQ_API_KEY ? '✅ configured' : '❌ missing'}`);
  console.info(`   Gemini: ${process.env.GEMINI_API_KEY ? '✅ configured' : '❌ missing'}`);
  console.info(`   Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? '✅ configured' : '❌ missing'}`);
});
