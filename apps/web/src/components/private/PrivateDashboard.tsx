import { type AuthUser, authApi, getToken } from '@lib/api-client';
import { useEffect, useState } from 'react';
import { Card } from '../ui/Card';

const APPS = [
  {
    title: 'Padel Bot',
    description:
      'Lanza reservas automaticas de pistas de padel configurando hora, dias y preferencias.',
    href: '/private/padel-bot',
    icon: '🎾',
    tags: ['GitHub Actions', 'API Dispatch'],
    status: 'live',
    restrictedTo: 'adrianislopezis@gmail.com',
  },
];

export function PrivateDashboard() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    authApi.me().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  const visibleApps = APPS.filter((app) => {
    if (!app.restrictedTo) return true;
    return user?.email === app.restrictedTo;
  });

  return (
    <div>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.875rem',
          fontWeight: 700,
          letterSpacing: '-0.025em',
        }}
      >
        My <span className="gradient-text">Private Apps</span>
      </h1>
      <p style={{ marginTop: 8, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
        Exclusive tools and micro-apps.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 24,
          marginTop: 32,
        }}
      >
        {visibleApps.map((app) => (
          <Card
            key={app.href}
            hoverable
            as="a"
            href={app.href}
            className="group themed-card"
            style={{
              display: 'block',
              padding: 24,
              borderRadius: 16,
              textDecoration: 'none',
              transition: 'all 0.3s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '2rem' }}>{app.icon}</span>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  borderRadius: 9999,
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  background: 'rgba(74, 222, 128, 0.1)',
                  color: '#4ade80',
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
                {app.status}
              </span>
            </div>
            <h2
              className="group-hover:text-brand-500 dark:group-hover:text-brand-400"
              style={{
                marginTop: 16,
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                fontWeight: 700,
                transition: 'color 0.2s',
              }}
            >
              {app.title}
            </h2>
            <p style={{ marginTop: 8, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              {app.description}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
              {app.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    borderRadius: 9999,
                    padding: '2px 8px',
                    fontSize: '0.75rem',
                    background: 'var(--color-overlay)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </Card>
        ))}

        {visibleApps.length === 0 && (
          <Card className="themed-card" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              No tienes apps privadas disponibles.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
