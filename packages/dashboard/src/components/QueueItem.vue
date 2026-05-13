<script setup lang="ts">
import { AlarmClock, Calendar } from 'lucide-vue-next';
import type { ITask } from '@/@types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { STATUS_CONFIG } from '@/constants';
import { dayjs } from '@/utils/dayjs';

const props = defineProps<{
  task: ITask;
  click: () => void;
}>();

const StatusIcon = STATUS_CONFIG[props.task.status].icon;
</script>

<template>
  <Card
    class="rounded-lg border bg-card text-card-foreground shadow-2xs hover:shadow-md transition-shadow gap-2 mx-2 cursor-pointer"
    @click="click"
  >
    <CardHeader class="flex flex-col px-6">
      <div class="flex items-center justify-between w-full">
        <CardTitle
          class="font-semibold tracking-tight text-lg overflow-hidden whitespace-nowrap text-ellipsis hover:cursor-pointer"
        >
          {{ props.task.id }}
        </CardTitle>

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
        <span
          >{{ dayjs.utc(props.task.finishedAt || props.task.scheduledAt).local().format('DD/MM') }}</span
        >

        <AlarmClock class="ml-1 h-3 w-3" />
        <span
          >{{ dayjs.utc(props.task.finishedAt || props.task.scheduledAt).local().format('HH:mm') }}</span
        >
      </div>
    </CardContent>
  </Card>
</template>
