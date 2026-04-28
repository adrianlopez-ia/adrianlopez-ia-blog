import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';

/**
 * Example of using LangChain with OpenRouter
 */
export async function createLangChainOpenRouter(apiKey: string) {
  const model = new ChatOpenAI({
    apiKey: apiKey,
    openAIApiKey: apiKey,
    configuration: {
      apiKey: apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'http://localhost:4321',
        'X-Title': 'Adrián López IA Blog',
      },
    },
    modelName: 'nvidia/llama-3.1-nemotron-70b-instruct',
  });

  return model;
}

/**
 * Simple streaming example with LangChain + OpenRouter
 */
export async function* streamLangChainChat(apiKey: string, prompt: string) {
  const model = await createLangChainOpenRouter(apiKey);

  const stream = await model.stream([
    new SystemMessage('Eres un asistente util y conciso.'),
    new HumanMessage(prompt),
  ]);

  for await (const chunk of stream) {
    yield chunk.content;
  }
}
