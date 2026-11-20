import { Elysia, t } from 'elysia';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db, users } from '../db';
import { registerUser } from '../services/users-service';
import {
  HttpError,
  handleRouteError,
  isDuplicateEntryError,
} from '../errors';

// Jangan pernah mengembalikan kolom password ke client.
const publicUserFields = {
  id: users.id,
  name: users.name,
  email: users.email,
  createdAt: users.createdAt,
};

const idParamsSchema = t.Object({
  id: t.Numeric(),
});

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export const userRoutes = new Elysia({ prefix: '/users' })
  .get('/', async ({ set }) => {
    try {
      const allUsers = await db.select(publicUserFields).from(users);

      return {
        success: true,
        data: allUsers,
      };
    } catch (error) {
      return handleRouteError(error, set);
    }
  })

  .get(
    '/:id',
    async ({ params: { id }, set }) => {
      try {
        const result = await db
          .select(publicUserFields)
          .from(users)
          .where(eq(users.id, id))
          .limit(1);

        const user = result[0];
        if (!user) {
          throw new HttpError(404, `User with ID ${id} not found`);
        }

        return {
          success: true,
          data: user,
        };
      } catch (error) {
        return handleRouteError(error, set);
      }
    },
    { params: idParamsSchema },
  )

  .post(
    '/',
    async ({ body, set }) => {
      try {
        await registerUser(body.name, body.email, body.password);

        const created = await db
          .select(publicUserFields)
          .from(users)
          .where(eq(users.email, normalizeEmail(body.email)))
          .limit(1);

        set.status = 201;
        return {
          success: true,
          message: 'User created successfully',
          data: created[0] ?? null,
        };
      } catch (error) {
        return handleRouteError(error, set);
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1, maxLength: 255 }),
        email: t.String({ format: 'email', maxLength: 255 }),
        password: t.String({ minLength: 6, maxLength: 72 }),
      }),
    },
  )

  .put(
    '/:id',
    async ({ params: { id }, body, set }) => {
      try {
        const existing = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.id, id))
          .limit(1);

        if (!existing[0]) {
          throw new HttpError(404, `User with ID ${id} not found`);
        }

        const updateData: {
          name?: string;
          email?: string;
          password?: string;
        } = {};

        if (body.name !== undefined) updateData.name = body.name.trim();
        if (body.email !== undefined) {
          updateData.email = normalizeEmail(body.email);
        }
        if (body.password !== undefined) {
          updateData.password = await bcrypt.hash(body.password, 10);
        }

        if (Object.keys(updateData).length > 0) {
          await db.update(users).set(updateData).where(eq(users.id, id));
        }

        const updated = await db
          .select(publicUserFields)
          .from(users)
          .where(eq(users.id, id))
          .limit(1);

        return {
          success: true,
          message: 'User updated successfully',
          data: updated[0] ?? null,
        };
      } catch (error) {
        if (isDuplicateEntryError(error)) {
          set.status = 409;
          return { error: 'Email already exists' };
        }
        return handleRouteError(error, set);
      }
    },
    {
      params: idParamsSchema,
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
        email: t.Optional(t.String({ format: 'email', maxLength: 255 })),
        password: t.Optional(t.String({ minLength: 6, maxLength: 72 })),
      }),
    },
  )

  .delete(
    '/:id',
    async ({ params: { id }, set }) => {
      try {
        const existing = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.id, id))
          .limit(1);

        if (!existing[0]) {
          throw new HttpError(404, `User with ID ${id} not found`);
        }

        await db.delete(users).where(eq(users.id, id));

        return {
          success: true,
          message: 'User deleted successfully',
        };
      } catch (error) {
        return handleRouteError(error, set);
      }
    },
    { params: idParamsSchema },
  );
