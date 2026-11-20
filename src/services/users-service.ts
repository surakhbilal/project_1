import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { db, users, sessions } from '../db';
import { HttpError, isDuplicateEntryError } from '../errors';

const SALT_ROUNDS = 10;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<string> {
  const normalizedEmail = normalizeEmail(email);
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new HttpError(400, 'Nama wajib diisi');
  }

  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existingUser.length > 0) {
    throw new HttpError(400, 'Email sudah terdaftar');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    await db.insert(users).values({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
    });
  } catch (error) {
    // Tangani race condition: dua request mendaftar email yang sama bersamaan.
    if (isDuplicateEntryError(error)) {
      throw new HttpError(400, 'Email sudah terdaftar');
    }
    throw error;
  }

  return 'OK';
}

export async function loginUser(
  email: string,
  password: string,
): Promise<string> {
  const normalizedEmail = normalizeEmail(email);

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  const user = existingUser[0];

  if (!user) {
    throw new HttpError(400, 'Email atau password salah');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new HttpError(400, 'Email atau password salah');
  }

  const token = randomUUID();

  await db.insert(sessions).values({
    token,
    userId: user.id,
  });

  return token;
}

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  created_at: Date;
};

export async function getCurrentUser(token: string): Promise<CurrentUser> {
  const existingSession = await db
    .select({ id: sessions.id, userId: sessions.userId })
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  const session = existingSession[0];
  if (!session) {
    throw new HttpError(401, 'Unauthorized');
  }

  const existingUser = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      created_at: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  const user = existingUser[0];
  if (!user) {
    throw new HttpError(401, 'Unauthorized');
  }

  return user;
}

export async function logoutUser(token: string): Promise<string> {
  const existingSession = await db
    .select({ id: sessions.id })
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  if (!existingSession[0]) {
    throw new HttpError(401, 'Unauthorized');
  }

  await db.delete(sessions).where(eq(sessions.token, token));

  return 'OK';
}
