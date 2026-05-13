<script setup lang="ts">
import { RefreshCcw } from 'lucide-vue-next';
import type { ITask } from '@/@types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { restartTasksByIDs } from '@/composables/useManager';
import { dayjs } from '@/utils/dayjs';
import Button from './ui/button/Button.vue';

const open = defineModel<boolean>('open');

const props = defineProps<{ task?: ITask }>();

function handleRestart() {
  if (props.task?.id) {
    restartTasksByIDs([props.task.id]);
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>ID: {{ task?.id }}</DialogTitle>
        <DialogDescription> Status: {{ task?.status }} </DialogDescription>
        <div class="flex gap-2">
          <Button
            variant="outline"
            @click="handleRestart"
            :disabled="task?.status === 'pending'"
          >
            <RefreshCcw />
            Restart</Button
          >
          <!-- <Button variant="outline">stop</Button> -->
        </div>
      </DialogHeader>

      <pre class="bg-neutral-100 dark:bg-neutral-800 rounded p-2">{{
        JSON.stringify(task?.data, null, 2)
      }}</pre>

      <div class="flex flex-col gap-1">
        <span class="text-muted-foreground text-sm"
          >Scheduled at:
          {{ task?.scheduledAt ? dayjs.utc(task.scheduledAt).local() : '---' }}</span
        >
        <span class="text-muted-foreground text-sm inline-block"
          >Finished at: &nbsp;&nbsp;
          {{ task?.finishedAt ? dayjs.utc(task.finishedAt).local() : '---' }}</span
        >
      </div>
    </DialogContent>
  </Dialog>
</template>
