import type { AnchorHTMLAttributes, ReactNode } from 'react';
import './Link.css';

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  variant?: 'default' | 'nav' | 'card';
  active?: boolean;
}

export function Link({
  children,
  className = '',
  variant = 'default',
  active = false,
  ...props
}: LinkProps) {
  const baseClass = `link link-${variant} ${active ? 'active' : ''} ${className}`;

  return (
    <a className={baseClass} {...props}>
      {children}
    </a>
  );
}
