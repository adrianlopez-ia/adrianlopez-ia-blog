import { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `This is a demo response to: "${userMessage.content}". Connect your OpenAI API key in .env to get real AI responses!`,
    };

    await new Promise((r) => setTimeout(r, 800));
    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
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
          React AI Chatbot
        </h3>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Powered by Vercel AI SDK + OpenAI
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <p className="text-2xl">💬</p>
              <p className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Send a message to start chatting
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
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
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
            placeholder="Type a message..."
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
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
