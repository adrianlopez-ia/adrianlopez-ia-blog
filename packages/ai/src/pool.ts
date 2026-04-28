import { createChatStream } from './chat';
import type { ChatStreamOptions } from './chat';
import { streamLangChainChat } from './langchain';
import { getConfig } from './providers';

/**
 * Executes an AI chat with automatic failover between providers.
 * Full pool: OpenRouter -> Groc (Groq) -> Gemini (Google)
 */
async function* tryProvider(
  provider: { id: string; apiKey: string; label: string },
  options: ChatStreamOptions,
) {
  console.info(`[AI Pool] Trying ${provider.label}...`);

  const isInitialPreferred = options.provider === provider.id;
  const modelToUse = isInitialPreferred ? options.model : undefined;

  // Special case: LangChain with OpenRouter
  if (options.useLangChain && provider.id === 'openrouter' && options.messages.length > 0) {
    yield { type: 'meta', provider: 'openrouter', model: 'langchain-openrouter' };
    const lastMessage = options.messages[options.messages.length - 1];
    if (lastMessage) {
      for await (const chunk of streamLangChainChat(provider.apiKey, lastMessage.content)) {
        yield { type: 'content', content: chunk };
      }
      return true;
    }
  }

  // Standard Vercel AI SDK stream
  const stream = createChatStream({
    ...options,
    provider: provider.id as any,
    model: modelToUse,
  });

  yield { type: 'meta', provider: provider.id, model: modelToUse ?? 'default' };

  let hasYieldedContent = false;
  for await (const chunk of stream.textStream) {
    if (chunk) {
      hasYieldedContent = true;
      yield { type: 'content', content: chunk };
    }
  }

  return hasYieldedContent;
}

/**
 * Executes an AI chat with automatic failover between providers.
 * Full pool: OpenRouter -> Groc (Groq) -> Gemini (Google)
 */
export async function* createPoolChatStream(options: ChatStreamOptions) {
  const config = getConfig();

  const providersToTry = [
    { id: 'openrouter', apiKey: config.openrouterKey, label: 'OpenRouter' },
    { id: 'groc', apiKey: config.groqKey, label: 'Groc' },
    { id: 'gemini', apiKey: config.geminiKey, label: 'Google Gemini' },
  ].filter((p): p is { id: string; apiKey: string; label: string } => !!p.apiKey);

  let lastError: unknown = null;

  for (const provider of providersToTry) {
    try {
      const success = yield* tryProvider(provider, options);
      if (success) return;
      throw new Error(`Provider ${provider.label} returned an empty stream`);
    } catch (err) {
      console.warn(`[AI Pool] ${provider.label} failed:`, err instanceof Error ? err.message : err);
      lastError = err;
    }
  }

  throw lastError ?? new Error('All AI providers in the pool failed');
}
