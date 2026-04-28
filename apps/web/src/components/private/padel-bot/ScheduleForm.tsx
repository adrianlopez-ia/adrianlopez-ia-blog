import { useState } from 'react';
import { useNotifications } from '../../ui/NotificationContext';
import { type CreateReservationInput, calculateCost, createReservation } from './api';

interface ScheduleFormProps {
  token: string;
  onSuccess?: () => void;
}

const inputStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 8,
  border: '1px solid var(--color-border-subtle)',
  background: 'var(--color-bg-secondary, #0f0a1a)',
  color: 'var(--color-text-primary)',
  fontSize: '0.875rem',
  outline: 'none',
  width: '100%',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 500,
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

export function ScheduleForm({ token, onSuccess }: ScheduleFormProps) {
  const { addNotification } = useNotifications();
  const [scheduledFor, setScheduledFor] = useState('');
  const [targetHour, setTargetHour] = useState('19:00');
  const [daysAhead, setDaysAhead] = useState('5');
  const [withLight, setWithLight] = useState(false);
  const [twoHours, setTwoHours] = useState(false);
  const [maxWait, setMaxWait] = useState('12');

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');

  const estimatedCost = calculateCost(withLight, twoHours);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!scheduledFor) {
      setStatus('error');
      setError('Please select a date and time');
      return;
    }

    setStatus('loading');
    setError('');

    try {
      const input: CreateReservationInput = {
        scheduledFor,
        targetHour,
        daysAhead,
        withLight,
        twoHours,
        maxWaitMinutes: maxWait,
      };

      await createReservation(input, token);
      setStatus('success');
      addNotification('success', 'Reservation scheduled successfully');
      onSuccess?.();

      // Reset form
      setScheduledFor('');
      setTargetHour('19:00');
      setDaysAhead('5');
      setWithLight(false);
      setTwoHours(false);
      setMaxWait('12');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to schedule reservation');
      addNotification('error', 'Failed to schedule reservation');
    }
  };

  return (
    <div
      style={{
        padding: 24,
        borderRadius: 16,
        border: '1px solid var(--color-border-subtle)',
        background: 'var(--color-bg-primary)',
      }}
    >
      <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 20 }}>Schedule Reservation</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label htmlFor="scheduled-for" style={labelStyle}>
            Date and time to launch
          </label>
          <input
            id="scheduled-for"
            type="datetime-local"
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
            style={{ ...inputStyle, marginTop: 4 }}
            required
          />
        </div>

        <div>
          <label htmlFor="target-hour" style={labelStyle}>
            Target hour
          </label>
          <input
            id="target-hour"
            type="time"
            value={targetHour}
            onChange={(e) => setTargetHour(e.target.value)}
            style={{ ...inputStyle, marginTop: 4 }}
          />
        </div>

        <div>
          <label htmlFor="days-ahead" style={labelStyle}>
            Days in advance
          </label>
          <input
            id="days-ahead"
            type="number"
            min="1"
            max="14"
            value={daysAhead}
            onChange={(e) => setDaysAhead(e.target.value)}
            style={{ ...inputStyle, marginTop: 4 }}
          />
        </div>

        <div>
          <label htmlFor="max-wait" style={labelStyle}>
            Max wait time (min)
          </label>
          <input
            id="max-wait"
            type="number"
            min="1"
            max="60"
            value={maxWait}
            onChange={(e) => setMaxWait(e.target.value)}
            style={{ ...inputStyle, marginTop: 4 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 24, marginTop: 4 }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={withLight}
              onChange={(e) => setWithLight(e.target.checked)}
              style={{ accentColor: '#7c3aed', width: 16, height: 16 }}
            />
            With light
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={twoHours}
              onChange={(e) => setTwoHours(e.target.checked)}
              style={{ accentColor: '#7c3aed', width: 16, height: 16 }}
            />
            2 hours
          </label>
        </div>

        {/* Cost Preview */}
        <div
          style={{
            padding: 12,
            borderRadius: 8,
            background: 'rgba(124, 58, 237, 0.05)',
            border: '1px solid rgba(124, 58, 237, 0.1)',
          }}
        >
          <p
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            Estimated cost
          </p>
          <p
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#7c3aed',
              margin: 0,
            }}
          >
            {estimatedCost.toFixed(2)}€
          </p>
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            padding: '12px 32px',
            borderRadius: 10,
            background:
              status === 'loading' ? '#4c1d95' : 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.95rem',
            border: 'none',
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            opacity: status === 'loading' ? 0.7 : 1,
            marginTop: 8,
          }}
        >
          {status === 'loading' ? 'Scheduling...' : '📅 Schedule Reservation'}
        </button>

        {status === 'success' && (
          <span style={{ fontSize: '0.875rem', color: '#4ade80', fontWeight: 500 }}>
            Reservation scheduled successfully!
          </span>
        )}
        {status === 'error' && error && (
          <span style={{ fontSize: '0.875rem', color: '#f87171', fontWeight: 500 }}>{error}</span>
        )}
      </form>
    </div>
  );
}
