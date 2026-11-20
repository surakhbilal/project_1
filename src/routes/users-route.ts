import { Elysia, t } from 'elysia';
import { registerUser, loginUser, getCurrentUser, logoutUser } from '../services/users-service';

export const usersRoute = new Elysia({ prefix: '/api/users' })
  .post(
    '/',
    async ({ body, set }) => {
      try {
        const result = await registerUser(body.name, body.email, body.password);
        set.status = 201;
        return {
          data: result,
        };
      } catch (error: any) {
        set.status = 400;
        return {
          error: error?.message || 'Registrasi gagal',
        };
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        email: t.String({ format: 'email' }),
        password: t.String({ minLength: 6 }),
      }),
    },
  )
  .post(
    '/login',
    async ({ body, set }) => {
      try {
        const token = await loginUser(body.email, body.password);
        return {
          data: token,
        };
      } catch (error: any) {
        set.status = 400;
        return {
          error: error?.message || 'Login gagal',
        };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String({ minLength: 1 }),
      }),
    },
  )
  .get(
    '/current',
    async ({ headers, set }) => {
      try {
        const authHeader = headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          set.status = 401;
          return {
            error: 'Unauthorized',
          };
        }

        const token = authHeader.slice(7).trim();
        if (!token) {
          set.status = 401;
          return {
            error: 'Unauthorized',
          };
        }

        const user = await getCurrentUser(token);
        return {
          data: user,
        };
      } catch (error: any) {
        set.status = 401;
        return {
          error: 'Unauthorized',
        };
      }
    },
    {
      headers: t.Object({
        authorization: t.Optional(t.String()),
      }),
    },
  )
  .delete(
    '/current',
    async ({ headers, set }) => {
      try {
        const authHeader = headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          set.status = 401;
          return {
            error: 'Unauthorized',
          };
        }

        const token = authHeader.slice(7).trim();
        if (!token) {
          set.status = 401;
          return {
            error: 'Unauthorized',
          };
        }

        const result = await logoutUser(token);
        return {
          data: result,
        };
      } catch (error: any) {
        set.status = 401;
        return {
          error: 'Unauthorized',
        };
      }
    },
    {
      headers: t.Object({
        authorization: t.Optional(t.String()),
      }),
    },
  );
