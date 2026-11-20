import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { app } from '../src/index';
import * as usersService from '../src/services/users-service';
import { HttpError } from '../src/errors';
import { extractBearerToken } from '../src/lib/auth';

const BASE_URL = 'http://localhost:3000';

afterEach(() => {
  mock.restore();
});

function jsonRequest(
  path: string,
  body: unknown,
  method = 'POST',
  headers: Record<string, string> = {},
) {
  return new Request(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

function authRequest(path: string, token?: string, method = 'GET') {
  const headers: Record<string, string> = {};
  if (token !== undefined) {
    headers.Authorization = `Bearer ${token}`;
  }
  return new Request(`${BASE_URL}${path}`, { method, headers });
}

describe('Health check', () => {
  it('returns 200 ok for GET /health', async () => {
    const response = await app.handle(new Request(`${BASE_URL}/health`));
    expect(response.status).toBe(200);

    const data = (await response.json()) as {
      status: string;
      timestamp: string;
    };
    expect(data.status).toBe('ok');
    expect(data.timestamp).toBeDefined();
  });

  it('serves EduRail Frontend HTML on GET /', async () => {
    const response = await app.handle(new Request(`${BASE_URL}/`));
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');
    const html = await response.text();
    expect(html).toContain('EduRail');
  });
});

describe('Request validation', () => {
  it('rejects invalid body for POST /users', async () => {
    const response = await app.handle(
      jsonRequest('/users', { name: '', email: 'invalid-email' }),
    );
    expect(response.status).toBe(422);
  });

  it('rejects short password for POST /api/users', async () => {
    const response = await app.handle(
      jsonRequest('/api/users', {
        name: 'rakhbil',
        email: 'rakhbil@localhost.com',
        password: '123',
      }),
    );
    expect(response.status).toBe(422);
  });

  it('rejects invalid email for POST /api/users/login', async () => {
    const response = await app.handle(
      jsonRequest('/api/users/login', {
        email: 'not-an-email',
        password: '',
      }),
    );
    expect(response.status).toBe(422);
  });
});

describe('POST /api/users (registrasi)', () => {
  it('returns 201 on success', async () => {
    const spy = spyOn(usersService, 'registerUser').mockResolvedValueOnce('OK');

    const response = await app.handle(
      jsonRequest('/api/users', {
        name: 'rakhbil',
        email: 'rakhbil@localhost.com',
        password: 'secretpassword',
      }),
    );

    expect(response.status).toBe(201);
    const data = (await response.json()) as { data: string };
    expect(data.data).toBe('OK');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('returns 400 when email already registered', async () => {
    spyOn(usersService, 'registerUser').mockRejectedValueOnce(
      new HttpError(400, 'Email sudah terdaftar'),
    );

    const response = await app.handle(
      jsonRequest('/api/users', {
        name: 'rakhbil',
        email: 'rakhbil@localhost.com',
        password: 'secretpassword',
      }),
    );

    expect(response.status).toBe(400);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe('Email sudah terdaftar');
  });

  it('returns 500 without leaking internal errors', async () => {
    spyOn(usersService, 'registerUser').mockRejectedValueOnce(
      new Error('Failed query: select * from users where secret_internal_db_info'),
    );

    const response = await app.handle(
      jsonRequest('/api/users', {
        name: 'rakhbil',
        email: 'rakhbil@localhost.com',
        password: 'secretpassword',
      }),
    );

    expect(response.status).toBe(500);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe('Internal Server Error');
    expect(JSON.stringify(data)).not.toContain('secret_internal_db_info');
  });
});

describe('POST /api/users/login', () => {
  it('returns 200 with token on success', async () => {
    const fakeToken = 'e2a3b4c5-0000-0000-0000-000000000000';
    spyOn(usersService, 'loginUser').mockResolvedValueOnce(fakeToken);

    const response = await app.handle(
      jsonRequest('/api/users/login', {
        email: 'rakhbil@localhost.com',
        password: 'secretpassword',
      }),
    );

    expect(response.status).toBe(200);
    const data = (await response.json()) as { data: string };
    expect(data.data).toBe(fakeToken);
  });

  it('returns 400 when credentials are wrong', async () => {
    spyOn(usersService, 'loginUser').mockRejectedValueOnce(
      new HttpError(400, 'Email atau password salah'),
    );

    const response = await app.handle(
      jsonRequest('/api/users/login', {
        email: 'rakhbil@localhost.com',
        password: 'wrongpassword',
      }),
    );

    expect(response.status).toBe(400);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe('Email atau password salah');
  });
});

describe('GET /api/users/current', () => {
  it('returns 401 without authorization header', async () => {
    const response = await app.handle(authRequest('/api/users/current'));

    expect(response.status).toBe(401);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 401 with invalid token', async () => {
    spyOn(usersService, 'getCurrentUser').mockRejectedValueOnce(
      new HttpError(401, 'Unauthorized'),
    );

    const response = await app.handle(
      authRequest('/api/users/current', 'invalid-token'),
    );

    expect(response.status).toBe(401);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe('Unauthorized');
  });

  it('returns user data without password on success', async () => {
    const fakeUser = {
      id: 1,
      name: 'Rakhbil',
      email: 'rakhbil@localhost.com',
      created_at: new Date('2026-11-20T09:00:00.000Z'),
    };
    spyOn(usersService, 'getCurrentUser').mockResolvedValueOnce(fakeUser);

    const response = await app.handle(
      authRequest('/api/users/current', 'valid-token'),
    );

    expect(response.status).toBe(200);
    const body = (await response.json()) as { data: typeof fakeUser };
    expect(body.data.id).toBe(1);
    expect((body.data as Record<string, unknown>).password).toBeUndefined();
  });

  it('returns 500 (not 401) when database is down', async () => {
    spyOn(usersService, 'getCurrentUser').mockRejectedValueOnce(
      new Error('ECONNREFUSED 127.0.0.1:3306'),
    );

    const response = await app.handle(
      authRequest('/api/users/current', 'valid-token'),
    );

    expect(response.status).toBe(500);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe('Internal Server Error');
  });
});

describe('DELETE /api/users/current (logout)', () => {
  it('returns 401 without authorization header', async () => {
    const response = await app.handle(
      authRequest('/api/users/current', undefined, 'DELETE'),
    );
    expect(response.status).toBe(401);
  });

  it('returns 401 with invalid token', async () => {
    spyOn(usersService, 'logoutUser').mockRejectedValueOnce(
      new HttpError(401, 'Unauthorized'),
    );

    const response = await app.handle(
      authRequest('/api/users/current', 'invalid-token', 'DELETE'),
    );
    expect(response.status).toBe(401);
  });

  it('returns 200 on successful logout', async () => {
    spyOn(usersService, 'logoutUser').mockResolvedValueOnce('OK');

    const response = await app.handle(
      authRequest('/api/users/current', 'valid-token', 'DELETE'),
    );

    expect(response.status).toBe(200);
    const data = (await response.json()) as { data: string };
    expect(data.data).toBe('OK');
  });
});

describe('extractBearerToken', () => {
  it('handles various authorization header formats', () => {
    expect(extractBearerToken(undefined)).toBeNull();
    expect(extractBearerToken('')).toBeNull();
    expect(extractBearerToken('Basic 12345')).toBeNull();
    expect(extractBearerToken('Bearer')).toBeNull();
    expect(extractBearerToken('Bearer   ')).toBeNull();
    expect(extractBearerToken('Bearer my-valid-token')).toBe('my-valid-token');
    expect(extractBearerToken('Bearer   token-with-spaces   ')).toBe(
      'token-with-spaces',
    );
  });
});
