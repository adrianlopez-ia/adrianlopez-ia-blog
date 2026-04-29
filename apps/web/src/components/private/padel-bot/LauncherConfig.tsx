import { Button } from '../../ui/Button';
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
  padding: '12px 16px',
  borderRadius: 8,
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg-tertiary)',
  color: 'var(--color-text-primary)',
  fontSize: '1rem',
  outline: 'none',
  width: '100%',
  minHeight: 44,
  transition: 'border-color 0.2s, background-color 0.2s',
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
            <Button type="button" onClick={addHeader} variant="accent" size="sm">
              + Add
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {headers.map((h, i) => (
              <div
                key={`header-${h.key}-${i}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 8,
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Key"
                    value={h.key}
                    onChange={(e) => updateHeader(i, 'key', e.target.value)}
                    style={{ ...inputStyle, minWidth: 0 }}
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={h.value}
                    onChange={(e) => updateHeader(i, 'value', e.target.value)}
                    style={{ ...inputStyle, minWidth: 0 }}
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => removeHeader(i)}
                  variant="ghost"
                  size="sm"
                  style={{
                    color: 'var(--color-error, #f87171)',
                    minWidth: 44,
                    minHeight: 44,
                  }}
                  aria-label="Remove header"
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>
        </div>

        <Button
          type="button"
          onClick={saveConfig}
          variant="secondary"
          size="md"
          style={{ alignSelf: 'flex-start' }}
        >
          Save config
        </Button>
      </div>
    </div>
  );
}
