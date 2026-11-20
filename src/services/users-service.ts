import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db, users } from '../db';

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
