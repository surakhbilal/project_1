import { Elysia, t } from 'elysia';
import * as usersService from '../services/users-service';
import { HttpError } from '../errors';

export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7).trim();
  return token.length > 0 ? token : null;
}

export function handleRouteError(error: unknown, set: { status?: number | string }) {
  if (error instanceof HttpError) {
    set.status = error.status;
    return {
      error: error.message,
    };
  }

  if (process.env.NODE_ENV !== 'test') {
    console.error('Unhandled route error:', error);
  }
  set.status = 500;
  return {
    error: 'Internal Server Error',
  };
}

export const usersRoute = new Elysia({ prefix: '/api/users' })
  .post(
    '/',
    async ({ body, set }) => {
      try {
        const result = await usersService.registerUser(body.name, body.email, body.password);
        set.status = 201;
        return {
          data: result,
        };
      } catch (error) {
        return handleRouteError(error, set);
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
        const token = await usersService.loginUser(body.email, body.password);
        return {
          data: token,
        };
      } catch (error) {
        return handleRouteError(error, set);
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
      const token = extractBearerToken(headers.authorization);
      if (!token) {
        set.status = 401;
        return {
          error: 'Unauthorized',
        };
      }

      try {
        const user = await usersService.getCurrentUser(token);
        return {
          data: user,
        };
      } catch (error) {
        return handleRouteError(error, set);
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
      const token = extractBearerToken(headers.authorization);
      if (!token) {
        set.status = 401;
        return {
          error: 'Unauthorized',
        };
      }

      try {
        const result = await usersService.logoutUser(token);
        return {
          data: result,
        };
      } catch (error) {
        return handleRouteError(error, set);
      }
    },
    {
      headers: t.Object({
        authorization: t.Optional(t.String()),
      }),
    },
  );
