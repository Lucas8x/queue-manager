import { randomInt } from 'node:crypto';
import path from 'node:path';
import { TaskQueue } from '@queue/lib';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { queueLogger } from './utils/logger';

dayjs.extend(utc);

const tasksFile = path.join(
  import.meta.dir,
  '..',
  'output',
  'queue',
  'tasks.json',
);

let queueInstance: TaskQueue | null = null;

function getQueue(): TaskQueue {
  if (!queueInstance) {
    queueInstance = new TaskQueue({
      tasksFilePath: tasksFile,
      delayAfterBatchMs: () => randomInt(30, 60 + 1) * 1000, // 30 ~ 60 seconds
      schedulerIntervalMs: 10 * 1000, // 10 seconds
      onProcessTask: async (task) => {
        // Implement your task processing logic here

        // fake processing delay 5 ~ 15 seconds
        await new Promise((r) => setTimeout(r, randomInt(5000, 15000 + 1)));

        const randomSuccess = Math.random() < 0.4;
        // Return true if successful, false otherwise
        return randomSuccess;
      },
      onAllConcluded: () => {
        queueLogger.info('All done, exiting gracefully...');
        process.exit(0);
      },
      dayjs: () => dayjs().utc(true),
      logger: queueLogger,
    });
  }

  return queueInstance;
}

const queue = getQueue();

export { queue };
