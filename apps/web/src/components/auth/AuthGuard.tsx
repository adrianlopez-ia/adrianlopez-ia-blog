import { type AuthUser, authApi, getToken } from '@lib/api-client';
import { type ReactNode, useEffect, useState } from 'react';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.href = '/login';
      return;
    }

    authApi.me().then((u) => {
      if (!u) {
        window.location.href = '/login';
        return;
      }
      setUser(u);
      setChecking(false);
    });
  }, []);

  if (checking) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 32,
              height: 32,
              border: '2px solid #7c3aed',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              margin: '0 auto',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p style={{ marginTop: 12, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Verificando sesion...
          </p>
          <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
