import { Elysia } from 'elysia';
import { userRoutes } from './routes/users';
import { usersRoute } from './routes/users-route';

const port = Number(process.env.PORT) || 3000;

export const app = new Elysia()
  // Health check endpoint
  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }))
  // Mount user CRUD routes
  .use(userRoutes)
  // Mount user auth routes
  .use(usersRoute);

if (import.meta.main) {
  app.listen(port);
  console.log(`🦊 Elysia server running at http://${app.server?.hostname}:${app.server?.port}`);
}

export type App = typeof app;
