import { useCallback, useState } from 'react';

interface HeaderField {
  key: string;
  value: string;
}

const DEFAULT_PAYLOAD = {
  target_hour: '19:00',
  days_ahead: '5',
  with_light: 'true',
  two_hours: 'true',
  max_wait_minutes: '12',
};

const STORAGE_KEY = 'padel-bot-config';

function loadSavedConfig(): { url: string; headers: HeaderField[] } {
  if (typeof window === 'undefined') return { url: '', headers: [{ key: '', value: '' }] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { url: '', headers: [{ key: '', value: '' }] };
}

const inputStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 8,
  border: '1px solid var(--color-border-subtle)',
  background: 'var(--color-bg-secondary, #0f0a1a)',
  color: 'var(--color-text-primary)',
  fontSize: '0.875rem',
  outline: 'none',
  width: '100%',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 500,
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

export function PadelBotApp() {
  const savedConfig = loadSavedConfig();

  const [targetHour, setTargetHour] = useState(DEFAULT_PAYLOAD.target_hour);
  const [daysAhead, setDaysAhead] = useState(DEFAULT_PAYLOAD.days_ahead);
  const [withLight, setWithLight] = useState(DEFAULT_PAYLOAD.with_light === 'true');
  const [twoHours, setTwoHours] = useState(DEFAULT_PAYLOAD.two_hours === 'true');
  const [maxWait, setMaxWait] = useState(DEFAULT_PAYLOAD.max_wait_minutes);

  const [apiUrl, setApiUrl] = useState(savedConfig.url);
  const [headers, setHeaders] = useState<HeaderField[]>(savedConfig.headers);

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [response, setResponse] = useState<string>('');

  const saveConfig = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ url: apiUrl, headers }));
  }, [apiUrl, headers]);

  const addHeader = useCallback(() => {
    setHeaders((prev) => [...prev, { key: '', value: '' }]);
  }, []);

  const removeHeader = useCallback((index: number) => {
    setHeaders((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateHeader = useCallback((index: number, field: 'key' | 'value', val: string) => {
    setHeaders((prev) => prev.map((h, i) => (i === index ? { ...h, [field]: val } : h)));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!apiUrl.trim()) {
      setStatus('error');
      setResponse('Configure the URL first');
      return;
    }

    saveConfig();
    setStatus('loading');
    setResponse('');

    const body = {
      event_type: 'run-bot',
      client_payload: {
        target_hour: targetHour,
        days_ahead: daysAhead,
        with_light: String(withLight),
        two_hours: String(twoHours),
        max_wait_minutes: maxWait,
      },
    };

    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    for (const h of headers) {
      if (h.key.trim()) {
        reqHeaders[h.key.trim()] = h.value;
      }
    }

    try {
      const res = await fetch(apiUrl.trim(), {
        method: 'POST',
        headers: reqHeaders,
        body: JSON.stringify(body),
      });

      const text = await res.text();
      setStatus(res.ok ? 'success' : 'error');
      setResponse(`${res.status} ${res.statusText}\n\n${text || '(empty body)'}`);
    } catch (err) {
      setStatus('error');
      setResponse(err instanceof Error ? err.message : 'Network error');
    }
  }, [apiUrl, headers, targetHour, daysAhead, withLight, twoHours, maxWait, saveConfig]);

  return (
    <div>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.875rem',
          fontWeight: 700,
          letterSpacing: '-0.025em',
        }}
      >
        🎾 Padel{' '}
        <span
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Bot
        </span>
      </h1>
      <p style={{ marginTop: 8, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
        Configure and launch the padel reservation bot.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 32 }}>
        {/* Bot Config Form */}
        <div
          style={{
            padding: 24,
            borderRadius: 16,
            border: '1px solid var(--color-border-subtle)',
            background: 'var(--color-bg-primary)',
          }}
        >
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 20 }}>Bot Configuration</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label htmlFor="target-hour" style={labelStyle}>
                Target hour
              </label>
              <input
                id="target-hour"
                type="time"
                value={targetHour}
                onChange={(e) => setTargetHour(e.target.value)}
                style={{ ...inputStyle, marginTop: 4 }}
              />
            </div>

            <div>
              <label htmlFor="days-ahead" style={labelStyle}>
                Days in advance
              </label>
              <input
                id="days-ahead"
                type="number"
                min="1"
                max="14"
                value={daysAhead}
                onChange={(e) => setDaysAhead(e.target.value)}
                style={{ ...inputStyle, marginTop: 4 }}
              />
            </div>

            <div>
              <label htmlFor="max-wait" style={labelStyle}>
                Max wait time (min)
              </label>
              <input
                id="max-wait"
                type="number"
                min="1"
                max="60"
                value={maxWait}
                onChange={(e) => setMaxWait(e.target.value)}
                style={{ ...inputStyle, marginTop: 4 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 24, marginTop: 4 }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.875rem',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={withLight}
                  onChange={(e) => setWithLight(e.target.checked)}
                  style={{ accentColor: '#7c3aed', width: 16, height: 16 }}
                />
                With light
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.875rem',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={twoHours}
                  onChange={(e) => setTwoHours(e.target.checked)}
                  style={{ accentColor: '#7c3aed', width: 16, height: 16 }}
                />
                2 hours
              </label>
            </div>
          </div>

          {/* Preview */}
          <div
            style={{
              marginTop: 20,
              padding: 12,
              borderRadius: 8,
              background: 'rgba(124, 58, 237, 0.05)',
              border: '1px solid rgba(124, 58, 237, 0.1)',
            }}
          >
            <p
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              Payload preview
            </p>
            <pre
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-secondary)',
                whiteSpace: 'pre-wrap',
                fontFamily: 'JetBrains Mono, monospace',
                margin: 0,
              }}
            >
              {JSON.stringify(
                {
                  event_type: 'run-bot',
                  client_payload: {
                    target_hour: targetHour,
                    days_ahead: daysAhead,
                    with_light: String(withLight),
                    two_hours: String(twoHours),
                    max_wait_minutes: maxWait,
                  },
                },
                null,
                2,
              )}
            </pre>
          </div>
        </div>

        {/* API Caller Config */}
        <div
          style={{
            padding: 24,
            borderRadius: 16,
            border: '1px solid var(--color-border-subtle)',
            background: 'var(--color-bg-primary)',
          }}
        >
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 20 }}>
            Launcher Configuration
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label htmlFor="api-url" style={labelStyle}>
                Endpoint URL
              </label>
              <input
                id="api-url"
                type="url"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.github.com/repos/..."
                style={{ ...inputStyle, marginTop: 4 }}
              />
            </div>

            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <span style={labelStyle}>Headers</span>
                <button
                  type="button"
                  onClick={addHeader}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    background: 'rgba(124, 58, 237, 0.1)',
                    color: '#7c3aed',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  + Add
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {headers.map((h, i) => (
                  <div
                    key={`header-${h.key}-${i}`}
                    style={{ display: 'flex', gap: 8, alignItems: 'center' }}
                  >
                    <input
                      type="text"
                      placeholder="Key"
                      value={h.key}
                      onChange={(e) => updateHeader(i, 'key', e.target.value)}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={h.value}
                      onChange={(e) => updateHeader(i, 'value', e.target.value)}
                      style={{ ...inputStyle, flex: 2 }}
                    />
                    <button
                      type="button"
                      onClick={() => removeHeader(i)}
                      style={{
                        padding: '8px',
                        borderRadius: 6,
                        background: 'none',
                        border: 'none',
                        color: '#f87171',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        flexShrink: 0,
                      }}
                      aria-label="Remove header"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => saveConfig()}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: '0.8rem',
                fontWeight: 500,
                background: 'var(--color-overlay)',
                color: 'var(--color-text-secondary)',
                border: 'none',
                cursor: 'pointer',
                alignSelf: 'flex-start',
              }}
            >
              Save config
            </button>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={status === 'loading'}
          style={{
            padding: '12px 32px',
            borderRadius: 10,
            background:
              status === 'loading' ? '#4c1d95' : 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.95rem',
            border: 'none',
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            opacity: status === 'loading' ? 0.7 : 1,
          }}
        >
          {status === 'loading' ? 'Launching...' : '🚀 Launch Bot'}
        </button>

        {status === 'success' && (
          <span style={{ fontSize: '0.875rem', color: '#4ade80', fontWeight: 500 }}>
            Sent successfully
          </span>
        )}
        {status === 'error' && !response.includes('\n') && (
          <span style={{ fontSize: '0.875rem', color: '#f87171', fontWeight: 500 }}>
            {response}
          </span>
        )}
      </div>

      {/* Response */}
      {response?.includes('\n') && (
        <div
          style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 12,
            border: `1px solid ${status === 'success' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`,
            background:
              status === 'success' ? 'rgba(74, 222, 128, 0.05)' : 'rgba(248, 113, 113, 0.05)',
          }}
        >
          <p
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Response
          </p>
          <pre
            style={{
              fontSize: '0.8rem',
              color: 'var(--color-text-secondary)',
              whiteSpace: 'pre-wrap',
              fontFamily: 'JetBrains Mono, monospace',
              margin: 0,
            }}
          >
            {response}
          </pre>
        </div>
      )}
    </div>
  );
}
