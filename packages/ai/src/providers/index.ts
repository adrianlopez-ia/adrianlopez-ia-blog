import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { createOpenAI } from '@ai-sdk/openai';
import { type AiProvider, DEFAULT_MODELS } from '@blog/types';
import type { LanguageModel } from 'ai';

export interface ProviderConfig {
  openrouterKey?: string;
  groqKey?: string;
  geminiKey?: string;
}

export function getConfig(): ProviderConfig {
  return {
    openrouterKey: process.env.OPENROUTER_API_KEY,
    groqKey: process.env.GROQ_API_KEY,
    geminiKey: process.env.GEMINI_API_KEY,
  };
}

export function getProvider(provider: AiProvider, config?: ProviderConfig) {
  const c = config ?? getConfig();
  switch (provider) {
    case 'openrouter':
      return createOpenAI({
        apiKey: c.openrouterKey ?? '',
        baseURL: 'https://openrouter.ai/api/v1',
        headers: {
          'HTTP-Referer': process.env.PUBLIC_SITE_URL ?? 'http://localhost:4321',
          'X-Title': 'Adrián López IA Blog',
        },
      });

    case 'groc':
      return createGroq({ apiKey: c.groqKey ?? '' });

    case 'gemini':
      return createGoogleGenerativeAI({ apiKey: c.geminiKey ?? '' });
  }
}

type ProviderModelFactory = (modelId: string) => LanguageModel;

export function getModel(
  provider: AiProvider,
  modelId?: string,
  config?: ProviderConfig,
): LanguageModel {
  const model = modelId ?? DEFAULT_MODELS[provider];
  if (!model) {
    throw new Error(`Missing default model for provider: ${provider}`);
  }
  const p = getProvider(provider, config);
  return (p as unknown as ProviderModelFactory)(model);
}

/** Returns the available providers list with their models */
export function getAvailableProviders() {
  return [
    {
      id: 'openrouter' as AiProvider,
      name: 'OpenRouter',
      description: 'Access hundreds of models via a single API',
      models: [
        {
          id: 'nvidia/llama-3.1-nemotron-70b-instruct',
          name: 'Nvidia Llama 3.1 Nemotron 70B',
          free: true,
        },
        { id: 'google/gemini-2.0-flash', name: 'Google Gemini 2.0 Flash', free: true },
        { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Meta Llama 3.3 70B', free: true },
      ],
    },
    {
      id: 'groc' as AiProvider,
      name: 'Groc',
      description: 'Ultra-fast inference for Llama models',
      models: [{ id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', free: true }],
    },
    {
      id: 'gemini' as AiProvider,
      name: 'Google Gemini',
      description: 'Advanced multimodal models from Google',
      models: [{ id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', free: true }],
    },
  ];
}
