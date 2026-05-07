import { computed } from 'vue';
import type { ITask, ITaskStatus } from '@/@types';
import { STATUS_CONFIG } from '@/constants';
import { useListenSSE } from './useListenSSE';

export function useTasks() {
  const { tasks } = useListenSSE();

  const data = computed(() => {
    const groupedItems: Record<ITaskStatus, ITask[]> = {
      running: [],
      pending: [],
      completed: [],
      error: [],
      unknown: [],
    };

    const uniqueTypes: string[] = [];

    for (const task of tasks.value) {
      if (!task.status || !STATUS_CONFIG[task.status]) {
        task.status = 'unknown';
      }
      if (!groupedItems[task.status]) {
        groupedItems[task.status] = [];
      }
      groupedItems[task.status].push(task);

      //
      const type = task.data.category;
      if (type && !uniqueTypes.includes(type)) {
        uniqueTypes.push(type);
      }
    }

    return { groupedItems, uniqueTypes };
  });

  return data;
}
