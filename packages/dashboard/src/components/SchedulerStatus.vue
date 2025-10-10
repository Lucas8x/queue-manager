<script setup lang="ts">
import { useSchedulerStatus } from '@/composables/useSchedulerStatus';

const schedulerStatus = useSchedulerStatus();
</script>

<template>
  <div class="flex items-center gap-2 mb-6">
    <span class="text-sm text-muted-foreground"
      >Scheduler Status:
      <span class="capitalize">{{ schedulerStatus }}</span></span
    >

    <span class="relative flex size-3">
      <span
        class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
        :class="{
          'bg-green-400': schedulerStatus === 'running',
          'bg-red-400': schedulerStatus !== 'running',
        }"
      />
      <span
        class="relative inline-flex size-3 rounded-full"
        :class="{
          'bg-green-400': schedulerStatus === 'running',
          'bg-red-400': schedulerStatus !== 'running',
        }"
      />
    </span>
  </div>
</template>
