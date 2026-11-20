import { Elysia, t } from 'elysia';
import { registerUser } from '../services/users-service';

export const usersRoute = new Elysia({ prefix: '/api/users' }).post(
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
  }
);
