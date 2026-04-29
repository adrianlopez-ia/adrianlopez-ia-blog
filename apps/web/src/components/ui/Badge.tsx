import type { ReactNode } from 'react';
import './Badge.css';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'brand' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  const classes = ['badge', `badge-${size}`, `badge-${variant}`, className]
    .filter(Boolean)
    .join(' ');
  return <span className={classes}>{children}</span>;
}
