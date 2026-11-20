import { describe, expect, it } from 'bun:test';
import { app } from '../src/index';

describe('Elysia Server Endpoints', () => {
  it('returns 200 ok for /health', async () => {
    const response = await app.handle(new Request('http://localhost:3000/health'));
    expect(response.status).toBe(200);
    const data = (await response.json()) as { status: string; timestamp: string };
    expect(data.status).toBe('ok');
    expect(data.timestamp).toBeDefined();
  });

  it('validates request body for POST /users', async () => {
    const response = await app.handle(
      new Request('http://localhost:3000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '', email: 'invalid-email' }),
      })
    );
    expect(response.status).toBe(422);
  });
});
