import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.875rem',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.7 : 1,
    transition: 'all 0.2s ease',
  };

  const sizeStyles = {
    sm: { padding: '8px 12px', minHeight: 36, fontSize: '0.8rem' },
    md: { padding: '10px 16px', minHeight: 40, fontSize: '0.875rem' },
    lg: { padding: '12px 24px', minHeight: 44, fontSize: '0.95rem' },
  };

  const variantStyles = {
    primary: {
      background:
        'linear-gradient(135deg, var(--color-accent-primary, #7c3aed), var(--color-info, #06b6d4))',
      color: '#fff',
    },
    secondary: {
      background: 'var(--color-overlay)',
      color: 'var(--color-text-secondary)',
      border: '1px solid var(--color-border)',
    },
    danger: {
      background: 'var(--color-error-bg, rgba(248, 113, 113, 0.1))',
      color: 'var(--color-error, #f87171)',
      border: '1px solid var(--color-error-alpha, rgba(248, 113, 113, 0.2))',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--color-text-secondary)',
    },
    accent: {
      background: 'var(--color-accent-primary, rgba(124, 58, 237, 0.1))',
      color: 'var(--color-accent-primary, #7c3aed)',
    },
  };

  const style = {
    ...baseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...props.style,
  };

  return (
    <button
      className={['btn', `btn-${size}`, `btn-${variant}`, className].filter(Boolean).join(' ')}
      disabled={disabled}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
}
