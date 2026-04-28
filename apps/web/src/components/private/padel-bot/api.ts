const API_BASE = '/api/reservations';

export interface Reservation {
  id: string;
  userId: string;
  scheduledFor: Date;
  launchedAt: Date | null;
  targetHour: string;
  daysAhead: number;
  withLight: boolean;
  twoHours: boolean;
  maxWaitMinutes: number;
  status: 'scheduled' | 'launched' | 'completed' | 'failed';
  totalCost: number;
  moneyReceived: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReservationStats {
  totalSpent: number;
  totalReceived: number;
  netBalance: number;
  totalReservations: number;
  dailyData: Array<{ date: string; spent: number; received: number }>;
}

export interface CreateReservationInput {
  scheduledFor: string;
  targetHour: string;
  daysAhead: string;
  withLight: boolean;
  twoHours: boolean;
  maxWaitMinutes: string;
}

export async function createReservation(
  input: CreateReservationInput,
  token: string,
): Promise<Reservation> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create reservation');
  }

  const { data } = await res.json();
  return data;
}

export async function getReservations(
  token: string,
  filters?: { status?: string; month?: string; limit?: number },
): Promise<Reservation[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.month) params.append('month', filters.month);
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const res = await fetch(`${API_BASE}?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to fetch reservations');
  }

  const { data } = await res.json();
  return data;
}

export async function getReservation(id: string, token: string): Promise<Reservation> {
  const res = await fetch(`${API_BASE}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to fetch reservation');
  }

  const { data } = await res.json();
  return data;
}

export async function updateReservation(
  id: string,
  updates: { status?: string; moneyReceived?: number },
  token: string,
): Promise<Reservation> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update reservation');
  }

  const { data } = await res.json();
  return data;
}

export async function cancelReservation(id: string, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to cancel reservation');
  }
}

export async function getStatistics(token: string, month?: string): Promise<ReservationStats> {
  const params = new URLSearchParams();
  if (month) params.append('month', month);

  const res = await fetch(`${API_BASE}/stats?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to fetch statistics');
  }

  const { data } = await res.json();
  return data;
}

export function calculateCost(withLight: boolean, twoHours: boolean): number {
  const hourlyRate = withLight ? 12.6 : 8.9;
  return twoHours ? hourlyRate * 2 : hourlyRate;
}
