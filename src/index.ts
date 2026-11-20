import { Elysia } from 'elysia';
import { userRoutes } from './routes/users';

const port = Number(process.env.PORT) || 3000;

export const app = new Elysia()
  // Health check endpoint
  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }))
  // Mount user CRUD routes
  .use(userRoutes)
  .listen(port);

console.log(`🦊 Elysia server running at http://${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
