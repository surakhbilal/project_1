import { Elysia } from 'elysia';
import { userRoutes } from './routes/users';
import { usersRoute } from './routes/users-route';
import { poolConnection } from './db';

const port = Number(process.env.PORT) || 3000;

export const app = new Elysia()
  // Serve Frontend EduRail App (HTML)
  .get('/', () => {
    return new Response(Bun.file('public/index.html'), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  })
  // Serve Frontend Bundle (React + Lucide bundled via Bun.build)
  .get('/app.js', async () => {
    const buildResult = await Bun.build({
      entrypoints: ['./src/frontend/main.tsx'],
      target: 'browser',
      minify: false,
    });

    const output = buildResult.outputs[0];
    if (buildResult.success && output) {
      const code = await output.text();
      return new Response(code, {
        headers: { 'Content-Type': 'application/javascript; charset=utf-8' },
      });
    }

    return new Response(Bun.file('public/app.js'), {
      headers: { 'Content-Type': 'application/javascript; charset=utf-8' },
    });
  })
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
    `🦊 EduRail Full-Stack Server (ElysiaJS + React UI) running at http://${app.server?.hostname}:${app.server?.port}`,
  );

  const shutdown = async () => {
    await poolConnection.end();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

export type App = typeof app;
