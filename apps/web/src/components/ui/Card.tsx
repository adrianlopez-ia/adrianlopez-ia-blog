import type { ReactNode } from 'react';
import './Card.css';

export interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
  as?: 'div' | 'a';
  href?: string;
  style?: React.CSSProperties;
}

export function Card({
  children,
  className = '',
  hoverable = false,
  onClick,
  as = 'div',
  href,
  style,
}: CardProps) {
  const baseStyle = {
    padding: 24,
    borderRadius: 16,
    border: '1px solid var(--color-border-subtle)',
    background: 'var(--color-bg-primary)',
    transition: 'all 0.2s ease',
    ...style,
  };

  const hoverStyle = hoverable
    ? {
        cursor: 'pointer',
      }
    : {};

  const commonProps = {
    className: `card ${hoverable ? 'card-hoverable' : ''} ${className}`,
    style: { ...baseStyle, ...hoverStyle },
    role: onClick ? 'button' : undefined,
    tabIndex: onClick ? 0 : undefined,
    onKeyDown: onClick
      ? (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }
      : undefined,
  };

  if (as === 'a') {
    return (
      <a href={href} {...commonProps}>
        {children}
      </a>
    );
  }

  return (
    <div {...commonProps} onClick={onClick}>
      {children}
    </div>
  );
}
