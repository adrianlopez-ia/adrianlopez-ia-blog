const API_URL = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3000/api';

export function getGoogleLoginUrl(): string {
  return `${API_URL}/auth/google`;
}
