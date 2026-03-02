import { describe, expect, it } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
  it('converts basic text to slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('handles special characters', () => {
    expect(slugify('Hello & Goodbye!')).toBe('hello-goodbye');
  });

  it('handles unicode/accented characters', () => {
    expect(slugify('Café au Lait')).toBe('cafe-au-lait');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify(' --Hello-- ')).toBe('hello');
  });

  it('collapses multiple hyphens', () => {
    expect(slugify('one   two   three')).toBe('one-two-three');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('handles numbers', () => {
    expect(slugify('Top 10 Posts 2026')).toBe('top-10-posts-2026');
  });
});
