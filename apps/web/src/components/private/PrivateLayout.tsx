import { type AuthUser, authApi, getToken } from '@lib/api-client';
import { type ReactNode, useEffect, useState } from 'react';
import { Link } from '../ui/Link';

const ALL_PRIVATE_APPS = [
  {
    title: 'Padel Bot',
    description: 'Automated padel court booking system.',
    href: '/private/padel-bot',
    icon: '🎾',
    status: 'live' as const,
    restrictedTo: 'adrianislopezis@gmail.com',
  },
];

interface PrivateLayoutProps {
  children: ReactNode;
  currentPath?: string;
}

export function PrivateLayout({ children, currentPath = '' }: PrivateLayoutProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: '2px solid #7c3aed',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
      </div>
    );
  }

  const visibleApps = ALL_PRIVATE_APPS.filter((app) => {
    if (!app.restrictedTo) return true;
    return user?.email === app.restrictedTo;
  });

  // If current page is restricted and user doesn't have access, redirect to dashboard
  const currentApp = ALL_PRIVATE_APPS.find((a) => a.href === currentPath);
  if (
    typeof window !== 'undefined' &&
    currentApp?.restrictedTo &&
    user?.email !== currentApp.restrictedTo
  ) {
    window.location.href = '/private';
    return null;
  }

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 200px)' }}>
      <aside
        style={{
          width: 260,
          borderRight: '1px solid var(--color-border-subtle)',
          padding: '24px 16px',
          flexShrink: 0,
        }}
        className="hidden md:block"
      >
        <div style={{ marginBottom: 24 }}>
          <h2
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-text-muted)',
            }}
          >
            Private Apps
          </h2>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Link href="/private" variant="nav" active={currentPath === '/private'}>
            <span>📋</span> Dashboard
          </Link>

          {visibleApps.map((app) => (
            <Link key={app.href} href={app.href} variant="nav" active={currentPath === app.href}>
              <span>{app.icon}</span> {app.title}
            </Link>
          ))}
        </nav>
      </aside>

      <main style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
        {/* Pass user to children if they are components that can receive props */}
        {children}
      </main>
    </div>
  );
}
