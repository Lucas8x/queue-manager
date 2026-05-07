import path from 'node:path';
import { cors } from '@elysiajs/cors';
import { openapi } from '@elysiajs/openapi';
import { staticPlugin } from '@elysiajs/static';
import { Elysia, file, t } from 'elysia';
import pkg from '../package.json';
import { queue } from './queue';
import { IS_PROD, PORT } from './utils/env';
import { serverLogger } from './utils/logger';
import { type SSEClient, SSEManager } from './utils/sse-manager';

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
  .patch(
    '/scheduler',
    ({ body, status }) => {
      if (body.state === 'paused') {
        queue.stopScheduler();
      } else if (body.state === 'running') {
        queue.startScheduler();
      }
      return status(204);
    },
    {
      body: t.Object({
        state: t.Union([t.Literal('paused'), t.Literal('running')]),
      }),
    },
  )
  .group('/tasks', (app) =>
    app
      .post('/restart-failed', ({ status }) => {
        serverLogger.info('Received restart failed tasks.');
        queue.restartErrorTasks();
        return status(204);
      })
      .post(
        'restart-by-category',
        ({ body, status }) => {
          serverLogger.info(
            `Received command: restart failed ${body.category} tasks.`,
          );

          const ids = queue
            .getQueue()
            .map((task) => {
              const data = task.data as { category?: string } | undefined;
              if (data?.category === body.category && task.status === 'error') {
                return task.id;
              }
              return null;
            })
            .filter((i) => typeof i === 'string');

          if (ids.length === 0) {
            return status(400);
          }

          queue.restartTasksById(ids);
          return status(204);
        },
        {
          body: t.Object({
            category: t.String(),
          }),
        },
      )
      .post(
        '/restart-by-id',
        ({ body, status }) => {
          queue.restartTasksById(body.ids);
          return status(204);
        },
        {
          body: t.Object({
            ids: t.Array(t.String()),
          }),
        },
      ),
  );

setInterval(() => {
  sseManager.broadcast({
    nextRun: queue.getNextBatchTime(),
    queue: queue.getQueue(),
  });
}, 1000);

app.listen({
  port: PORT,
  idleTimeout: 0,
});

export { app };
