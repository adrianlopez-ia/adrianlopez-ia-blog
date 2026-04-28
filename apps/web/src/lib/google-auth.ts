const API_URL = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3000/api';

export function getGoogleLoginUrl(redirectTo?: string): string {
  const url = new URL(`${API_URL}/auth/google`);
  if (redirectTo) {
    url.searchParams.set('redirectTo', redirectTo);
  }
  return url.toString();
}
