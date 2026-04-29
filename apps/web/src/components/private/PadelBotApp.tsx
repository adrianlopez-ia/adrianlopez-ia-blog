import { useCallback, useEffect, useState } from 'react';
import { useNotifications } from '../ui/NotificationContext';
import { Notifications } from '../ui/Notifications';
import { Select, type SelectOption } from '../ui/Select';
import { BotConfigForm } from './padel-bot/BotConfigForm';
import { LauncherConfig } from './padel-bot/LauncherConfig';
import { ReservationsList } from './padel-bot/ReservationsList';
import { ScheduleForm } from './padel-bot/ScheduleForm';
import { StatisticsDashboard } from './padel-bot/StatisticsDashboard';
import { type PadelBotConfig, getPadelBotConfig, savePadelBotConfig } from './padel-bot/api';
import type { HeaderField } from './padel-bot/types';

const DEFAULT_PAYLOAD = {
  target_hour: '19:00',
  days_ahead: '5',
  with_light: 'true',
  two_hours: 'true',
  max_wait_minutes: '12',
};

export function PadelBotApp() {
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<'launch' | 'schedule' | 'stats' | 'reservations'>(
    'launch',
  );
  const [token, setToken] = useState<string>('');

  const [targetHour, setTargetHour] = useState(DEFAULT_PAYLOAD.target_hour);
  const [daysAhead, setDaysAhead] = useState(DEFAULT_PAYLOAD.days_ahead);
  const [withLight, setWithLight] = useState(DEFAULT_PAYLOAD.with_light === 'true');
  const [twoHours, setTwoHours] = useState(DEFAULT_PAYLOAD.two_hours === 'true');
  const [maxWait, setMaxWait] = useState(DEFAULT_PAYLOAD.max_wait_minutes);

  const [apiUrl, setApiUrl] = useState('');
  const [headers, setHeaders] = useState<HeaderField[]>([{ key: '', value: '' }]);

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [response, setResponse] = useState<string>('');

  // Get auth token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Load config from database when token is available
  useEffect(() => {
    if (!token) return;

    const loadConfig = async () => {
      try {
        const config = await getPadelBotConfig(token);
        setTargetHour(config.targetHour);
        setDaysAhead(String(config.daysAhead));
        setWithLight(config.withLight);
        setTwoHours(config.twoHours);
        setMaxWait(String(config.maxWaitMinutes));
        setApiUrl(config.apiUrl);
        setHeaders(config.headers.map((h) => ({ key: h.key, value: h.value })));
      } catch (err) {
        console.error('Failed to load config:', err);
        // Keep default values on error
      }
    };

    loadConfig();
  }, [token]);

  const saveConfig = useCallback(async () => {
    if (!token) {
      addNotification('error', 'Please log in to save configuration');
      return;
    }

    try {
      const config: PadelBotConfig = {
        targetHour,
        daysAhead: Number.parseInt(daysAhead, 10),
        withLight,
        twoHours,
        maxWaitMinutes: Number.parseInt(maxWait, 10),
        apiUrl,
        headers: headers.map((h) => ({ key: h.key, value: h.value })),
      };
      await savePadelBotConfig(config, token);
      addNotification('success', 'Configuration saved successfully');
    } catch (err) {
      addNotification('error', err instanceof Error ? err.message : 'Failed to save configuration');
    }
  }, [
    targetHour,
    daysAhead,
    withLight,
    twoHours,
    maxWait,
    apiUrl,
    headers,
    token,
    addNotification,
  ]);

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

    await executeLaunch(apiUrl.trim(), reqHeaders, body, setStatus, setResponse, addNotification);
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
      <Header />
      <PadelBotTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <TabContent
        activeTab={activeTab}
        token={token}
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
        apiUrl={apiUrl}
        setApiUrl={setApiUrl}
        headers={headers}
        addHeader={addHeader}
        removeHeader={removeHeader}
        updateHeader={updateHeader}
        saveConfig={saveConfig}
      />
      <LaunchSection
        activeTab={activeTab}
        status={status}
        response={response}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}

function Header() {
  return (
    <>
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
    </>
  );
}

interface TabsProps {
  activeTab: 'launch' | 'schedule' | 'stats' | 'reservations';
  setActiveTab: (val: 'launch' | 'schedule' | 'stats' | 'reservations') => void;
}

function PadelBotTabs({ activeTab, setActiveTab }: TabsProps) {
  const options: SelectOption[] = [
    { value: 'launch', label: '🚀 Launch Now' },
    { value: 'schedule', label: '📅 Schedule' },
    { value: 'stats', label: '📊 Statistics' },
    { value: 'reservations', label: '📋 Reservations' },
  ];

  return (
    <div style={{ marginTop: 24 }}>
      <Select
        value={activeTab}
        onChange={(v) => setActiveTab(v as 'launch' | 'schedule' | 'stats' | 'reservations')}
        options={options}
      />
    </div>
  );
}

