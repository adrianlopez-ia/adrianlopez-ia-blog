import { useEffect, useState } from 'react';
import { Button } from '../../ui/Button';
import { type Reservation, cancelReservation, getReservations } from './api';

interface ReservationsListProps {
  token: string;
}

export function ReservationsList({ token }: ReservationsListProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReservations();
  }, [token]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const all = await getReservations(token, { limit: 100 });
      // Filter to show only future reservations
      const now = new Date();
      const future = all.filter((r) => new Date(r.scheduledFor) > now);
      setReservations(future);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      await cancelReservation(id, token);
      await loadReservations();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to cancel reservation');
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (cents: number) => {
    return `${(cents / 100).toFixed(2)}€`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'var(--color-accent-primary, #7c3aed)';
      case 'launched':
        return 'var(--color-info, #06b6d4)';
      case 'completed':
        return 'var(--color-success, #4ade80)';
      case 'failed':
        return 'var(--color-error, #f87171)';
      default:
        return 'var(--color-text-muted, #9ca3af)';
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: 24,
          borderRadius: 16,
          border: '1px solid var(--color-border-subtle)',
          background: 'var(--color-bg-primary)',
          textAlign: 'center',
        }}
      >
        Loading reservations...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: 24,
          borderRadius: 16,
          border: '1px solid var(--color-error-alpha, rgba(248, 113, 113, 0.2))',
          background: 'var(--color-error-bg, rgba(248, 113, 113, 0.05))',
          color: 'var(--color-error, #f87171)',
        }}
      >
        {error}
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div
        style={{
          padding: 24,
          borderRadius: 16,
          border: '1px solid var(--color-border-subtle)',
          background: 'var(--color-bg-primary)',
          textAlign: 'center',
        }}
      >
        <p style={{ color: 'var(--color-text-secondary)' }}>No upcoming reservations found.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 24,
        borderRadius: 16,
        border: '1px solid var(--color-border-subtle)',
        background: 'var(--color-bg-primary)',
      }}
    >
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 20 }}>
        📋 Upcoming Reservations
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {reservations.map((reservation) => (
          <div
            key={reservation.id}
            style={{
              padding: 16,
              borderRadius: 12,
              border: '1px solid var(--color-border-subtle)',
              background: 'var(--color-bg-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    marginBottom: 4,
                  }}
                >
                  {formatDate(reservation.scheduledFor)}
                </div>
                <div
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  🕐 {formatTime(reservation.scheduledFor)} • Target: {reservation.targetHour}
                </div>
              </div>
              <div
                style={{
                  padding: '4px 12px',
                  borderRadius: 9999,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  background: `${getStatusColor(reservation.status)}20`,
                  color: getStatusColor(reservation.status),
                  textTransform: 'capitalize',
                }}
              >
                {reservation.status}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 16,
                fontSize: '0.875rem',
                color: 'var(--color-text-secondary)',
                flexWrap: 'wrap',
              }}
            >
              <span>💰 Cost: {formatCurrency(reservation.totalCost)}</span>
              <span>💵 Received: {formatCurrency(reservation.moneyReceived)}</span>
              <span>⏱️ Max wait: {reservation.maxWaitMinutes}min</span>
              <span>💡 Light: {reservation.withLight ? 'Yes' : 'No'}</span>
              <span>⏰ Duration: {reservation.twoHours ? '2h' : '1h'}</span>
            </div>

            {reservation.status === 'scheduled' && (
              <Button
                type="button"
                onClick={() => handleCancel(reservation.id)}
                variant="danger"
                size="sm"
                style={{ alignSelf: 'flex-start' }}
              >
                Cancel Reservation
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
