interface BotConfigFormProps {
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

export function BotConfigForm({
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
}: BotConfigFormProps) {
  return (
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
    </div>
  );
}
