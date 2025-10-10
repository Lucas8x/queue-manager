import { toast } from 'vue-sonner';
import { api } from '@/constants/api';

export function useManager() {
  async function restart() {
    try {
      const { response } = await api.tasks['restart-failed'].post();

      if (!response.ok) {
        toast.error('Error on restart failed tasks.');
        return;
      }

      toast.success('Failed tasks restarted successfully!');
    } catch (error) {
      toast.error('Network error. Please verify the server is running.');
      console.error(error);
    }
  }

  async function pause() {
    try {
      const { response } = await api.tasks.pause.post();

      if (!response.ok) {
        toast.error('Error on pause tasks.');
        return;
      }

      toast.success('Scheduler paused successfully!');
    } catch (error) {
      toast.error('Network error. Please verify the server is running.');
      console.error(error);
    }
  }

  async function resume() {
    try {
      const { response } = await api.tasks.resume.post();

      if (!response.ok) {
        toast.error('Error on resume tasks.');
        return;
      }
      toast.success('Scheduler resumed successfully!');
    } catch (error) {
      toast.error('Network error. Please verify the server is running.');
      console.error(error);
    }
  }

  return {
    restart,
    pause,
    resume,
  };
}
