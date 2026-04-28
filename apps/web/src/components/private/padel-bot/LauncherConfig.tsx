import type { HeaderField } from './types';

interface LauncherConfigProps {
  apiUrl: string;
  setApiUrl: (val: string) => void;
  headers: HeaderField[];
  addHeader: () => void;
  removeHeader: (index: number) => void;
  updateHeader: (index: number, field: 'key' | 'value', val: string) => void;
  saveConfig: () => void;
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

export function LauncherConfig({
  apiUrl,
  setApiUrl,
  headers,
  addHeader,
  removeHeader,
  updateHeader,
  saveConfig,
}: LauncherConfigProps) {
  return (
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
                padding: '8px 12px',
                borderRadius: 6,
                fontSize: '0.75rem',
                fontWeight: 500,
                background: 'rgba(124, 58, 237, 0.1)',
                color: '#7c3aed',
                border: 'none',
                cursor: 'pointer',
                minHeight: 36,
              }}
            >
              + Add
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {headers.map((h, i) => (
              <div
                key={`header-${h.key}-${i}`}
                style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}
              >
                <input
                  type="text"
                  placeholder="Key"
                  value={h.key}
                  onChange={(e) => updateHeader(i, 'key', e.target.value)}
                  style={{ ...inputStyle, flex: 1, minWidth: 120 }}
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={h.value}
                  onChange={(e) => updateHeader(i, 'value', e.target.value)}
                  style={{ ...inputStyle, flex: 2, minWidth: 120 }}
                />
                <button
                  type="button"
                  onClick={() => removeHeader(i)}
                  style={{
                    padding: '10px',
                    borderRadius: 6,
                    background: 'none',
                    border: 'none',
                    color: '#f87171',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    flexShrink: 0,
                    minWidth: 40,
                    minHeight: 40,
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
          onClick={saveConfig}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            fontSize: '0.8rem',
            fontWeight: 500,
            background: 'var(--color-overlay)',
            color: 'var(--color-text-secondary)',
            border: 'none',
            cursor: 'pointer',
            alignSelf: 'flex-start',
            minHeight: 40,
          }}
        >
          Save config
        </button>
      </div>
    </div>
  );
}
