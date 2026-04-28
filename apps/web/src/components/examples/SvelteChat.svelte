<script lang="ts">
import { getToken } from '@lib/api-client';
import { tick } from 'svelte';

let messages = $state<{ id: string; role: 'user' | 'assistant'; content: string }[]>([]);
let input = $state('');
let isLoading = $state(false);
// biome-ignore lint/correctness/noUnusedVariables: Biome fails to see usage in Svelte 5 template
let activeProvider = $state<{ id: string; model: string } | null>(null);
let messagesEndRef: HTMLDivElement;

const PUBLIC_API_URL = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3000/api';

async function scrollToBottom() {
  await tick();
  messagesEndRef?.scrollIntoView({ behavior: 'smooth' });
}

// biome-ignore lint/correctness/noUnusedVariables: used in template
async function handleSubmit(e: Event) {
  e.preventDefault();
  if (!input.trim() || isLoading) return;

  const userMessage = {
    id: crypto.randomUUID(),
    role: 'user' as const,
    content: input.trim(),
  };

  messages = [...messages, userMessage];
  input = '';
  isLoading = true;
  scrollToBottom();

  const assistantMsgId = crypto.randomUUID();
  const assistantMsg = {
    id: assistantMsgId,
    role: 'assistant' as const,
    content: '',
  };
  messages = [...messages, assistantMsg];

  const processLine = (line: string, assistantMsgId: string, accumulated: string) => {
    if (!line.startsWith('data: ')) return { accumulated, updated: false };
    try {
      const data = JSON.parse(line.slice(6));
      if (data.type === 'start') {
        activeProvider = { id: data.provider, model: data.model };
        return { accumulated, updated: false };
      }
      if (data.content) {
        const nextAccumulated = accumulated + data.content;
        messages = messages.map((m) =>
          m.id === assistantMsgId ? { ...m, content: nextAccumulated } : m,
        );
        scrollToBottom();
        return { accumulated: nextAccumulated, updated: true };
      }
    } catch (_e) {}
    return { accumulated, updated: false };
  };

  const processStream = async (
    reader: ReadableStreamDefaultReader<Uint8Array>,
    assistantMsgId: string,
  ) => {
    const decoder = new TextDecoder();
    let currentAccumulated = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const line of decoder.decode(value).split('\n')) {
        const result = processLine(line, assistantMsgId, currentAccumulated);
        currentAccumulated = result.accumulated;
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
        messages: messages.filter((m) => m.content).map(({ role, content }) => ({ role, content })),
        provider: 'openrouter',
      }),
    });

    if (!(response.ok && response.body)) throw new Error('Request failed');
    await processStream(response.body.getReader(), assistantMsgId);
  } catch (err) {
    console.error(err);
    messages = messages.map((m) =>
      m.id === assistantMsgId ? { ...m, content: 'Error connecting to the Svelte pool.' } : m,
    );
  } finally {
    isLoading = false;
  }
}
</script>

<div class="relative flex h-full flex-col overflow-hidden bg-transparent">
  <div class="px-4 py-3" style="border-bottom: 1px solid var(--color-border-subtle)">
    <h3 class="text-sm font-semibold">Svelte 5 Widget (Runes)</h3>
    <p class="text-xs" style="color: var(--color-text-muted)">
      {activeProvider ? `Active: ${activeProvider.id.toUpperCase()} (${activeProvider.model})` : 'Dynamic AI Pool enabled'}
    </p>
  </div>

  <div class="flex-1 space-y-4 overflow-y-auto p-4">
    {#if messages.length === 0}
      <div class="flex h-full items-center justify-center text-center">
        <div>
          <p class="text-2xl">🔥</p>
          <p class="mt-2 text-sm" style="color: var(--color-text-muted)">Experience the speed of Svelte 5 + AI Pool</p>
        </div>
      </div>
    {/if}

    {#each messages as msg (msg.id)}
      <div class="flex {msg.role === 'user' ? 'justify-end' : 'justify-start'}">
        <div
          class="max-w-[80%] rounded-2xl px-4 py-2 text-sm {msg.role === 'user' ? 'bg-brand-500 text-white' : ''}"
          style={msg.role === 'assistant' ? 'background-color: var(--color-overlay); color: var(--color-text-secondary)' : ''}
        >
          <div class="whitespace-pre-wrap">{msg.content}</div>
        </div>
      </div>
    {/each}

    {#if isLoading && !messages[messages.length - 1]?.content}
      <div class="flex justify-start">
        <div class="rounded-2xl px-4 py-2" style="background-color: var(--color-overlay)">
          <div class="flex gap-1">
            <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-400"></span>
            <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-400" style="animation-delay: 150ms"></span>
            <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-400" style="animation-delay: 300ms"></span>
          </div>
        </div>
      </div>
    {/if}

    <div bind:this={messagesEndRef}></div>
  </div>

  {#if !getToken()}
    <div class="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 text-center">
      <div class="max-w-xs rounded-2xl border border-brand-500/30 bg-gray-900/90 p-6 shadow-2xl">
        <div class="mb-4 text-3xl">🔒</div>
        <h4 class="mb-2 font-semibold text-white">Restricted Access</h4>
        <p class="mb-6 text-xs text-gray-400">
          This demo uses our private **AI Pool**. You need to sign in to interact with the models.
        </p>
        <a 
          href={`/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '')}`} 
          class="inline-block w-full rounded-xl bg-brand-500 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand-600 hover:scale-[1.02] active:scale-95"
        >
          Sign In
        </a>
      </div>
    </div>
  {/if}

  <form onsubmit={handleSubmit} class="p-4" style="border-top: 1px solid var(--color-border-subtle)">
    <div class="flex gap-2">
      <input
        type="text"
        bind:value={input}
        placeholder="Type to Svelte..."
        class="flex-1 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/50"
        style="border: 1px solid var(--color-border); background-color: var(--color-overlay); color: var(--color-text)"
      />
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        class="rounded-xl bg-brand-500 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
      >
        {isLoading ? '...' : 'Send'}
      </button>
    </div>
  </form>
</div>
