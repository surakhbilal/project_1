import { describe, expect, it, spyOn } from 'bun:test';
import { app } from '../src/index';
import * as usersService from '../src/services/users-service';
import { HttpError } from '../src/errors';
import { extractBearerToken } from '../src/routes/users-route';

describe('Elysia Server Endpoints', () => {
  it('returns 200 ok for /health', async () => {
    const response = await app.handle(new Request('http://localhost:3000/health'));
    expect(response.status).toBe(200);
    const data = (await response.json()) as { status: string; timestamp: string };
    expect(data.status).toBe('ok');
    expect(data.timestamp).toBeDefined();
  });

  describe('Request Schema Validations', () => {
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

    it('returns 401 for GET /api/users/current with non-Bearer auth scheme', async () => {
      const response = await app.handle(
        new Request('http://localhost:3000/api/users/current', {
          headers: {
            Authorization: 'Basic dXNlcjpwYXNz',
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

    it('returns 401 for DELETE /api/users/current with empty Bearer token', async () => {
      const response = await app.handle(
        new Request('http://localhost:3000/api/users/current', {
          method: 'DELETE',
          headers: {
            Authorization: 'Bearer   ',
          },
        })
      );
      expect(response.status).toBe(401);
      const data = (await response.json()) as { error: string };
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('Business Logic & HTTP Status Contract', () => {
    it('POST /api/users returns 201 on success', async () => {
      const spy = spyOn(usersService, 'registerUser').mockResolvedValueOnce('OK');

      const response = await app.handle(
        new Request('http://localhost:3000/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'rakhbil',
            email: 'rakhbil@localhost.com',
            password: 'secretpassword',
          }),
        })
      );

      expect(response.status).toBe(201);
      const data = (await response.json()) as { data: string };
      expect(data.data).toBe('OK');
      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });

    it('POST /api/users returns 400 when email is already registered', async () => {
      const spy = spyOn(usersService, 'registerUser').mockRejectedValueOnce(
        new HttpError(400, 'Email sudah terdaftar')
      );

      const response = await app.handle(
        new Request('http://localhost:3000/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'rakhbil',
            email: 'rakhbil@localhost.com',
            password: 'secretpassword',
          }),
        })
      );

      expect(response.status).toBe(400);
      const data = (await response.json()) as { error: string };
      expect(data.error).toBe('Email sudah terdaftar');
      spy.mockRestore();
    });

    it('POST /api/users returns 500 without leaking raw database errors', async () => {
      const spy = spyOn(usersService, 'registerUser').mockRejectedValueOnce(
        new Error('Failed query: select * from users where secret_internal_db_info')
      );

      const response = await app.handle(
        new Request('http://localhost:3000/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'rakhbil',
            email: 'rakhbil@localhost.com',
            password: 'secretpassword',
          }),
        })
      );

      expect(response.status).toBe(500);
      const data = (await response.json()) as { error: string };
      expect(data.error).toBe('Internal Server Error');
      expect(JSON.stringify(data)).not.toContain('secret_internal_db_info');
      spy.mockRestore();
    });

    it('POST /api/users/login returns 200 with token on success', async () => {
      const fakeToken = 'e2a3b4c5-0000-0000-0000-000000000000';
      const spy = spyOn(usersService, 'loginUser').mockResolvedValueOnce(fakeToken);

      const response = await app.handle(
        new Request('http://localhost:3000/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'rakhbil@localhost.com',
            password: 'secretpassword',
          }),
        })
      );

      expect(response.status).toBe(200);
      const data = (await response.json()) as { data: string };
      expect(data.data).toBe(fakeToken);
      spy.mockRestore();
    });

    it('POST /api/users/login returns 400 when credentials are wrong', async () => {
      const spy = spyOn(usersService, 'loginUser').mockRejectedValueOnce(
        new HttpError(400, 'Email atau password salah')
      );

      const response = await app.handle(
        new Request('http://localhost:3000/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'rakhbil@localhost.com',
            password: 'wrongpassword',
          }),
        })
      );

      expect(response.status).toBe(400);
      const data = (await response.json()) as { error: string };
      expect(data.error).toBe('Email atau password salah');
      spy.mockRestore();
    });

    it('GET /api/users/current returns 200 and user data without password', async () => {
      const fakeUser = {
        id: 1,
        name: 'Rakhbil',
        email: 'rakhbil@localhost.com',
        created_at: new Date('2026-11-20T09:00:00.000Z'),
      };
      const spy = spyOn(usersService, 'getCurrentUser').mockResolvedValueOnce(fakeUser);

      const response = await app.handle(
        new Request('http://localhost:3000/api/users/current', {
          headers: {
            Authorization: 'Bearer valid-token-12345',
          },
        })
      );

      expect(response.status).toBe(200);
      const body = (await response.json()) as { data: typeof fakeUser };
      expect(body.data.id).toBe(1);
      expect(body.data.name).toBe('Rakhbil');
      expect(body.data.email).toBe('rakhbil@localhost.com');
      expect((body.data as any).password).toBeUndefined();
      spy.mockRestore();
    });

    it('GET /api/users/current returns 401 when token is invalid or expired', async () => {
      const spy = spyOn(usersService, 'getCurrentUser').mockRejectedValueOnce(
        new HttpError(401, 'Unauthorized')
      );

      const response = await app.handle(
        new Request('http://localhost:3000/api/users/current', {
          headers: {
            Authorization: 'Bearer invalid-token',
          },
        })
      );

      expect(response.status).toBe(401);
      const data = (await response.json()) as { error: string };
      expect(data.error).toBe('Unauthorized');
      spy.mockRestore();
    });

    it('GET /api/users/current returns 500 instead of 401 when database is down', async () => {
      const spy = spyOn(usersService, 'getCurrentUser').mockRejectedValueOnce(
        new Error('ECONNREFUSED 127.0.0.1:3306')
      );

      const response = await app.handle(
        new Request('http://localhost:3000/api/users/current', {
          headers: {
            Authorization: 'Bearer valid-token',
          },
        })
      );

      expect(response.status).toBe(500);
      const data = (await response.json()) as { error: string };
      expect(data.error).toBe('Internal Server Error');
      spy.mockRestore();
    });

    it('DELETE /api/users/current returns 200 on successful logout', async () => {
      const spy = spyOn(usersService, 'logoutUser').mockResolvedValueOnce('OK');

      const response = await app.handle(
        new Request('http://localhost:3000/api/users/current', {
          method: 'DELETE',
          headers: {
            Authorization: 'Bearer valid-token-12345',
          },
        })
      );

      expect(response.status).toBe(200);
      const data = (await response.json()) as { data: string };
      expect(data.data).toBe('OK');
      spy.mockRestore();
    });

    it('DELETE /api/users/current returns 401 when token is invalid', async () => {
      const spy = spyOn(usersService, 'logoutUser').mockRejectedValueOnce(
        new HttpError(401, 'Unauthorized')
      );

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
      spy.mockRestore();
    });
  });

  describe('Helper Functions', () => {
    it('extractBearerToken correctly handles various header inputs', () => {
      expect(extractBearerToken(undefined)).toBeNull();
      expect(extractBearerToken('')).toBeNull();
      expect(extractBearerToken('Basic 12345')).toBeNull();
      expect(extractBearerToken('Bearer')).toBeNull();
      expect(extractBearerToken('Bearer   ')).toBeNull();
      expect(extractBearerToken('Bearer my-valid-token')).toBe('my-valid-token');
      expect(extractBearerToken('Bearer   token-with-spaces   ')).toBe('token-with-spaces');
    });
  });
});
