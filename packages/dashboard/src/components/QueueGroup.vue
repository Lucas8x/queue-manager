<script setup lang="ts">
import { ChevronsDownUp, ChevronsUpDown } from 'lucide-vue-next';
import { ref } from 'vue';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { STATUS_CONFIG } from '@/constants';

const props = defineProps<{
  icon: typeof ChevronsUpDown;
  iconColor: string;
  label: string;
  length: number;
  spinAnimation?: boolean;
}>();

const isOpen = ref(true);
</script>

<template>
  <Collapsible v-model:open="isOpen">
    <div class="flex items-center gap-3 mb-4 border-b pb-2">
      <component
        :is="icon"
        :class="['h-5 w-5', iconColor, spinAnimation ? 'animate-spin' : '']"
      />

      <h2 class="text-xl font-semibold capitalize">{{ label }}</h2>

      <Badge variant="secondary" class="ml-auto">
        {{ props.length }}
      </Badge>

      <CollapsibleTrigger class="ml-1 hover:cursor-pointer" as-child>
        <ChevronsUpDown v-if="isOpen" />
        <ChevronsDownUp v-else />
      </CollapsibleTrigger>
    </div>

    <CollapsibleContent>
      <slot></slot>
    </CollapsibleContent>
  </Collapsible>
</template>
