import type { AiProvider, ChatMessage } from '@blog/types';
import { streamText } from 'ai';
import type { AgentConfig } from './agents';
import { getModel } from './providers';

export interface ChatStreamOptions {
  messages: ChatMessage[];
  provider?: AiProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  agent?: AgentConfig;
}

export function createChatStream({
  messages,
  provider = 'openai',
  model,
  temperature = 0.7,
  maxTokens = 1024,
  agent,
}: ChatStreamOptions) {
  const aiModel = getModel(provider, model);

  const systemMessages: ChatMessage[] = agent
    ? [{ role: 'system', content: agent.systemPrompt }]
    : [];

  return streamText({
    model: aiModel,
    messages: [...systemMessages, ...messages].map((m) => ({
      role: m.role,
      content: m.content,
    })),
    temperature,
    maxTokens,
  });
}
