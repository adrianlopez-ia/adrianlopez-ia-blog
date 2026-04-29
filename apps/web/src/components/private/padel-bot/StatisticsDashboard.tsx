import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '../../ui/Card';
import { type ReservationStats, getStatistics } from './api';

interface StatisticsDashboardProps {
  token: string;
}

export function StatisticsDashboard({ token }: StatisticsDashboardProps) {
  const [stats, setStats] = useState<ReservationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date()
      .toISOString()
      .slice(0, 7), // YYYY-MM format
  );

  useEffect(() => {
    loadStats();
  }, [token, selectedMonth]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStatistics(token, selectedMonth);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return `${(cents / 100).toFixed(2)}€`;
  };

  if (loading) {
    return <Card style={{ textAlign: 'center' }}>Loading statistics...</Card>;
  }

  if (error) {
    return (
      <Card
        style={{
          border: '1px solid rgba(248, 113, 113, 0.2)',
          background: 'rgba(248, 113, 113, 0.05)',
          color: '#f87171',
        }}
      >
        {error}
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            margin: 0,
          }}
        >
          📊 Statistics
        </h2>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid var(--color-border-subtle)',
            background: 'var(--color-bg-secondary)',
            color: 'var(--color-text-primary)',
            fontSize: '0.875rem',
          }}
        />
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <SummaryCard
          label="Total Spent"
          value={formatCurrency(stats.totalSpent)}
          color="var(--color-error, #f87171)"
        />
        <SummaryCard
          label="Total Received"
          value={formatCurrency(stats.totalReceived)}
          color="var(--color-success, #4ade80)"
        />
        <SummaryCard
          label="Net Balance"
          value={formatCurrency(stats.netBalance)}
          color={
            stats.netBalance >= 0 ? 'var(--color-success, #4ade80)' : 'var(--color-error, #f87171)'
          }
        />
        <SummaryCard
          label="Total Reservations"
          value={stats.totalReservations.toString()}
          color="var(--color-accent-primary, #7c3aed)"
        />
      </div>

      {/* Daily Spending Chart */}
      <Card style={{ marginBottom: 24 }}>
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          Daily Spending
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.dailyData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border-subtle, rgba(255,255,255,0.1))"
            />
            <XAxis
              dataKey="date"
              stroke="var(--color-text-muted)"
              fontSize={12}
              tickFormatter={(value: string) => {
                const date = new Date(value);
                return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
              }}
            />
            <YAxis
              stroke="var(--color-text-muted)"
              fontSize={12}
              tickFormatter={(value: number) => `${(value / 100).toFixed(0)}€`}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 8,
                color: 'var(--color-text-primary)',
              }}
              labelFormatter={(value: string) => {
                const date = new Date(value);
                return date.toLocaleDateString('es-ES', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                });
              }}
              formatter={(value: number) => [`${(value / 100).toFixed(2)}€`, 'Spent']}
            />
            <Bar dataKey="spent" fill="var(--color-error, #f87171)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Money Received vs Spent Chart */}
      <Card>
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          Money Flow
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.dailyData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border-subtle, rgba(255,255,255,0.1))"
            />
            <XAxis
              dataKey="date"
              stroke="var(--color-text-muted)"
              fontSize={12}
              tickFormatter={(value: string) => {
                const date = new Date(value);
                return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
              }}
            />
            <YAxis
              stroke="var(--color-text-muted)"
              fontSize={12}
              tickFormatter={(value: number) => `${(value / 100).toFixed(0)}€`}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 8,
                color: 'var(--color-text-primary)',
              }}
              labelFormatter={(value: string) => {
                const date = new Date(value);
                return date.toLocaleDateString('es-ES', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                });
              }}
              formatter={(value: number, name: string) => [
                `${(value / 100).toFixed(2)}€`,
                name === 'spent' ? 'Spent' : 'Received',
              ]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="spent"
              stroke="var(--color-error, #f87171)"
              strokeWidth={2}
              name="Spent"
              dot={{ fill: 'var(--color-error, #f87171)' }}
            />
            <Line
              type="monotone"
              dataKey="received"
              stroke="var(--color-success, #4ade80)"
              strokeWidth={2}
              name="Received"
              dot={{ fill: 'var(--color-success, #4ade80)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: string;
  color: string;
}

function SummaryCard({ label, value, color }: SummaryCardProps) {
  return (
    <Card hoverable style={{ padding: 20, borderRadius: 12 }}>
      <p
        style={{
          fontSize: '0.75rem',
          fontWeight: 500,
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          margin: '0 0 8px 0',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color,
          margin: 0,
        }}
      >
        {value}
      </p>
    </Card>
  );
}
