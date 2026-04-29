import { useEffect, useRef, useState } from 'react';
import './Select.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function Select({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  className = '',
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && options[focusedIndex] && !options[focusedIndex].disabled) {
          handleSelect(options[focusedIndex].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        triggerRef.current?.focus();
        break;
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
      setIsOpen(false);
      setFocusedIndex(-1);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      const optionElements = dropdownRef.current?.querySelectorAll('.select-option');
      optionElements?.[focusedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex, isOpen]);

  return (
    <div ref={selectRef} className={`select-container ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`select-trigger ${isOpen ? 'select-trigger-open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="select-value">{selectedOption?.label || placeholder}</span>
        <span className="select-arrow">▼</span>
      </button>

      {isOpen && (
        // biome-ignore lint/a11y/useSemanticElements: Custom styled dropdown requires div instead of native select
        <div ref={dropdownRef} className="select-dropdown" role="listbox" tabIndex={-1}>
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              onClick={() => !option.disabled && handleSelect(option.value)}
              className={`select-option ${option.value === value ? 'select-option-selected' : ''} ${option.disabled ? 'select-option-disabled' : ''} ${index === focusedIndex ? 'select-option-focused' : ''}`}
              // biome-ignore lint/a11y/useSemanticElements: Custom styled option requires button for full styling control
              role="option"
              aria-selected={option.value === value}
              aria-disabled={option.disabled}
              disabled={option.disabled}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
