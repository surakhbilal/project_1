import { Elysia, t } from 'elysia';
import { eq } from 'drizzle-orm';
import { db, users } from '../db';

export const userRoutes = new Elysia({ prefix: '/users' })
  // GET /users - List all users
  .get('/', async () => {
    const allUsers = await db.select().from(users);
    return {
      success: true,
      data: allUsers,
    };
  })

  // GET /users/:id - Get user by ID
  .get(
    '/:id',
    async ({ params: { id }, set }) => {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      const user = result[0];
      if (!user) {
        set.status = 404;
        return {
          success: false,
          message: `User with ID ${id} not found`,
        };
      }

      return {
        success: true,
        data: user,
      };
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    }
  )

  // POST /users - Create new user
  .post(
    '/',
    async ({ body, set }) => {
      try {
        const insertResult = await db.insert(users).values({
          name: body.name,
          email: body.email,
          password: (body as any).password || '',
        });

        const insertId = Number(insertResult[0].insertId);
        const createdUsers = await db
          .select()
          .from(users)
          .where(eq(users.id, insertId))
          .limit(1);

        set.status = 201;
        return {
          success: true,
          message: 'User created successfully',
          data: createdUsers[0] || { id: insertId, ...body },
        };
      } catch (error: any) {
        if (error?.code === 'ER_DUP_ENTRY') {
          set.status = 409;
          return {
            success: false,
            message: 'Email already exists',
          };
        }
        set.status = 500;
        return {
          success: false,
          message: error?.message || 'Failed to create user',
        };
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        email: t.String({ format: 'email' }),
      }),
    }
  )

  // PUT /users/:id - Update user by ID
  .put(
    '/:id',
    async ({ params: { id }, body, set }) => {
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      if (!existing[0]) {
        set.status = 404;
        return {
          success: false,
          message: `User with ID ${id} not found`,
        };
      }

      await db
        .update(users)
        .set(body)
        .where(eq(users.id, id));

      const updated = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      return {
        success: true,
        message: 'User updated successfully',
        data: updated[0],
      };
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1 })),
        email: t.Optional(t.String({ format: 'email' })),
      }),
    }
  )

  // DELETE /users/:id - Delete user by ID
  .delete(
    '/:id',
    async ({ params: { id }, set }) => {
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      if (!existing[0]) {
        set.status = 404;
        return {
          success: false,
          message: `User with ID ${id} not found`,
        };
      }

      await db.delete(users).where(eq(users.id, id));

      return {
        success: true,
        message: 'User deleted successfully',
      };
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    }
  );
