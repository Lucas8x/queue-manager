import { appendFile, exists, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { nanoid } from 'nanoid';
import { dayjs } from './dayjs';
import type {
  IOnAllConcluded,
  IOnProcessTask,
  IQueueItem,
  ITaskQueueOptions,
} from './types';

export class TaskQueue {
  private concurrency: number;
  private delayAfterBatchMs: number | (() => number);
  private schedulerIntervalMs: number;

  private queue: IQueueItem[] = [];
  private running = false;

  private storageDir: string;
  private tasksFile: Bun.BunFile;
  private logFile: string;

  public onProcessTask: IOnProcessTask;
  public onAllConcluded: IOnAllConcluded;
  public generateTaskIdFn?: (data: unknown) => string;

  constructor({
    storageDir,
    onProcessTask,
    onAllConcluded = () => null,
    concurrency = 2,
    delayAfterBatchMs = 0,
    schedulerIntervalMs = 1000, // 1 seconds
    generateTaskIdFn = undefined,
  }: ITaskQueueOptions) {
    this.storageDir = storageDir;
    this.tasksFile = Bun.file(path.join(storageDir, 'tasks.json'));
    this.logFile = path.join(storageDir, 'log.txt');

    this.onProcessTask = onProcessTask;
    this.onAllConcluded = onAllConcluded;

    this.concurrency = concurrency;
    this.delayAfterBatchMs = delayAfterBatchMs;
    this.schedulerIntervalMs = schedulerIntervalMs;

    this.generateTaskIdFn = generateTaskIdFn;
  }

  /**
   * Initializes the storage directory and required files (tasks.json, log.txt) if they do not exist.
   * @private
   */
  private async initStorage(): Promise<void> {
    if (!(await this.tasksFile.exists())) {
      await mkdir(this.storageDir, { recursive: true });
      await Bun.write(this.tasksFile, '[]');
    }

    if (!(await exists(this.logFile))) {
      await Bun.write(this.logFile, '');
    }
  }

  /**
   * Loads tasks from the tasks.json file into the queue.
   */
  async loadTasks(): Promise<void> {
    if (await this.tasksFile.exists()) {
      this.queue = await this.tasksFile.json();
    }
  }

  /**
   * Initializes the task queue by setting up storage and loading existing tasks.
   */
  async init() {
    await this.initStorage();
    await this.loadTasks();
  }

  /**
   * Logs a message to the log file with a timestamp and outputs to the console.
   * @param {string} message - The message to log.
   */
  private async log(message: string): Promise<void> {
    const line =
      `[${dayjs().format('DD/MM HH:mm:ss')}] [Queue] ${message}\n`.trim();

    console.log(line);

    await appendFile(this.logFile, line, 'utf8');
  }

  /**
   * Saves the current queue state to the tasks.json file.
   */
  async saveTasks(): Promise<void> {
    try {
      this.log('Saving tasks to storage...');
      const data = JSON.stringify(this.queue, null, 2);
      await this.tasksFile.write(data);
    } catch (error) {
      if (error instanceof Error) {
        this.log(`Error on tasks save: ${error.message}`);
        return;
      }
      this.log(`Error on tasks save: ${error}`);
    }
  }

  /**
   * Adds one or more tasks to the queue.
   * IDs are generated automatically if not provided.
   * @param {unknown[]|unknown} tasks - The task(s) to add. Can be a single item or an array of items.
   */
  addTask(tasks: unknown[] | unknown): void {
    const items: unknown[] = Array.isArray(tasks) ? tasks : [tasks];

    for (const taskItem of items) {
      const id =
        (typeof taskItem === 'object' && taskItem !== null && 'id' in taskItem
          ? (taskItem as { id?: string }).id
          : undefined) ||
        this.generateTaskIdFn?.(taskItem) ||
        nanoid();

      this.queue.push({
        id,
        data: taskItem,
        status: 'pending',
        scheduledAt: dayjs(),
        finishedAt: null,
      });

      this.log(`Task added: ${id}`);
    }

    this.saveTasks();
  }

  /**
   * Restarts all tasks in the queue that have an 'error' status by setting them to 'pending'.
   */
  restartErrorTasks(): void {
    let count = 0;

    for (const task of this.queue) {
      if (task.status !== 'error') {
        continue;
      }

      task.status = 'pending';
      task.scheduledAt = dayjs();
      task.finishedAt = null;

      count++;
    }

    this.log(`Restarted ${count} error tasks.`);
    this.saveTasks();
  }

  /**
   * Gets the delay interval after a batch, either as a static value or by invoking a function.
   * @private
   */
  private getTaskInterval(): number {
    if (typeof this.delayAfterBatchMs === 'function') {
      return this.delayAfterBatchMs();
    }
    return this.delayAfterBatchMs;
  }

  /**
   * Checks if all tasks have been processed (no pending or running tasks).
   * Calls onAllConcluded if all are processed.
   * @private
   */
  private hasAllProcessed(): boolean {
    const allDone = this.queue.every((t) =>
      ['completed', 'error'].includes(t.status),
    );

    if (!allDone) {
      return false;
    }

    this.log('All tasks concluded.');
    this.onAllConcluded?.();
    return true;
  }

  /**
   * Calculates the number of available slots for running tasks based on concurrency.
   * @private
   */
  private getAvailableSlots(): number {
    const runningCount = this.queue.filter(
      (t) => t.status === 'running',
    ).length;

    const availableSlots = this.concurrency - runningCount;

    return availableSlots;
  }

  /**
   * Runs the scheduler once, processing as many pending tasks as allowed by concurrency.
   * Updates task statuses and logs progress.
   * @returns {Promise<boolean>} True if any batch was processed, false otherwise.
   */
  async runSchedulerOnce(): Promise<boolean> {
    if (!this.queue.length) {
      this.log('No tasks in the queue.');
      return false;
    }

    if (this.hasAllProcessed()) {
      return false;
    }

    const availableSlots = this.getAvailableSlots();

    if (availableSlots <= 0) {
      //this.log('No tasks can be run now due to concurrency limit.');
      return false;
    }

    const tasksToRun = this.queue
      .filter((task) => task.status === 'pending')
      .slice(0, availableSlots);

    await Promise.allSettled(
      tasksToRun.map(async (task) => {
        try {
          task.status = 'running';
          this.log(`[${task.id}] Task started.`);

          if (!this.onProcessTask) {
            throw new Error('No onProcessTask handler defined.');
          }

          const success = await this.onProcessTask(task);

          task.status = success ? 'completed' : 'error';
          task.finishedAt = dayjs();

          this.log(`[${task.id}] Task completed - Status: ${task.status}`);
        } catch (err) {
          task.status = 'error';
          this.log(
            `[${task.id}] Task Error - ${
              err instanceof Error ? err.message : err
            }`,
          );
        }
      }),
    );

    this.saveTasks();
    return true;
  }

  /**
   * Starts the scheduler loop, periodically running batches of tasks according to the interval and concurrency.
   */
  startScheduler(): void {
    this.running = true;
    this.log('Scheduler started.');

    const loop = async () => {
      while (this.running) {
        const batchDone = await this.runSchedulerOnce();

        await new Promise((r) => setTimeout(r, this.schedulerIntervalMs));

        if (batchDone) {
          const delay = this.getTaskInterval();

          if (!delay || delay <= 0) {
            continue;
          }

          this.log(`Waiting ${delay / 1000}s before next batch run...`);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    };

    loop();
  }

  stopScheduler(): void {
    this.running = false;
    this.log('Scheduler stopped.');
  }

  getQueue() {
    return this.queue;
  }

  /**
   * Checks if a task with the given ID exists in the queue.
   * @param {string} id - The task ID to check.
   */
  hasTask(id: string): boolean {
    return this.queue.some((task) => task.id === id);
  }

  getIsRunning(): boolean {
    return this.running;
  }
}

export * from './types';
