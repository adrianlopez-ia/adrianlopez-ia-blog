import { type AuthUser, authApi, getToken } from '@lib/api-client';
import { useCallback, useEffect, useRef, useState } from 'react';

export function UserMenu() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    authApi.me().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = useCallback(() => {
    authApi.logout();
    setUser(null);
    setOpen(false);
    window.location.href = '/';
  }, []);

  if (loading) {
    return (
      <div
        style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-overlay)' }}
        className="animate-pulse"
      />
    );
  }

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-lg p-2 transition-colors"
        style={{ color: 'var(--color-text-muted)' }}
        aria-label="User menu"
        type="button"
      >
        {user ? (
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'var(--color-brand-500, #7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        ) : (
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            marginTop: 8,
            minWidth: 200,
            borderRadius: 12,
            border: '1px solid var(--color-border-subtle)',
            background: 'var(--color-bg-primary)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          {user ? (
            <>
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--color-border-subtle)',
                }}
              >
                <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {user.email}
                </p>
              </div>
              <div style={{ padding: 4 }}>
                <a
                  href="/private"
                  style={{
                    display: 'block',
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontSize: '0.875rem',
                    color: 'var(--color-text-secondary)',
                    textDecoration: 'none',
                  }}
                  className="transition-colors hover:text-brand-500"
                >
                  Area Privada
                </a>
                <button
                  onClick={handleLogout}
                  type="button"
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontSize: '0.875rem',
                    color: '#f87171',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Cerrar sesion
                </button>
              </div>
            </>
          ) : (
            <div style={{ padding: 4 }}>
              <a
                href="/login"
                style={{
                  display: 'block',
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: '0.875rem',
                  color: 'var(--color-text-secondary)',
                  textDecoration: 'none',
                }}
                className="transition-colors hover:text-brand-500"
              >
                Iniciar sesion
              </a>
              <a
                href="/register"
                style={{
                  display: 'block',
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: '0.875rem',
                  color: 'var(--color-text-secondary)',
                  textDecoration: 'none',
                }}
                className="transition-colors hover:text-brand-500"
              >
                Registrarse
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
