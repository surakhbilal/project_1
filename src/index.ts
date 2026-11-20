import { Elysia } from 'elysia';
import { userRoutes } from './routes/users';
import { usersRoute } from './routes/users-route';
import { poolConnection } from './db';

const port = Number(process.env.PORT) || 3000;

export const app = new Elysia()
  // Health check endpoint
  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }))
  // CRUD users
  .use(userRoutes)
  // Registrasi, login, current user, logout
  .use(usersRoute);

if (import.meta.main) {
  app.listen(port);

  console.log(
    `🦊 Elysia server running at http://${app.server?.hostname}:${app.server?.port}`,
  );

  const shutdown = async () => {
    await poolConnection.end();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

export type App = typeof app;
