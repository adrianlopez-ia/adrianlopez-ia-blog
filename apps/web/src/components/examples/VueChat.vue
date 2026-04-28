<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { getToken } from '../../lib/api-client';

const messages = ref<{ id: string; role: 'user' | 'assistant'; content: string }[]>([]);
const input = ref('');
const isLoading = ref(false);
const activeProvider = ref<{ id: string; model: string } | null>(null);
const messagesEndRef = ref<HTMLDivElement | null>(null);

const PUBLIC_API_URL = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3000/api';

const scrollToBottom = async () => {
  await nextTick();
  messagesEndRef.value?.scrollIntoView({ behavior: 'smooth' });
};

// biome-ignore lint/correctness/noUnusedVariables: used in template
const handleSubmit = async () => {
  if (!input.value.trim() || isLoading.value) return;

  const userMessage = {
    id: crypto.randomUUID(),
    role: 'user' as const,
    content: input.value.trim(),
  };

  messages.value.push(userMessage);
  input.value = '';
  isLoading.value = true;
  await scrollToBottom();

  const assistantMsgId = crypto.randomUUID();
  messages.value.push({
    id: assistantMsgId,
    role: 'assistant' as const,
    content: '',
  });

  const handleStreamLine = (line: string, assistantMsgId: string, currentAccumulated: string) => {
    if (!line.startsWith('data: ')) return currentAccumulated;
    try {
      const data = JSON.parse(line.slice(6));
      if (data.type === 'start') {
        activeProvider.value = { id: data.provider, model: data.model };
      } else if (data.content) {
        const newAccumulated = currentAccumulated + data.content;
        const msg = messages.value.find((m) => m.id === assistantMsgId);
        if (msg) msg.content = newAccumulated;
        scrollToBottom();
        return newAccumulated;
      }
    } catch (_e) {}
    return currentAccumulated;
  };

  const processStream = async (
    reader: ReadableStreamDefaultReader<Uint8Array>,
    assistantMsgId: string,
  ) => {
    const decoder = new TextDecoder();
    let accumulated = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const line of decoder.decode(value).split('\n')) {
        accumulated = handleStreamLine(line, assistantMsgId, accumulated);
      }
    }
  };

  try {
    const response = await fetch(`${PUBLIC_API_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        messages: messages.value
          .filter((m) => m.content)
          .map(({ role, content }) => ({ role, content })),
        provider: 'openrouter',
      }),
    });

    if (!(response.ok && response.body)) throw new Error('Request failed');
    await processStream(response.body.getReader(), assistantMsgId);
  } catch (err) {
    console.error(err);
    const msg = messages.value.find((m) => m.id === assistantMsgId);
    if (msg) msg.content = 'Error connecting to the AI pool.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="relative flex h-full flex-col overflow-hidden bg-transparent">
    <div class="px-4 py-3" style="border-bottom: 1px solid var(--color-border-subtle)">
      <h3 class="text-sm font-semibold">Vue Agent (Composition API)</h3>
      <p class="text-xs" style="color: var(--color-text-muted)">
        {{ activeProvider ? `Active: ${activeProvider.id.toUpperCase()} (${activeProvider.model})` : 'Connected to multi-AI pool' }}
      </p>
    </div>

    <div class="flex-1 space-y-4 overflow-y-auto p-4">
      <div v-if="messages.length === 0" class="flex h-full items-center justify-center text-center">
        <div>
          <p class="text-2xl">🌱</p>
          <p class="mt-2 text-sm" style="color: var(--color-text-muted)">Start a reactive conversation with Vue 3</p>
        </div>
      </div>

      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']"
      >
        <div
          :class="[
            'max-w-[80%] rounded-2xl px-4 py-2 text-sm',
            msg.role === 'user' ? 'bg-brand-500 text-white' : ''
          ]"
          :style="msg.role === 'assistant' ? { backgroundColor: 'var(--color-overlay)', color: 'var(--color-text-secondary)' } : {}"
        >
          <div class="whitespace-pre-wrap">{{ msg.content }}</div>
        </div>
      </div>

      <div v-if="isLoading && !messages[messages.length - 1]?.content" class="flex justify-start">
        <div class="rounded-2xl px-4 py-2" style="background-color: var(--color-overlay)">
          <div class="flex gap-1">
            <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
            <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" style="animation-delay: 150ms" />
            <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" style="animation-delay: 300ms" />
          </div>
        </div>
      </div>

    <div ref="messagesEndRef" />
    </div>

    <!-- Auth Disclaimer Overlay -->
    <div v-if="!getToken()" class="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 text-center">
      <div class="max-w-xs rounded-2xl border border-brand-500/30 bg-gray-900/90 p-6 shadow-2xl">
        <div class="mb-4 text-3xl">🔒</div>
        <h4 class="mb-2 font-semibold text-white">Restricted Access</h4>
        <p class="mb-6 text-xs text-gray-400">
          This demo uses our private **AI Pool**. You need to sign in to interact with the models.
        </p>
        <a 
          :href="`/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '')}`"
          class="inline-block w-full rounded-xl bg-brand-500 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand-600 hover:scale-[1.02] active:scale-95"
        >
          Sign In
        </a>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="p-4" style="border-top: 1px solid var(--color-border-subtle)">
      <div class="flex gap-2">
        <input
          v-model="input"
          type="text"
          placeholder="Ask something..."
          class="flex-1 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/50"
          style="border: 1px solid var(--color-border); background-color: var(--color-overlay); color: var(--color-text)"
        />
        <button
          type="submit"
          :disabled="isLoading || !input.trim()"
          class="rounded-xl bg-brand-500 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
        >
          {{ isLoading ? '...' : 'Send' }}
        </button>
      </div>
    </form>
  </div>
</template>
