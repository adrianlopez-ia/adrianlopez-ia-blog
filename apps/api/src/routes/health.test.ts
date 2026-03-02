import { describe, expect, it } from 'vitest';
import { app } from '../app';

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await app.request('/api/health');
    expect(res.status).toBe(200);

    const body = (await res.json()) as { status: string; timestamp: string; uptime: number };
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();
    expect(body.uptime).toBeDefined();
  });
});
