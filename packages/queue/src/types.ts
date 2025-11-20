import type { Dayjs } from 'dayjs';

export type QueueStatus = 'pending' | 'running' | 'completed' | 'error';

export type QueueItem = {
  id: string;
  data: unknown;
  status: QueueStatus;
  scheduledAt: Dayjs;
  finishedAt: Dayjs | null;
};

export type OnProcessTask = (task: QueueItem) => Promise<boolean>;
export type OnAllConcluded = () => void;

export type Logger = {
  info: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
};

export type TaskQueueOptions = {
  tasksFilePath: string;
  onProcessTask: OnProcessTask;
  onAllConcluded?: OnAllConcluded;
  concurrency?: number;
  delayAfterBatchMs?: number | (() => number);
  schedulerIntervalMs?: number;
  generateTaskIdFn?: (data: unknown) => string;
  dayjs?: () => Dayjs;
  logger?: Logger | false;
};
