import { ApiError, authApi } from '@lib/api-client';
import { useCallback, useState } from 'react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      try {
        await authApi.login(email, password);
        window.location.href = '/private';
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Error al iniciar sesion');
      } finally {
        setLoading(false);
      }
    },
    [email, password],
  );

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            background: 'rgba(248, 113, 113, 0.1)',
            color: '#f87171',
            fontSize: '0.875rem',
            border: '1px solid rgba(248, 113, 113, 0.2)',
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label
          htmlFor="email"
          style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid var(--color-border-subtle)',
            background: 'var(--color-bg-secondary, #0f0a1a)',
            color: 'var(--color-text-primary)',
            fontSize: '0.875rem',
            outline: 'none',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label
          htmlFor="password"
          style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}
        >
          Contrasena
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 8 caracteres"
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid var(--color-border-subtle)',
            background: 'var(--color-bg-secondary, #0f0a1a)',
            color: 'var(--color-text-primary)',
            fontSize: '0.875rem',
            outline: 'none',
          }}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '10px 20px',
          borderRadius: 8,
          background: loading ? '#4c1d95' : '#7c3aed',
          color: '#fff',
          fontWeight: 600,
          fontSize: '0.875rem',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          marginTop: 8,
        }}
      >
        {loading ? 'Entrando...' : 'Iniciar sesion'}
      </button>

      <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
        No tienes cuenta?{' '}
        <a href="/register" style={{ color: '#7c3aed', textDecoration: 'none' }}>
          Registrate
        </a>
      </p>
    </form>
  );
}
