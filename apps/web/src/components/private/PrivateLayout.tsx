import { AuthGuard } from '@components/auth/AuthGuard';
import type { ReactNode } from 'react';

const privateApps = [
  {
    title: 'Padel Bot',
    description: 'Lanza reservas automaticas de pistas de padel.',
    href: '/private/padel-bot',
    icon: '🎾',
    status: 'live' as const,
  },
];

interface PrivateLayoutProps {
  children: ReactNode;
  currentPath?: string;
}

export function PrivateLayout({ children, currentPath = '' }: PrivateLayoutProps) {
  return (
    <AuthGuard>
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
            <a
              href="/private"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: '0.875rem',
                textDecoration: 'none',
                color: currentPath === '/private' ? '#7c3aed' : 'var(--color-text-secondary)',
                background: currentPath === '/private' ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
                fontWeight: currentPath === '/private' ? 600 : 400,
              }}
            >
              <span>📋</span> Dashboard
            </a>

            {privateApps.map((app) => (
              <a
                key={app.href}
                href={app.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  color: currentPath === app.href ? '#7c3aed' : 'var(--color-text-secondary)',
                  background: currentPath === app.href ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
                  fontWeight: currentPath === app.href ? 600 : 400,
                }}
              >
                <span>{app.icon}</span> {app.title}
              </a>
            ))}
          </nav>
        </aside>

        <main style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>{children}</main>
      </div>
    </AuthGuard>
  );
}
