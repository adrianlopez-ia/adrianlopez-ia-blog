import { getGoogleLoginUrl } from '@lib/google-auth';
import { useState } from 'react';

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read error from URL query (set by backend on OAuth failure)
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get('error');
    if (urlError && !error) {
      const errorMessages: Record<string, string> = {
        google_denied: 'You canceled the sign-in with Google.',
        email_not_verified: 'Your Google account does not have a verified email.',
        google_error: 'An error occurred with Google. Please try again.',
      };
      setError(errorMessages[urlError] ?? 'Unknown error.');
    }
  }

  const handleGoogleLogin = () => {
    setLoading(true);
    let redirectTo = '/private';
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      redirectTo = params.get('redirect') ?? '/private';
    }
    window.location.href = getGoogleLoginUrl(redirectTo);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {error && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 12,
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            fontSize: '0.85rem',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
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
            <title>Error Icon</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="btn btn-google"
        aria-label="Sign in with Google"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          padding: '14px 24px',
          borderRadius: 14,
          background: loading ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)',
          color: 'var(--color-text)',
          fontWeight: 600,
          fontSize: '1rem',
          border: '1px solid var(--color-border)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          width: '100%',
        }}
      >
        {/* Google SVG icon */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          aria-hidden="true"
          style={{ flexShrink: 0 }}
        >
          <title>Google Logo</title>
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {loading ? 'Redirecting...' : 'Continue with Google'}
      </button>

      <div style={{ padding: '0 8px' }}>
        <p
          style={{
            textAlign: 'center',
            fontSize: '0.8rem',
            color: 'var(--color-text-muted)',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          By signing in you accept our{' '}
          <a href="/terms" className="link link-default" aria-label="Read terms of use">
            terms of use
          </a>
          .
          <br />
          We only use Google to securely identify you.
        </p>
      </div>
    </div>
  );
}
