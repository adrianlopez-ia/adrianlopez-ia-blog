import { createChatStream } from './chat';
import type { ChatStreamOptions } from './chat';
import { streamLangChainChat } from './langchain';
import { getConfig } from './providers';

/**
 * Executes an AI chat with automatic failover between providers.
 * Full pool: OpenRouter -> Groc (Groq) -> Gemini (Google)
 */
export async function* createPoolChatStream(options: ChatStreamOptions) {
  const config = getConfig();

  // Define the pool of providers to try in order
  const providersToTry = [
    { id: 'openrouter', apiKey: config.openrouterKey, label: 'OpenRouter' },
    { id: 'groc', apiKey: config.groqKey, label: 'Groc' },
    { id: 'gemini', apiKey: config.geminiKey, label: 'Google Gemini' },
  ].filter((p) => !!p.apiKey);

  let lastError: any = null;

  for (const provider of providersToTry) {
    try {
      console.info(`[AI Pool] Trying ${provider.label}...`);

      // Select model: Use requested model if it's the first attempt and provider matches,
      // otherwise fallback to the default model for the current provider in the pool.
      const isInitialPreferred = options.provider === provider.id;
      const modelToUse = isInitialPreferred ? options.model : undefined;

      // Special case: LangChain with OpenRouter
      if (options.useLangChain && provider.id === 'openrouter' && options.messages.length > 0) {
        yield { type: 'meta', provider: 'openrouter', model: 'langchain-openrouter' };
        const lastMessage = options.messages[options.messages.length - 1];
        if (lastMessage) {
          for await (const chunk of streamLangChainChat(provider.apiKey!, lastMessage.content)) {
            yield { type: 'content', content: chunk };
          }
          return; // Success with LangChain
        }
      }

      // Standard Vercel AI SDK stream
      const stream = createChatStream({
        ...options,
        provider: provider.id as any,
        model: modelToUse,
      });

      // Yield metadata so UI knows who is responding
      yield {
        type: 'meta',
        provider: provider.id,
        model: modelToUse ?? 'default',
      };

      let hasYieldedContent = false;
      for await (const chunk of stream.textStream) {
        if (chunk) {
          hasYieldedContent = true;
          yield { type: 'content', content: chunk };
        }
      }

      if (hasYieldedContent) {
        return; // Success!
      } else {
        throw new Error(`Provider ${provider.label} returned an empty stream`);
      }
    } catch (err: any) {
      console.warn(`[AI Pool] ${provider.label} failed:`, err.message);
      lastError = err;
      // Continue to next provider in the pool
    }
  }

  throw lastError ?? new Error('All AI providers in the pool failed');
}
