import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export function Card({ children, hover = false, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-white/5 bg-white/[0.02] p-6 ${
        hover ? 'transition-all duration-300 hover:border-indigo-500/30 hover:bg-white/[0.04]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
