import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { ref } from 'vue';
import type { ITask } from '@/@types';
import { API_BASE_URL } from '@/constants/api';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

type SSEData = {
  queue: ITask[];
  nextRun: string | null;
};

export function useListenSSE() {
  const tasks = ref<ITask[]>([]);
  const nextRun = ref<string | null>(null);

  const source = new EventSource(new URL('events', API_BASE_URL));

  source.onopen = () => {
    console.log('SSE connection opened');
  };

  source.onerror = (err) => {
    console.error('SSE error:', err);
  };

  source.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as SSEData;

      if (data?.queue && Array.isArray(data.queue)) {
        tasks.value = data.queue;
      }

      if (
        data?.nextRun &&
        typeof data.nextRun === 'string' &&
        dayjs.utc(data.nextRun).isUTC()
      ) {
        const future = dayjs.utc(data.nextRun);

        if (!future.isValid()) {
          throw new Error('NextRun date is not valid UTC.');
        }

        const now = dayjs.utc();

        /* const diff = future.diff(now, 'second');

        if (diff < 0) {
          nextRun.value = '';
          return;
        } */

        nextRun.value = now.to(future);
      }
    } catch (err) {
      console.error('SSE JSON parse error:', err);
    }
  };

  return { tasks, nextRun };
}
