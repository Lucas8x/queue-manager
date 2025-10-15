import { randomInt } from 'node:crypto';
import path from 'node:path';
import { TaskQueue } from '@queue/lib';

const queueStorage = path.join(import.meta.dir, '..', 'output', 'queue');

let queueInstance: TaskQueue | null = null;

function getQueue(): TaskQueue {
  if (!queueInstance) {
    queueInstance = new TaskQueue({
      storageDir: queueStorage,
      delayAfterBatchMs: () => randomInt(30, 60 + 1) * 1000, // 30~60 seconds
      schedulerIntervalMs: 10 * 1000, // 10 seconds
      onProcessTask: async (task) => {
        // Implement your task processing logic here

        // fake processing delay
        await new Promise((r) => setTimeout(r, randomInt(5000, 15000 + 1)));

        const randomSuccess = Math.random() < 0.4;
        // Return true if successful, false otherwise
        return randomSuccess;
      },
      onAllConcluded: () => {
        console.log('[🦊] Exiting gracefully...');
        process.exit(0);
      },
    });
  }

  return queueInstance;
}

const queue = getQueue();

export { queue };
