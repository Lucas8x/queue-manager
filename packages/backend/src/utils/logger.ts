import { join } from 'node:path';
import pino from 'pino';

const output = join(import.meta.dir, '../../output/queue');
const logFile = join(output, 'app.log');

const rollTransport = pino.transport({
  target: 'pino-roll',
  options: {
    file: logFile,
    frequency: 'daily',
    size: '100M',
    mkdir: true,
    limit: {
      count: 7,
    },
  },
});

const consoleStream = pino.transport({
  target: 'pino-pretty',
  options: {
    colorize: true,
    messageFormat: '[{module}] {msg}',
    translateTime: 'SYS:dd/mm HH:MM:ss',
    ignore: 'pid,hostname,module',
  },
});

const logger = pino(
  {
    level: 'info',
    base: null,
  },
  pino.multistream([{ stream: consoleStream }, { stream: rollTransport }]),
);

export function createLogger(module: string) {
  return logger.child({ module });
}

export const serverLogger = createLogger('SERVER');
export const queueLogger = createLogger('QUEUE');
