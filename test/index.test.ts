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

  it('validates request body for POST /api/users (missing password or invalid email)', async () => {
    const response = await app.handle(
      new Request('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'rakhbil',
          email: 'not-an-email',
          password: '123', // less than 6 chars
        }),
      })
    );
    expect(response.status).toBe(422);
  });

  it('validates request body for POST /api/users/login (invalid email)', async () => {
    const response = await app.handle(
      new Request('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'not-an-email',
          password: '',
        }),
      })
    );
    expect(response.status).toBe(422);
  });

  it('returns 401 for GET /api/users/current without authorization header', async () => {
    const response = await app.handle(
      new Request('http://localhost:3000/api/users/current')
    );
    expect(response.status).toBe(401);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 401 for GET /api/users/current with invalid token', async () => {
    const response = await app.handle(
      new Request('http://localhost:3000/api/users/current', {
        headers: {
          Authorization: 'Bearer invalid-token-12345',
        },
      })
    );
    expect(response.status).toBe(401);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 401 for DELETE /api/users/current without authorization header', async () => {
    const response = await app.handle(
      new Request('http://localhost:3000/api/users/current', {
        method: 'DELETE',
      })
    );
    expect(response.status).toBe(401);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 401 for DELETE /api/users/current with invalid token', async () => {
    const response = await app.handle(
      new Request('http://localhost:3000/api/users/current', {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer invalid-token-99999',
        },
      })
    );
    expect(response.status).toBe(401);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe('Unauthorized');
  });
});
