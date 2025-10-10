<script setup lang="ts">
import SchedulerStatus from '@/components/SchedulerStatus.vue';
import ThemeSwitch from '@/components/ThemeSwitch.vue';
import ThreeDotsMenu from '@/components/ThreeDotsMenu.vue';
</script>

<template>
  <div className="flex mb-4 items-center justify-between">
    <h1 className="text-3xl font-bold tracking-tight">Queue Viewer</h1>

    <div class="flex gap-2 items-center">
      <ThemeSwitch />
      <ThreeDotsMenu />
    </div>
  </div>

  <SchedulerStatus />
</template>
