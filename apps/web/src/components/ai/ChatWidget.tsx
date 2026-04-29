import { getToken } from '@lib/api-client';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/Button';

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

    const handleStreamLine = (line: string, assistantMsgId: string, currentAccumulated: string) => {
      if (!line.startsWith('data: ')) return currentAccumulated;
      try {
        const data = JSON.parse(line.slice(6));
        if (data.type === 'start') {
          setActiveProvider({ id: data.provider, model: data.model });
        } else if (data.content) {
          const newAccumulated = currentAccumulated + data.content;
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMsgId ? { ...m, content: newAccumulated } : m)),
          );
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
        const lines = decoder.decode(value).split('\n');
        for (const line of lines) {
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
          messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
          provider: 'openrouter',
          model: 'nvidia/llama-3.1-nemotron-70b-instruct',
          useLangChain,
        }),
      });

      if (!(response.ok && response.body)) throw new Error('Chat request failed');
      await processStream(response.body.getReader(), assistantMsgId);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: `Error connecting to the AI: ${errorMessage}` }
            : m,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative flex h-[500px] flex-col rounded-2xl"
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
            ? `Active: ${activeProvider.id.toUpperCase()} (${activeProvider.model})`
            : 'Connecting to AI pool...'}
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <p className="text-2xl">⚡</p>
              <p className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Ask something to Nvidia's AI
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

      {!getToken() && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 p-6 text-center backdrop-blur-sm">
          <div className="max-w-xs rounded-2xl border border-brand-500/30 bg-gray-900/90 p-6 shadow-2xl">
            <div className="mb-4 text-3xl">🔒</div>
            <h4 className="mb-2 font-semibold text-white">Restricted Access</h4>
            <p className="mb-6 text-gray-400 text-xs">
              This demo uses our private **AI Pool**. You need to sign in to interact with the
              models.
            </p>
            <a
              href={`/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '')}`}
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
            >
              Sign In
            </a>
          </div>
        </div>
      )}

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
            placeholder="Type a message..."
            className="input-field flex-1 rounded-xl text-sm"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} variant="primary" size="md">
            {isLoading ? '...' : 'Send'}
          </Button>
        </div>
      </form>
    </div>
  );
}
