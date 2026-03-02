import { z } from 'zod';

export const AiProviderSchema = z.enum(['openai', 'anthropic']);
export type AiProvider = z.infer<typeof AiProviderSchema>;

export const ChatMessageRoleSchema = z.enum(['system', 'user', 'assistant']);
export type ChatMessageRole = z.infer<typeof ChatMessageRoleSchema>;

export const ChatMessageSchema = z.object({
  role: ChatMessageRoleSchema,
  content: z.string(),
  timestamp: z.coerce.date().optional(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema),
  provider: AiProviderSchema.default('openai'),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().int().positive().max(4096).default(1024),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export interface StreamChunk {
  content: string;
  done: boolean;
}
