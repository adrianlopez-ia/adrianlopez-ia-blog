import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import type { AiProvider } from '@blog/types';

export interface ProviderConfig {
  openaiKey?: string;
  anthropicKey?: string;
}

function getDefaultConfig(): ProviderConfig {
  const config: ProviderConfig = {};
  if (process.env.OPENAI_API_KEY) {
    config.openaiKey = process.env.OPENAI_API_KEY;
  }
  if (process.env.ANTHROPIC_API_KEY) {
    config.anthropicKey = process.env.ANTHROPIC_API_KEY;
  }
  return config;
}

const defaultConfig: ProviderConfig = getDefaultConfig();

export function getProvider(provider: AiProvider, config: ProviderConfig = defaultConfig) {
  switch (provider) {
    case 'openai':
      return createOpenAI({ apiKey: config.openaiKey ?? '' });
    case 'anthropic':
      return createAnthropic({ apiKey: config.anthropicKey ?? '' });
  }
}

export function getModel(provider: AiProvider, modelId?: string, config?: ProviderConfig) {
  const p = getProvider(provider, config);

  const defaults: Record<AiProvider, string> = {
    openai: 'gpt-4o',
    anthropic: 'claude-4-sonnet-20260514',
  };

  return p(modelId ?? defaults[provider]);
}
