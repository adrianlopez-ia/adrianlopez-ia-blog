import { describe, expect, it } from 'vitest';
import { capitalize, stripHtml, truncate } from './string';

describe('truncate', () => {
  it('returns original string if shorter than max length', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates and adds suffix', () => {
    expect(truncate('hello world', 8)).toBe('hello...');
  });

  it('uses custom suffix', () => {
    expect(truncate('hello world', 9, '…')).toBe('hello wo…');
  });
});

describe('capitalize', () => {
  it('capitalizes first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('handles empty string', () => {
    expect(capitalize('')).toBe('');
  });

  it('handles already capitalized', () => {
    expect(capitalize('Hello')).toBe('Hello');
  });
});

describe('stripHtml', () => {
  it('removes HTML tags', () => {
    expect(stripHtml('<p>Hello <strong>world</strong></p>')).toBe('Hello world');
  });

  it('handles text without HTML', () => {
    expect(stripHtml('plain text')).toBe('plain text');
  });
});
