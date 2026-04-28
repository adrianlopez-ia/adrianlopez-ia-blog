import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node22',
  clean: true,
  noExternal: [
    '@blog/ai',
    '@blog/database',
    '@blog/types',
    '@blog/utils',
    'ai',
    'langchain',
    '@langchain/openai',
    '@ai-sdk/openai',
    '@ai-sdk/google',
    '@ai-sdk/groq',
  ],
});
