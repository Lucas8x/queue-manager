<script setup lang="ts">
import { EllipsisVertical, Pause, Play, RefreshCcw } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  pauseScheduler,
  restartFailedTasks,
  restartTaskByCategory,
  resumeScheduler,
} from '@/composables/useManager';
import { useTasks } from '@/composables/useTasks';

const tasks = useTasks();
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
      <DropdownMenuItem class="cursor-pointer" @click="restartFailedTasks">
        <RefreshCcw class="size-4" />
        Restart failed tasks
      </DropdownMenuItem>

      <DropdownMenuGroup>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger
            :class="{
              'cursor-not-allowed opacity-50': tasks.uniqueTypes.length === 0
            }"
            :disabled=" tasks.uniqueTypes.length === 0"
          >
            <RefreshCcw class="size-4 mr-1 text-muted-foreground" />
            Restart by type
          </DropdownMenuSubTrigger>

          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                class="cursor-pointer capitalize"
                v-for="value in tasks.uniqueTypes"
                :key="value"
                @click="() => restartTaskByCategory(value)"
              >
                {{ value }}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuGroup>

      <DropdownMenuItem class="cursor-pointer" @click="pauseScheduler">
        <Pause class="h-5 w-5" />
        Pause scheduler
      </DropdownMenuItem>

      <DropdownMenuItem class="cursor-pointer" @click="resumeScheduler">
        <Play class="h-5 w-5" />
        Resume scheduler
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
