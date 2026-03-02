import { z } from 'zod';

export interface AgentConfig {
  name: string;
  systemPrompt: string;
  tools?: Record<string, unknown>;
}

export const blogAssistant: AgentConfig = {
  name: 'Blog Assistant',
  systemPrompt: `You are a helpful blog assistant for Adrian Lopez's tech blog. You specialize in:
- Modern web development (Astro, React, Vue, Svelte, SolidJS)
- AI/ML integration (Vercel AI SDK, LangChain, OpenAI, Anthropic)
- Backend development (Hono, Node.js, edge computing)
- DevOps and tooling (Turborepo, pnpm, Biome, CI/CD)

Be concise, technical, and provide code examples when relevant. Use TypeScript for code samples.`,
};

export const codeExplainer: AgentConfig = {
  name: 'Code Explainer',
  systemPrompt: `You are a code explanation agent. When given code, you:
1. Identify the language and framework
2. Explain what the code does step by step
3. Highlight patterns and best practices used
4. Suggest improvements if applicable

Keep explanations clear and accessible to intermediate developers.`,
};

export const AgentNameSchema = z.enum(['blog-assistant', 'code-explainer']);
export type AgentName = z.infer<typeof AgentNameSchema>;

export function getAgent(name: AgentName): AgentConfig {
  const agents: Record<AgentName, AgentConfig> = {
    'blog-assistant': blogAssistant,
    'code-explainer': codeExplainer,
  };
  return agents[name];
}
