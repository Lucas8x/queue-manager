<script setup lang="ts">
import { EllipsisVertical, Pause, Play, RefreshCcw } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useManager } from '@/composables/useManager';

const { restart, pause, resume } = useManager();
</script>

<template>
  <DropdownMenu align="center">
    <DropdownMenuTrigger as-child>
      <Button variant="outline" class="cursor-pointer w-5">
        <EllipsisVertical class="h-5 w-5" />
        <span class="sr-only">Open menu</span>
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent>
      <DropdownMenuItem class="cursor-pointer" @click="restart">
        <RefreshCcw class="h-5 w-5" /> Restart failed tasks
      </DropdownMenuItem>

      <DropdownMenuItem class="cursor-pointer" @click="pause">
        <Pause class="h-5 w-5" /> Pause scheduler
      </DropdownMenuItem>

      <DropdownMenuItem class="cursor-pointer" @click="resume">
        <Play class="h-5 w-5" /> Resume scheduler
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
