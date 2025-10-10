import type { Dayjs } from 'dayjs';

export type IQueueStatus = 'pending' | 'running' | 'completed' | 'error';

export type IQueueItem = {
  id: string;
  data: unknown;
  status: IQueueStatus;
  scheduledAt: Dayjs;
  finishedAt: Dayjs | null;
};

export type IOnProcessTask = (task: IQueueItem) => Promise<boolean>;
export type IOnAllConcluded = () => void;

export type ITaskQueueOptions = {
  storageDir: string;
  onProcessTask: IOnProcessTask;
  onAllConcluded?: IOnAllConcluded;
  concurrency?: number;
  delayAfterBatchMs?: number | (() => number);
  schedulerIntervalMs?: number;
  generateTaskIdFn?: (data: unknown) => string;
};
