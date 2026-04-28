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
        style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-overlay)' }}
        className="animate-pulse"
      />
    );
  }

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-lg transition-colors"
        style={{
          color: 'var(--color-text-muted)',
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="User menu"
        type="button"
      >
        {user ? (
          <div
            style={{
              width: 24,
              height: 24,
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
            marginTop: 12,
            minWidth: 240,
            borderRadius: 16,
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg-primary)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
            zIndex: 100,
            overflow: 'hidden',
            animation: 'fadeInScale 0.2s ease-out',
          }}
        >
          {user ? (
            <>
              <div
                style={{
                  padding: '16px',
                  background: 'rgba(255,255,255,0.02)',
                  borderBottom: '1px solid var(--color-border-subtle)',
                }}
              >
                <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                  {user.name}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {user.email}
                </p>
              </div>
              <div style={{ padding: 6 }}>
                <a
                  href="/private"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 10,
                    fontSize: '0.9rem',
                    color: 'var(--color-text-secondary)',
                    textDecoration: 'none',
                  }}
                  className="transition-colors hover:bg-white/5 hover:text-brand-500"
                >
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    role="img"
                  >
                    <title>Área Privada Icon</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Área Privada
                </a>
                <div
                  style={{ height: 1, background: 'var(--color-border-subtle)', margin: '4px 8px' }}
                />
                <button
                  onClick={handleLogout}
                  type="button"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 12px',
                    borderRadius: 10,
                    fontSize: '0.9rem',
                    color: '#f87171',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  className="transition-colors hover:bg-red-500/10"
                >
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    role="img"
                  >
                    <title>Cerrar sesión Icon</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            </>
          ) : (
            <div style={{ padding: 6 }}>
              <a
                href="/login"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 16px',
                  borderRadius: 10,
                  fontSize: '0.95rem',
                  color: 'var(--color-text)',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
                className="transition-colors hover:bg-brand-500/10 hover:text-brand-500"
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  role="img"
                >
                  <title>Iniciar sesión Icon</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Iniciar sesión
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
