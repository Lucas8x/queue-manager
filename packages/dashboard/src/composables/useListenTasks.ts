import { ref } from 'vue';
import type { ITask } from '@/@types';
import { API_BASE_URL } from '@/constants/api';

export function useListenTasks() {
  const tasks = ref<ITask[]>([]);

  const source = new EventSource(new URL('events', API_BASE_URL));

  source.onopen = () => {
    console.log('SSE connection opened');
  };

  source.onerror = (err) => {
    console.error('SSE error:', err);
  };

  source.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (Array.isArray(data)) {
        tasks.value = data;
      }
    } catch (err) {
      console.error('SSE JSON parse error:', err);
    }
  };

  return { tasks };
}
