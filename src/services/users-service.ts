import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db, users, sessions } from '../db';
import { randomUUID } from 'crypto';

export async function registerUser(name: string, email: string, password: string): Promise<string> {
  // Check if email is already registered
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    throw new Error('Email sudah terdaftar');
  }

  // Hash password using bcryptjs with 10 salt rounds
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert new user into database
  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  return 'OK';
}

export async function loginUser(
  email: string,
  password: string,
): Promise<string> {
  // Query user by email
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length === 0) {
    throw new Error('Email atau password salah');
  }

  const user = existingUser[0];

  if (!user) {
    throw new Error('Email atau password salah');
  }

  // Compare password with bcrypt hash
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Email atau password salah');
  }

  // Generate session token
  const token = randomUUID();

  // Insert new session
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
  // Query session by token
  const existingSession = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  const session = existingSession[0];
  if (!session) {
    throw new Error('Unauthorized');
  }

  // Query user by userId without password
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
    throw new Error('Unauthorized');
  }

  return user;
}
