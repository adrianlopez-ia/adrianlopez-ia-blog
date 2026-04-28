import { useCallback, useEffect, useState } from 'react';
import { useNotifications } from '../ui/NotificationContext';
import { Notifications } from '../ui/Notifications';
import { BotConfigForm } from './padel-bot/BotConfigForm';
import { LauncherConfig } from './padel-bot/LauncherConfig';
import { ScheduleForm } from './padel-bot/ScheduleForm';
import { StatisticsDashboard } from './padel-bot/StatisticsDashboard';
import type { HeaderField } from './padel-bot/types';

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

export function PadelBotApp() {
  const savedConfig = loadSavedConfig();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<'launch' | 'schedule' | 'stats'>('launch');
  const [token, setToken] = useState<string>('');

  const [targetHour, setTargetHour] = useState(DEFAULT_PAYLOAD.target_hour);
  const [daysAhead, setDaysAhead] = useState(DEFAULT_PAYLOAD.days_ahead);
  const [withLight, setWithLight] = useState(DEFAULT_PAYLOAD.with_light === 'true');
  const [twoHours, setTwoHours] = useState(DEFAULT_PAYLOAD.two_hours === 'true');
  const [maxWait, setMaxWait] = useState(DEFAULT_PAYLOAD.max_wait_minutes);

  const [apiUrl, setApiUrl] = useState(savedConfig.url);
  const [headers, setHeaders] = useState<HeaderField[]>(savedConfig.headers);

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [response, setResponse] = useState<string>('');

  // Get auth token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const saveConfig = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ url: apiUrl, headers }));
    addNotification('success', 'Configuration saved successfully');
  }, [apiUrl, headers, addNotification]);

  const addHeader = useCallback(() => {
    setHeaders((prev) => [...prev, { key: '', value: '' }]);
  }, []);

  const removeHeader = useCallback((index: number) => {
    setHeaders((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateHeader = useCallback((index: number, field: 'key' | 'value', val: string) => {
    setHeaders((prev) => prev.map((h, i) => (i === index ? { ...h, [field]: val } : h)));
  }, []);

  const buildRequestBody = useCallback(() => {
    return {
      event_type: 'run-bot',
      client_payload: {
        target_hour: targetHour,
        days_ahead: daysAhead,
        with_light: String(withLight),
        two_hours: String(twoHours),
        max_wait_minutes: maxWait,
      },
    };
  }, [targetHour, daysAhead, withLight, twoHours, maxWait]);

  const buildRequestHeaders = useCallback(() => {
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    for (const h of headers) {
      if (h.key.trim()) {
        reqHeaders[h.key.trim()] = h.value;
      }
    }
    return reqHeaders;
  }, [headers]);

  const handleSubmit = useCallback(async () => {
    if (!apiUrl.trim()) {
      setStatus('error');
      setResponse('Configure the URL first');
      return;
    }

    saveConfig();
    setStatus('loading');
    setResponse('');

    const body = buildRequestBody();
    const reqHeaders = buildRequestHeaders();

    try {
      const res = await fetch(apiUrl.trim(), {
        method: 'POST',
        headers: reqHeaders,
        body: JSON.stringify(body),
      });

      const text = await res.text();
      setStatus(res.ok ? 'success' : 'error');
      setResponse(`${res.status} ${res.statusText}\n\n${text || '(empty body)'}`);

      if (res.ok) {
        addNotification('success', 'Bot launched successfully');
      } else {
        addNotification('error', 'Failed to launch bot');
      }
    } catch (err) {
      setStatus('error');
      setResponse(err instanceof Error ? err.message : 'Network error');
      addNotification('error', 'Network error while launching bot');
    }
  }, [
    apiUrl,
    headers,
    targetHour,
    daysAhead,
    withLight,
    twoHours,
    maxWait,
    saveConfig,
    addNotification,
    buildRequestBody,
    buildRequestHeaders,
  ]);

  return (
    <div style={{ padding: '0 16px' }}>
      <Notifications />
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.5rem',
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
        Configure, schedule, and track padel reservations.
      </p>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          marginTop: 24,
          borderBottom: '1px solid var(--color-border-subtle)',
          paddingBottom: 0,
          overflowX: 'auto',
        }}
      >
        <TabButton
          active={activeTab === 'launch'}
          onClick={() => setActiveTab('launch')}
          label="🚀 Launch Now"
        />
        <TabButton
          active={activeTab === 'schedule'}
          onClick={() => setActiveTab('schedule')}
          label="📅 Schedule"
        />
        <TabButton
          active={activeTab === 'stats'}
          onClick={() => setActiveTab('stats')}
          label="📊 Statistics"
        />
      </div>

      {/* Tab Content */}
      <div style={{ marginTop: 24 }}>
        {activeTab === 'launch' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 24,
            }}
          >
            <BotConfigForm
              targetHour={targetHour}
              setTargetHour={setTargetHour}
              daysAhead={daysAhead}
              setDaysAhead={setDaysAhead}
              maxWait={maxWait}
              setMaxWait={setMaxWait}
              withLight={withLight}
              setWithLight={setWithLight}
              twoHours={twoHours}
              setTwoHours={setTwoHours}
            />
            <LauncherConfig
              apiUrl={apiUrl}
              setApiUrl={setApiUrl}
              headers={headers}
              addHeader={addHeader}
              removeHeader={removeHeader}
              updateHeader={updateHeader}
              saveConfig={saveConfig}
            />
          </div>
        )}

        {activeTab === 'schedule' && token && <ScheduleForm token={token} onSuccess={() => {}} />}

        {activeTab === 'schedule' && !token && (
          <div
            style={{
              padding: 24,
              borderRadius: 16,
              border: '1px solid var(--color-border-subtle)',
              background: 'var(--color-bg-primary)',
              textAlign: 'center',
            }}
          >
            Please log in to schedule reservations.
          </div>
        )}

        {activeTab === 'stats' && token && <StatisticsDashboard token={token} />}

        {activeTab === 'stats' && !token && (
          <div
            style={{
              padding: 24,
              borderRadius: 16,
              border: '1px solid var(--color-border-subtle)',
              background: 'var(--color-bg-primary)',
              textAlign: 'center',
            }}
          >
            Please log in to view statistics.
          </div>
        )}
      </div>

      {/* Launch Button (only show on launch tab) */}
      {activeTab === 'launch' && (
        <>
          <div
            style={{
              marginTop: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={handleSubmit}
              disabled={status === 'loading'}
              style={{
                padding: '12px 24px',
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
        </>
      )}
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

function TabButton({ active, onClick, label }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '10px 16px',
        borderRadius: '8px 8px 0 0',
        whiteSpace: 'nowrap',
        background: active ? 'var(--color-bg-primary)' : 'transparent',
        color: active ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
        fontWeight: active ? 600 : 500,
        fontSize: '0.8rem',
        border: active ? '1px solid var(--color-border-subtle)' : 'none',
        borderBottom: active
          ? '1px solid var(--color-bg-primary)'
          : '1px solid var(--color-border-subtle)',
        cursor: 'pointer',
        marginBottom: active ? '-1px' : 0,
      }}
    >
      {label}
    </button>
  );
}
