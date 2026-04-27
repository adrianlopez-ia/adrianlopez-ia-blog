<script lang="ts">
import { tick } from 'svelte';
import { getToken } from '../../lib/api-client';

let messages = $state<{ id: string; role: 'user' | 'assistant'; content: string }[]>([]);
let input = $state('');
let isLoading = $state(false);
let activeProvider = $state<{ id: string; model: string } | null>(null);
let messagesEndRef: HTMLDivElement;

const PUBLIC_API_URL = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3000/api';

async function scrollToBottom() {
  await tick();
  messagesEndRef?.scrollIntoView({ behavior: 'smooth' });
}

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

  try {
    const response = await fetch(`${PUBLIC_API_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        messages: messages.filter((m) => m.content).map(({ role, content }) => ({ role, content })),
        provider: 'openrouter',
      }),
    });

    if (!response.ok) throw new Error('Chat request failed');
    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'start') {
              activeProvider = { id: data.provider, model: data.model };
              continue;
            }

            if (data.content) {
              accumulatedContent += data.content;
              messages = messages.map((m) =>
                m.id === assistantMsgId ? { ...m, content: accumulatedContent } : m,
              );
              scrollToBottom();
            }
          } catch (e) {
            // Ignore
          }
        }
      }
    }
  } catch (err) {
    console.error(err);
    messages = messages.map((m) =>
      m.id === assistantMsgId ? { ...m, content: 'Error en la conexión con la pool Svelte.' } : m,
    );
  } finally {
    isLoading = false;
  }
}
</script>

<div class="flex h-full flex-col overflow-hidden bg-transparent">
  <div class="px-4 py-3" style="border-bottom: 1px solid var(--color-border-subtle)">
    <h3 class="text-sm font-semibold">Svelte 5 Widget (Runes)</h3>
    <p class="text-xs" style="color: var(--color-text-muted)">
      {activeProvider ? `Activo: ${activeProvider.id.toUpperCase()} (${activeProvider.model})` : 'IA Pool dinámica habilitada'}
    </p>
  </div>

  <div class="flex-1 space-y-4 overflow-y-auto p-4">
    {#if messages.length === 0}
      <div class="flex h-full items-center justify-center text-center">
        <div>
          <p class="text-2xl">🔥</p>
          <p class="mt-2 text-sm" style="color: var(--color-text-muted)">Experimenta la velocidad de Svelte 5 + AI Pool</p>
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

  <form onsubmit={handleSubmit} class="p-4" style="border-top: 1px solid var(--color-border-subtle)">
    <div class="flex gap-2">
      <input
        type="text"
        bind:value={input}
        placeholder="Escribe a Svelte..."
        class="flex-1 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/50"
        style="border: 1px solid var(--color-border); background-color: var(--color-overlay); color: var(--color-text)"
      />
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        class="rounded-xl bg-brand-500 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
      >
        {isLoading ? '...' : 'Enviar'}
      </button>
    </div>
  </form>
</div>
