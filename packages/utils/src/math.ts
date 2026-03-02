export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Linear interpolation between two values */
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}
