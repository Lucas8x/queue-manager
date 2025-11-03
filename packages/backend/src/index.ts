import readline from 'node:readline';
import open from 'open';
import pc from 'picocolors';
import { IS_PROD } from './env';
import { queue } from './queue';
import { app } from './server';
import { setupTrayIcon } from './setup-trayicon';

const dashboardUrl = `http://${app.server?.hostname}:${app.server?.port}`;

console.log(`[🦊] Dashboard is running at ${pc.cyan(dashboardUrl)}`);

await queue.init();
queue.startScheduler();

async function handleShutdown(signal: string) {
  console.log(`[🦊] Exiting gracefully... [${signal}]`);
  await queue.saveTasks();
  process.exit(0);
}

const shortcuts = {
  d: {
    description: 'open dashboard',
    action: () => {
      console.log('[🦊] Opening dashboard...');
      open(dashboardUrl);
    },
  },
  p: {
    description: 'pause scheduler',
    action: () => {
      console.log('[🦊] Pausing scheduler...');
      queue.stopScheduler();
    },
  },
  s: {
    description: 'start/resume scheduler',
    action: () => {
      console.log('[🦊] Starting/Resuming scheduler...');
      queue.startScheduler();
    },
  },
  r: {
    description: 'restart failed tasks',
    action: () => {
      console.log('[🦊] Restarting failed tasks...');
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
