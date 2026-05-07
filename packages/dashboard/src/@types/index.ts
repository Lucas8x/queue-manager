export type ITaskStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'error'
  | string;

export type ITask = {
  id: string;
  title: string;
  data: {
    category: string;
  };
  status: ITaskStatus;
  scheduledAt: string;
  finishedAt: string | null;
};
