import type { HealthResponse, UserProfile } from '../types';

const TOKEN_STORAGE_KEY = 'edurail_session_token';

export function getSavedToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // ignore storage errors
  }
}

export function clearSavedToken(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
}

async function parseJsonSafe(response: Response): Promise<any> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * 1. GET /health - Cek status server backend ElysiaJS
 */
export async function checkBackendHealth(): Promise<{
  ok: boolean;
  latencyMs: number;
  data?: HealthResponse;
}> {
  const start = performance.now();
  try {
    const response = await fetch('/health');
    const latencyMs = Math.round(performance.now() - start);
    if (!response.ok) {
      return { ok: false, latencyMs };
    }
    const data = (await parseJsonSafe(response)) as HealthResponse;
    return { ok: data?.status === 'ok', latencyMs, data };
  } catch {
    return { ok: false, latencyMs: Math.round(performance.now() - start) };
  }
}

/**
 * 2. POST /api/users - Registrasi mahasiswa baru (password di-hash bcrypt di backend)
 */
export async function apiRegisterUser(payload: {
  name: string;
  email: string;
  password: string;
}): Promise<{ data: string }> {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await parseJsonSafe(response);
  if (!response.ok) {
    throw new Error(
      body?.error ||
        (response.status === 422
          ? 'Format input tidak valid (pastikan email benar & password min. 6 karakter)'
          : 'Registrasi gagal'),
    );
  }

  return body as { data: string };
}

/**
 * 3. POST /api/users/login - Login mahasiswa & buat sesi UUID di tabel `sessions`
 */
export async function apiLoginUser(payload: {
  email: string;
  password: string;
}): Promise<{ data: string }> {
  const response = await fetch('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await parseJsonSafe(response);
  if (!response.ok) {
    throw new Error(
      body?.error ||
        (response.status === 422
          ? 'Mohon masukkan format email dan password yang valid'
          : 'Email atau password salah'),
    );
  }

  return body as { data: string };
}

/**
 * 4. GET /api/users/current - Ambil profil mahasiswa yang sedang login menggunakan Bearer token
 */
export async function apiGetCurrentUser(
  token: string,
): Promise<{ data: UserProfile }> {
  const response = await fetch('/api/users/current', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await parseJsonSafe(response);
  if (!response.ok) {
    throw new Error(body?.error || 'Unauthorized');
  }

  return body as { data: UserProfile };
}

/**
 * 5. DELETE /api/users/current - Logout & hapus sesi dari tabel `sessions`
 */
export async function apiLogoutUser(token: string): Promise<{ data: string }> {
  const response = await fetch('/api/users/current', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await parseJsonSafe(response);
  if (!response.ok) {
    throw new Error(body?.error || 'Unauthorized');
  }

  return body as { data: string };
}

/**
 * 6. GET /users - Ambil daftar seluruh user yang terdaftar di database MySQL (tanpa field password)
 */
export async function apiListAllUsers(): Promise<{
  success: boolean;
  data: UserProfile[];
}> {
  const response = await fetch('/users');
  const body = await parseJsonSafe(response);
  if (!response.ok) {
    throw new Error(body?.error || 'Gagal memuat daftar user dari database');
  }
  return body as { success: boolean; data: UserProfile[] };
}

/**
 * 7. PUT /users/:id - Update profil mahasiswa di database MySQL
 */
export async function apiUpdateUser(
  id: number,
  payload: { name?: string; email?: string; password?: string },
): Promise<{ success: boolean; data: UserProfile }> {
  const response = await fetch(`/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await parseJsonSafe(response);
  if (!response.ok) {
    throw new Error(body?.error || 'Gagal memperbarui data user');
  }
  return body as { success: boolean; data: UserProfile };
}

/**
 * 8. DELETE /users/:id - Hapus user berdasarkan ID di database MySQL
 */
export async function apiDeleteUser(
  id: number,
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`/users/${id}`, {
    method: 'DELETE',
  });

  const body = await parseJsonSafe(response);
  if (!response.ok) {
    throw new Error(body?.error || 'Gagal menghapus user');
  }
  return body as { success: boolean; message: string };
}
