import { toast } from 'vue-sonner';
import { api } from '@/constants/api';

export async function restartFailedTasks() {
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

export async function restartTaskByCategory(category: string) {
  try {
    const { response } = await api.tasks['restart-by-category'].post({
      category,
    });

    if (!response.ok) {
      toast.error(`Error on restart failed >${category}< tasks.`);
      return;
    }

    toast.success(`Successfully restarted >${category}< failed tasks.`);
  } catch (error) {
    toast.error('Network error. Please verify the server is running.');
    console.error(error);
  }
}

/* export async function restartTasksByIDs(ids: string[]) {
  try {
    if (!Array.isArray(ids)) {
      return;
    }

    if (!ids || ids.length === 0) {
      toast.error('No task selected for restart.');
      return;
    }

    if (!ids.every((id) => typeof id === 'string' && id.trim() !== '')) {
      toast.error('Invalid task IDs for restart.');
      return;
    }

    const { response } = await api.tasks['restart-by-id'].post({
      ids,
    });

    if (!response.ok) {
      toast.error('Error on restart tasks.');
      return;
    }

    toast.success('Successfully restarted tasks!');
  } catch (error) {
    toast.error('Network error. Please verify the server is running.');
    console.error(error);
  }
} */

export async function pauseScheduler() {
  try {
    const { response } = await api.scheduler.patch({
      state: 'paused',
    });

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

export async function resumeScheduler() {
  try {
    const { response } = await api.scheduler.patch({
      state: 'running',
    });

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
