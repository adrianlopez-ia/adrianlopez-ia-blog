---
name: create-ai-agent
description: Step-by-step guide to define a new AI agent in packages/ai/src/agents/ with system prompt, register it, and create an API endpoint. Use when adding new AI agents, chat personalities, or AI-powered features.
---

# Create AI Agent

Step-by-step guide to add a new AI agent to `packages/ai/`.

## 1. Define Agent Config

In `packages/ai/src/agents/index.ts`, add a new `AgentConfig`:

```typescript
export const myNewAgent: AgentConfig = {
  name: 'My New Agent',
  systemPrompt: `You are a helpful agent that specializes in...
Be concise, technical, and provide examples when relevant. Use TypeScript for code samples.`,
  tools: {},  // optional: tools for the agent
};
```

`AgentConfig` interface:

```typescript
interface AgentConfig {
  name: string;
  systemPrompt: string;
  tools?: Record<string, unknown>;
}
```

## 2. Register Agent

In the same file:

1. Add to `AgentNameSchema`:

```typescript
export const AgentNameSchema = z.enum(['blog-assistant', 'code-explainer', 'my-new-agent']);
```

2. Add to `getAgent` mapping:

```typescript
const agents: Record<AgentName, AgentConfig> = {
  'blog-assistant': blogAssistant,
  'code-explainer': codeExplainer,
  'my-new-agent': myNewAgent,
};
```

## 3. Agent Name Convention

- Schema value: kebab-case (e.g. `my-new-agent`)
- Display name: Title Case (e.g. "My New Agent")

## 4. API Endpoint (if needed)

The AI chat endpoint is at `apps/api/src/routes/ai.ts`:

- `POST /api/ai/chat` – streaming chat (uses `ChatRequestSchema`)
- `GET /api/ai/providers` – list providers

To add agent selection, extend `ChatRequestSchema` in `packages/types/src/ai.ts`:

```typescript
export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema),
  provider: AiProviderSchema.default('openai'),
  agent: AgentNameSchema.optional(),  // add if needed
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().int().positive().max(4096).default(1024),
});
```

Then in the route, use `getAgent(agentName)` to fetch the system prompt for the selected agent.

## 5. Checklist

- [ ] `AgentConfig` added in `packages/ai/src/agents/index.ts`
- [ ] Added to `AgentNameSchema` enum
- [ ] Added to `getAgent` mapping
- [ ] System prompt is clear and specific
- [ ] API updated if agent selection is required

## Reference

- Agents: `packages/ai/src/agents/index.ts`
- AI routes: `apps/api/src/routes/ai.ts`
- Types: `packages/types/src/ai.ts`
