<script setup lang="ts">
import { computed } from 'vue';
import 'vue-sonner/style.css';
import MainHeader from '@/components/MainHeader.vue';
import QueueGroup from '@/components/QueueGroup.vue';
import QueueItem from '@/components/QueueItem.vue';
import { Toaster } from '@/components/ui/sonner';
import { useListenTasks } from '@/composables/useListenTasks';
import { STATUS_CONFIG } from '@/constants';
import type { ITask, ITaskStatus } from './@types';

const { tasks } = useListenTasks();

const groupedItems = computed(() => {
  const group: Record<ITaskStatus, ITask[]> = {
    running: [],
    pending: [],
    completed: [],
    error: [],
    unknown: [],
  };

  if (!tasks.value.length) {
    return group;
  }

  tasks.value.forEach((item) => {
    if (!item.status || !STATUS_CONFIG[item.status]) {
      item.status = 'unknown';
    }
    if (!group[item.status]) {
      group[item.status] = [];
    }
    group[item.status].push(item);
  });

  return group;
});
</script>

<template>
  <Toaster />

  <div class="p-6 max-w-7xl mx-auto">
    <MainHeader />

    <div class="space-y-6">
      <div v-for="(config, status) in STATUS_CONFIG" :key="status">
        <QueueGroup
          :icon="config.icon"
          :icon-color="config.iconColor"
          :label="config.label"
          :length="groupedItems[status].length"
          :spin-animation="status === 'running'"
        >
          <div
            v-if="groupedItems[status].length"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            <QueueItem
              v-for="item in groupedItems[status]"
              :key="item.id"
              :task="item"
            />
          </div>

          <div v-else class="text-center py-8 text-muted-foreground">
            <component
              :is="config.icon"
              class="h-12 w-12 mx-auto mb-2 opacity-50"
            />
            <p>No {{ status }} tasks</p>
          </div>
        </QueueGroup>
      </div>
    </div>
  </div>
</template>
