<script setup lang="ts">
import 'vue-sonner/style.css';
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import { computed, ref } from 'vue';
import MainHeader from '@/components/MainHeader.vue';
import QueueGroup from '@/components/QueueGroup.vue';
import QueueItem from '@/components/QueueItem.vue';
import { Toaster } from '@/components/ui/sonner';
import { STATUS_CONFIG } from '@/constants';
import TaskModal from './components/TaskModal.vue';
import { useColumnsSize } from './composables/useColumnsSize';
import { useListenSSE } from './composables/useListenSSE';
import { useTasks } from './composables/useTasks';

const tasks = useTasks();
const { tasks: rawTasks } = useListenSSE();
const { columns } = useColumnsSize();

const modalTaskID = ref('');

const modalData = computed(() =>
  rawTasks.value.find((task) => task.id === modalTaskID.value)
);
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
          :length="tasks.groupedTasks[status].length"
          :spin-animation="
            status === 'running' && tasks.groupedTasks[status].length > 0
          "
        >
          <div v-if="tasks.groupedTasks[status].length">
            <RecycleScroller
              :items="tasks.groupedTasks[status]"
              key-field="id"
              :grid-items="columns"
              :item-size="106 + 16"
              :item-secondary-size="306"
              page-mode
              v-slot="{ item }"
            >
              <QueueItem
                :key="item.id"
                :task="item"
                :click="() => (modalTaskID = item.id)"
              />
            </RecycleScroller>
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

  <div class="absolute top-0">
    <TaskModal
      :open="!!modalTaskID"
      :task="modalData"
      @update:open="() => (modalTaskID = '')"
    />
  </div>
</template>
