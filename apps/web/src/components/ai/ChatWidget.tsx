import { getToken } from '@lib/api-client';
import { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const PUBLIC_API_URL = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3000/api';

interface ChatWidgetProps {
  useLangChain?: boolean;
}

export default function ChatWidget({ useLangChain = false }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState<{ id: string; model: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const assistantMsgId = crypto.randomUUID();
    const assistantMessage: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch(`${PUBLIC_API_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
          provider: 'openrouter',
          model: 'nvidia/llama-3.1-nemotron-70b-instruct',
          useLangChain,
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
                setActiveProvider({ id: data.provider, model: data.model });
                continue;
              }

              if (data.content) {
                accumulatedContent += data.content;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId ? { ...m, content: accumulatedContent } : m,
                  ),
                );
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: `Error al conectar con la IA: ${errorMessage}` }
            : m,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex h-[500px] flex-col rounded-2xl"
      style={{
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-card-bg)',
      }}
    >
      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
        <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
          AI Pool (OpenRouter &bull; Groc &bull; Gemini)
        </h3>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {activeProvider
            ? `Activo: ${activeProvider.id.toUpperCase()} (${activeProvider.model})`
            : 'Conectando con la pool de IA...'}
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <p className="text-2xl">⚡</p>
              <p className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Preguntale algo a la IA de Nvidia
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                msg.role === 'user' ? 'bg-brand-500 text-white' : ''
              }`}
              style={
                msg.role === 'assistant'
                  ? {
                      backgroundColor: 'var(--color-overlay)',
                      color: 'var(--color-text-secondary)',
                    }
                  : undefined
              }
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}

        {isLoading && !messages[messages.length - 1]?.content && (
          <div className="flex justify-start">
            <div
              className="rounded-2xl px-4 py-2"
              style={{ backgroundColor: 'var(--color-overlay)' }}
            >
              <div className="flex gap-1">
                <span
                  className="h-2 w-2 animate-bounce rounded-full"
                  style={{ backgroundColor: 'var(--color-text-muted)', animationDelay: '0ms' }}
                />
                <span
                  className="h-2 w-2 animate-bounce rounded-full"
                  style={{ backgroundColor: 'var(--color-text-muted)', animationDelay: '150ms' }}
                />
                <span
                  className="h-2 w-2 animate-bounce rounded-full"
                  style={{ backgroundColor: 'var(--color-text-muted)', animationDelay: '300ms' }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-4"
        style={{ borderTop: '1px solid var(--color-border-subtle)' }}
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/50"
            style={{
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-overlay)',
              color: 'var(--color-text)',
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-xl bg-brand-500 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
          >
            {isLoading ? '...' : 'Enviar'}
          </button>
        </div>
      </form>
    </div>
  );
}
