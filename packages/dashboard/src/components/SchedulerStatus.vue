<script setup lang="ts">
import { useListenSSE } from '@/composables/useListenSSE';
import { useSchedulerStatus } from '@/composables/useSchedulerStatus';

const schedulerStatus = useSchedulerStatus();
const { nextRun } = useListenSSE();
</script>

<template>
  <div class="space-y-1 mb-6">
    <div class="flex items-center gap-2">
      <span class="text-sm text-muted-foreground"
        >Scheduler Status:
        <span class="capitalize">{{ schedulerStatus }}</span></span
      >

      <span class="relative flex size-3">
        <span
          class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
          :class="{
            'bg-green-400': schedulerStatus === 'running',
            'bg-yellow-400': schedulerStatus === 'paused',
            'bg-red-400': schedulerStatus === 'offline',
          }"
        />
        <span
          class="relative inline-flex size-3 rounded-full"
          :class="{
            'bg-green-400': schedulerStatus === 'running',
            'bg-yellow-400': schedulerStatus === 'paused',
            'bg-red-400': schedulerStatus === 'offline',
          }"
        />
      </span>
    </div>
    <span class="text-sm text-muted-foreground"
      >Next batch {{ nextRun || 'in undetermined time' }}.</span
    >
  </div>
</template>
