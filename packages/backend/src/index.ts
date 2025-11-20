import readline from 'node:readline';
import { parseArgs } from 'node:util';
import open from 'open';
import pc from 'picocolors';
import { queue } from './queue';
import { app } from './server';
import { IS_PROD } from './utils/env';
import { serverLogger } from './utils/logger';
import { setupTrayIcon } from './utils/setup-trayicon';

const dashboardUrl = `http://${app.server?.hostname}:${app.server?.port}`;

serverLogger.info(`Dashboard is running at ${pc.cyan(dashboardUrl)}`);

await queue.init();
queue.startScheduler();

async function handleShutdown(signal: string) {
  serverLogger.info(`Exiting gracefully... [${signal}]`);
  await queue.saveTasks();
  process.exit(0);
}

const shortcuts = {
  d: {
    description: 'open dashboard',
    action: () => {
      serverLogger.info('Opening dashboard...');
      open(dashboardUrl);
    },
  },
  p: {
    description: 'pause scheduler',
    action: () => {
      serverLogger.info('Pausing scheduler...');
      queue.stopScheduler();
    },
  },
  s: {
    description: 'start/resume scheduler',
    action: () => {
      serverLogger.info('Starting/Resuming scheduler...');
      queue.startScheduler();
    },
  },
  r: {
    description: 'restart failed tasks',
    action: () => {
      serverLogger.info('Restarting failed tasks...');
      queue.restartErrorTasks();
    },
  },
  q: {
    description: 'quit',
    action: () => {
      handleShutdown('SIGINT');
    },
  },
} as const;

/* if (IS_PROD) {
  setupTrayIcon({
    onOpenDashboard: shortcuts.q.action,
    onRestart: shortcuts.r.action,
    onPause: shortcuts.p.action,
    onResume: shortcuts.s.action,
    onExit: shortcuts.q.action,
  });
} */

readline.emitKeypressEvents(process.stdin);

if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
}

process.stdin.on('keypress', (_, key) => {
  if (!key || !('name' in key)) return;

  if (shortcuts[key.name as keyof typeof shortcuts]) {
    shortcuts[key.name as keyof typeof shortcuts].action();
  }

  if (key.ctrl && key.name === 'c') {
    shortcuts.q.action();
  }
});

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('beforeExit', () => handleShutdown('beforeExit'));

for (const [key, value] of Object.entries(shortcuts)) {
  console.log(
    pc.dim('  press ') + pc.bold(key) + pc.dim(` to ${value.description}`),
  );
}

export type App = typeof app;

// ============================================================================

const {
  values: { seed },
} = parseArgs({
  args: Bun.argv,
  options: {
    seed: { type: 'boolean' },
  },
  allowPositionals: true,
});

if (seed) {
  if (queue.getQueue().length > 0) {
    console.warn('[DEBUG] Queue is not empty, skipping seeding of fake tasks.');
  } else {
    console.info('[DEBUG] Seeding with fake tasks...');
    queue.addTask(
      Array.from({ length: 10 }).map((_, i) => ({
        id: `fake-task-${i + 1}`,
      })),
    );
  }
}
