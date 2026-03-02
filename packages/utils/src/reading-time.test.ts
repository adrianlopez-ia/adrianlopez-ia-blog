import { describe, expect, it } from 'vitest';
import { estimateReadingTime } from './reading-time';

describe('estimateReadingTime', () => {
  it('returns 1 minute for short text', () => {
    expect(estimateReadingTime('Hello world')).toBe(1);
  });

  it('calculates correct reading time for longer text', () => {
    const words = Array(400).fill('word').join(' ');
    expect(estimateReadingTime(words)).toBe(2);
  });

  it('rounds up to nearest minute', () => {
    const words = Array(250).fill('word').join(' ');
    expect(estimateReadingTime(words)).toBe(2);
  });

  it('handles 200 words as 1 minute', () => {
    const words = Array(200).fill('word').join(' ');
    expect(estimateReadingTime(words)).toBe(1);
  });
});
