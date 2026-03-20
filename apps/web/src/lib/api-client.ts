const API_URL = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3000/api';

const TOKEN_KEY = 'auth_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

interface FetchOptions extends RequestInit {
  auth?: boolean;
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { auth = false, headers: customHeaders, ...rest } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${path}`, { ...rest, headers });
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.message ?? 'Request failed', response.status, data);
  }

  return data as T;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

interface AuthResponse {
  success: boolean;
  data: { user: AuthUser; token: string };
}

interface MeResponse {
  success: boolean;
  data: AuthUser;
}

export const authApi = {
  async register(
    email: string,
    password: string,
    name: string,
  ): Promise<{ user: AuthUser; token: string }> {
    const res = await apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    setToken(res.data.token);
    return res.data;
  },

  async login(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
    const res = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(res.data.token);
    return res.data;
  },

  logout(): void {
    removeToken();
  },

  async me(): Promise<AuthUser | null> {
    try {
      const res = await apiFetch<MeResponse>('/auth/me', { auth: true });
      return res.data;
    } catch {
      removeToken();
      return null;
    }
  },
};
