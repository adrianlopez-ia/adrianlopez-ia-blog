import { z } from 'zod';

export const AiProviderSchema = z.enum(['openrouter', 'groc', 'gemini']);
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
  provider: AiProviderSchema.default('openrouter'),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().int().positive().max(4096).default(1024),
  agentName: z.string().optional(),
  useLangChain: z.boolean().optional().default(false),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export interface StreamChunk {
  content: string;
  done: boolean;
}

/** Default free models per provider */
export const DEFAULT_MODELS: Record<string, string> = {
  openrouter: 'nvidia/llama-3.1-nemotron-70b-instruct',
  groc: 'llama-3.3-70b-versatile',
  gemini: 'gemini-2.0-flash',
};
