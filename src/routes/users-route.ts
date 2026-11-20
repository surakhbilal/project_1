import { Elysia, t } from 'elysia';
import * as usersService from '../services/users-service';
import { handleRouteError } from '../errors';
import { extractBearerToken } from '../lib/auth';

const credentialsSchema = t.Object({
  email: t.String({ format: 'email', maxLength: 255 }),
  password: t.String({ minLength: 1, maxLength: 72 }),
});

const authHeadersSchema = t.Object({
  authorization: t.Optional(t.String()),
});

export const usersRoute = new Elysia({ prefix: '/api/users' })
  .post(
    '/',
    async ({ body, set }) => {
      try {
        const result = await usersService.registerUser(
          body.name,
          body.email,
          body.password,
        );
        set.status = 201;
        return { data: result };
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
  .post(
    '/login',
    async ({ body, set }) => {
      try {
        const token = await usersService.loginUser(body.email, body.password);
        return { data: token };
      } catch (error) {
        return handleRouteError(error, set);
      }
    },
    { body: credentialsSchema },
  )
  .get(
    '/current',
    async ({ headers, set }) => {
      const token = extractBearerToken(headers.authorization);

      if (!token) {
        set.status = 401;
        return { error: 'Unauthorized' };
      }

      try {
        const user = await usersService.getCurrentUser(token);
        return { data: user };
      } catch (error) {
        return handleRouteError(error, set);
      }
    },
    { headers: authHeadersSchema },
  )
  .delete(
    '/current',
    async ({ headers, set }) => {
      const token = extractBearerToken(headers.authorization);

      if (!token) {
        set.status = 401;
        return { error: 'Unauthorized' };
      }

      try {
        const result = await usersService.logoutUser(token);
        return { data: result };
      } catch (error) {
        return handleRouteError(error, set);
      }
    },
    { headers: authHeadersSchema },
  );
