import type { ReactNode } from 'react';
import './Tab.css';

export interface TabProps {
  children: ReactNode;
  value: string;
  activeValue: string;
  onClick: (value: string) => void;
  disabled?: boolean;
}

export function Tab({ children, value, activeValue, onClick, disabled = false }: TabProps) {
  const isActive = value === activeValue;

  return (
    <button
      type="button"
      onClick={() => !disabled && onClick(value)}
      disabled={disabled}
      className={`tab ${isActive ? 'tab-active' : ''} ${disabled ? 'tab-disabled' : ''}`}
      role="tab"
      aria-selected={isActive}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
}

export interface TabsProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Tabs({ children, className = '', style }: TabsProps) {
  return (
    <div className={`tabs ${className}`} style={style} role="tablist">
      {children}
    </div>
  );
}
