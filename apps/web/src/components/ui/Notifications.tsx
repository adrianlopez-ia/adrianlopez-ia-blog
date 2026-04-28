import { useNotifications } from './NotificationContext';

const notificationStyles: Record<string, { style: React.CSSProperties; icon: string }> = {
  success: {
    style: {
      background: 'rgba(74, 222, 128, 0.1)',
      border: '1px solid rgba(74, 222, 128, 0.2)',
      color: '#4ade80',
    },
    icon: '✓',
  },
  error: {
    style: {
      background: 'rgba(248, 113, 113, 0.1)',
      border: '1px solid rgba(248, 113, 113, 0.2)',
      color: '#f87171',
    },
    icon: '✕',
  },
  info: {
    style: {
      background: 'rgba(59, 130, 246, 0.1)',
      border: '1px solid rgba(59, 130, 246, 0.2)',
      color: '#3b82f6',
    },
    icon: 'ℹ',
  },
  warning: {
    style: {
      background: 'rgba(251, 191, 36, 0.1)',
      border: '1px solid rgba(251, 191, 36, 0.2)',
      color: '#fbbf24',
    },
    icon: '⚠',
  },
};

export function Notifications() {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        maxWidth: 400,
      }}
    >
      {notifications.map((notification) => {
        const config = notificationStyles[notification.type] || notificationStyles.info;
        if (!config) return null;
        return (
          <div
            key={notification.id}
            style={{
              padding: '16px 20px',
              borderRadius: 12,
              background: config.style.background,
              border: config.style.border,
              color: config.style.color,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              animation: 'slideIn 0.3s ease-out',
              minWidth: 300,
            }}
          >
            <span
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {config.icon}
            </span>
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                flex: 1,
              }}
            >
              {notification.message}
            </span>
            <button
              type="button"
              onClick={() => removeNotification(notification.id)}
              style={{
                background: 'none',
                border: 'none',
                color: config.style.color,
                cursor: 'pointer',
                fontSize: '1.25rem',
                fontWeight: 600,
                padding: 4,
                lineHeight: 1,
                opacity: 0.7,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.7';
              }}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
