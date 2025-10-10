import path from 'node:path';
import { cors } from '@elysiajs/cors';
import { openapi } from '@elysiajs/openapi';
import { staticPlugin } from '@elysiajs/static';
import { Elysia, file } from 'elysia';
import pkg from '../package.json';
import { IS_PROD, PORT } from './env';
import { queue } from './queue';
import { type SSEClient, SSEManager } from './sse-manager';

const frontendDir = path.join(import.meta.dir, '..', '..', 'dashboard', 'dist');
const indexHtml = path.join(frontendDir, 'index.html');

const sseManager = new SSEManager();

const app = new Elysia()
  .use(
    openapi({
      documentation: {
        info: {
          title: pkg.name,
          version: pkg.version,
        },
      },
    }),
  )
  .use(
    staticPlugin({
      assets: frontendDir,
      prefix: '/',
    }),
  )
  .use(
    cors({
      origin: '*',
    }),
  )
  .get('/', () => file(indexHtml))
  .get('/health', () => queue.getIsRunning())
  .get('/events', () => {
    const encoder = new TextEncoder();
    let client: SSEClient;

    const stream = new ReadableStream({
      start(controller) {
        client = {
          write: (data: string) => controller.enqueue(encoder.encode(data)),
          close: () => sseManager.removeClient(client),
        };
        sseManager.addClient(client);
      },
      cancel() {
        client?.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  })
  .group('/tasks', (app) =>
    app
      .post('/restart-failed', ({ status }) => {
        queue.restartErrorTasks();
        return status(200);
      })
      .post('/pause', ({ status }) => {
        queue.stopScheduler();
        return status(200);
      })
      .post('/resume', ({ status }) => {
        queue.startScheduler();
        return status(200);
      }),
  );

setInterval(() => {
  sseManager.broadcast(queue.getQueue());
}, 1000);

app.listen({
  port: PORT,
  idleTimeout: 0,
});

export { app };
