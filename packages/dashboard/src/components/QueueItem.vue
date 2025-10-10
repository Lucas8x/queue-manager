<script setup lang="ts">
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { AlarmClock, Calendar } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import type { ITask } from '@/@types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { STATUS_CONFIG } from '@/constants';

dayjs.extend(utc);

const props = defineProps<{
  task: ITask;
}>();

const StatusIcon = STATUS_CONFIG[props.task.status].icon;

function handleCopy() {
  navigator.clipboard.writeText(props.task.id);
  toast('Task ID copied to clipboard!');
}
</script>

<template>
  <Card
    class="rounded-lg border bg-card text-card-foreground shadow-2xs hover:shadow-md transition-shadow gap-2"
  >
    <CardHeader class="flex flex-col px-6">
      <div class="flex items-center justify-between w-full">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger class="max-w-full">
              <CardTitle
                class="font-semibold tracking-tight text-lg overflow-hidden whitespace-nowrap text-ellipsis hover:cursor-pointer"
                @click="handleCopy"
              >
                {{ props.task.id }}
              </CardTitle>
            </TooltipTrigger>

            <TooltipContent>
              <p>Click to copy</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <!-- <component
          :is="StatusIcon"
          class="h-5 w-5"
          :class="[
            STATUS_CONFIG[props.task.status].iconColor,
            props.task.status === 'processing' ? 'animate-spin' : '',
          ]"
        /> -->
      </div>
    </CardHeader>

    <CardContent>
      <div class="flex items-center gap-1 text-sm text-muted-foreground">
        <Calendar class="h-3 w-3" />
        <span>{{
          dayjs.utc(props.task.finishedAt || props.task.scheduledAt).local().format('DD/MM')
        }}</span>

        <AlarmClock class="ml-1 h-3 w-3" />
        <span>{{
          dayjs.utc(props.task.finishedAt || props.task.scheduledAt).local().format('HH:mm')
        }}</span>
      </div>
    </CardContent>
  </Card>
</template>
