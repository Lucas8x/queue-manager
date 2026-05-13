import { computed } from 'vue';
import type { ITask, ITaskStatus } from '@/@types';
import { STATUS_CONFIG } from '@/constants';
import { useListenSSE } from './useListenSSE';

export function useTasks() {
  const { tasks } = useListenSSE();

  const data = computed(() => {
    const groupedTasks: Record<ITaskStatus, ITask[]> = {
      running: [],
      pending: [],
      completed: [],
      error: [],
      unknown: [],
    };

    const uniqueTypes: string[] = [];

    for (const task of tasks.value) {
      if (!(task.status && STATUS_CONFIG[task.status])) {
        task.status = 'unknown';
      }
      if (!groupedTasks[task.status]) {
        groupedTasks[task.status] = [];
      }
      groupedTasks[task.status].push(task);

      // Task Categorization
      const type = task.data.category;
      if (type && !uniqueTypes.includes(type)) {
        uniqueTypes.push(type);
      }
    }

    return { groupedTasks, uniqueTypes };
  });

  return data;
}