interface TabContentProps {
  activeTab: 'launch' | 'schedule' | 'stats' | 'reservations';
  token: string;
  targetHour: string;
  setTargetHour: (val: string) => void;
  daysAhead: string;
  setDaysAhead: (val: string) => void;
  maxWait: string;
  setMaxWait: (val: string) => void;
  withLight: boolean;
  setWithLight: (val: boolean) => void;
  twoHours: boolean;
  setTwoHours: (val: boolean) => void;
  apiUrl: string;
  setApiUrl: (val: string) => void;
  headers: HeaderField[];
  addHeader: () => void;
  removeHeader: (index: number) => void;
  updateHeader: (index: number, field: 'key' | 'value', val: string) => void;
  saveConfig: () => void;
}

function TabContent({
  activeTab,
  token,
  targetHour,
  setTargetHour,
  daysAhead,
  setDaysAhead,
  maxWait,
  setMaxWait,
  withLight,
  setWithLight,
  twoHours,
  setTwoHours,
  apiUrl,
  setApiUrl,
  headers,
  addHeader,
  removeHeader,
  updateHeader,
  saveConfig,
}: TabContentProps) {
  return (
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

      {activeTab === 'schedule' && (
        <AuthRequired token={token} message="Please log in to schedule reservations.">
          <ScheduleForm token={token} onSuccess={() => {}} />
        </AuthRequired>
      )}

      {activeTab === 'stats' && (
        <AuthRequired token={token} message="Please log in to view statistics.">
          <StatisticsDashboard token={token} />
        </AuthRequired>
      )}

      {activeTab === 'reservations' && (
        <AuthRequired token={token} message="Please log in to view reservations.">
          <ReservationsList token={token} />
        </AuthRequired>
      )}
    </div>
  );
}

interface AuthRequiredProps {
  token: string;
  message: string;
  children: React.ReactNode;
}

function AuthRequired({ token, message, children }: AuthRequiredProps) {
  if (!token) {
    return (
      <div
        style={{
          padding: 24,
          borderRadius: 16,
          border: '1px solid var(--color-border-subtle)',
          background: 'var(--color-bg-primary)',
          textAlign: 'center',
        }}
      >
        {message}
      </div>
    );
  }
  return <>{children}</>;
}

interface LaunchSectionProps {
  activeTab: 'launch' | 'schedule' | 'stats' | 'reservations';
  status: 'idle' | 'loading' | 'success' | 'error';
  response: string;
  handleSubmit: () => void;
}

function LaunchSection({ activeTab, status, response, handleSubmit }: LaunchSectionProps) {
  if (activeTab !== 'launch') return null;

  return (
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
          className="btn btn-launch"
          aria-label="Launch Padel Bot"
          style={{
            padding: '12px 24px',
            borderRadius: 10,
            background:
              status === 'loading'
                ? 'var(--color-accent-primary-dark, #4c1d95)'
                : 'linear-gradient(135deg, var(--color-accent-primary, #7c3aed), var(--color-info, #06b6d4))',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.95rem',
            border: 'none',
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            opacity: status === 'loading' ? 0.7 : 1,
            transition: 'opacity 0.2s, transform 0.2s',
          }}
        >
          {status === 'loading' ? 'Launching...' : '🚀 Launch Bot'}
        </button>

        {status === 'success' && (
          <span
            style={{
              fontSize: '0.875rem',
              color: 'var(--color-success, #4ade80)',
              fontWeight: 500,
            }}
          >
            Sent successfully
          </span>
        )}
        {status === 'error' && !response.includes('\n') && (
          <span
            style={{ fontSize: '0.875rem', color: 'var(--color-error, #f87171)', fontWeight: 500 }}
          >
            {response}
          </span>
        )}
      </div>

      {response?.includes('\n') && (
        <div
          style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 12,
            border: `1px solid ${status === 'success' ? 'var(--color-success-alpha, rgba(74, 222, 128, 0.2))' : 'var(--color-error-alpha, rgba(248, 113, 113, 0.2))'}`,
            background:
              status === 'success'
                ? 'var(--color-success-bg, rgba(74, 222, 128, 0.05))'
                : 'var(--color-error-bg, rgba(248, 113, 113, 0.05))',
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
  );
}

async function executeLaunch(
  url: string,
  headers: Record<string, string>,
  body: unknown,
  setStatus: (status: 'idle' | 'loading' | 'success' | 'error') => void,
  setResponse: (response: string) => void,
  addNotification: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void,
) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
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
}
