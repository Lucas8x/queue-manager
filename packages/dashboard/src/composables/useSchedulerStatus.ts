import { onMounted, onUnmounted, ref } from 'vue';
import { api } from '@/constants/api';

let intervalId: ReturnType<typeof setInterval>;

export function useSchedulerStatus() {
  const status = ref<'running' | 'paused' | 'offline'>('offline');

  async function checkSchedulerStatus() {
    try {
      const { data, response } = await api.health.get();

      if (!response.ok) {
        status.value = 'offline';
        throw new Error('Invalid server status response');
      }

      status.value = data === true ? 'running' : 'paused';
    } catch (error) {
      status.value = 'offline';
    }
  }

  onMounted(() => {
    checkSchedulerStatus();
    intervalId = setInterval(checkSchedulerStatus, 1000);
  });

  onUnmounted(() => {
    clearInterval(intervalId);
  });

  return status;
}
