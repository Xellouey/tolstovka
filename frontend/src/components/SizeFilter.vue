<template>
  <div v-if="sizes.length" ref="root" class="relative inline-block mb-4 w-full sm:w-auto">
    <button
      class="w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors duration-200"
      :class="{ 'border-brand-primary text-brand-dark bg-brand-primary/10': isOpen || activeSize }"
      type="button"
      :disabled="disabled"
      @click="toggle"
    >
      <span class="uppercase tracking-wide">Размеры</span>
      <span v-if="activeSize" class="text-xs uppercase tracking-wide text-gray-500 hidden sm:inline">{{ activeSize }}</span>
      <ChevronDownIcon class="h-4 w-4 text-gray-500 transition-transform ml-auto sm:ml-0" :class="{ 'rotate-180': isOpen }" />
    </button>

    <Transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 right-0 sm:left-0 z-20 mt-2 w-full sm:w-56 rounded-xl border border-gray-200 bg-white shadow-lg"
      >
        <div class="border-b border-gray-100 px-4 py-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">{{ presetLabel }}</p>
        </div>
        <div class="max-h-64 overflow-y-auto py-2">
          <button
            class="flex w-full items-center justify-between px-4 py-2 text-sm text-left transition-colors"
            :class="activeSize ? 'text-gray-600 hover:bg-gray-50' : 'bg-brand-primary/10 text-brand-dark font-medium'"
            type="button"
            @click="handleSelect(null)"
          >
            <span>Все размеры</span>
            <span v-if="!activeSize" class="text-xs uppercase tracking-wide text-brand-dark">активно</span>
          </button>
          <div class="mt-2 space-y-1 px-2">
            <button
              v-for="size in sizes"
              :key="size"
              class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm uppercase tracking-wide transition-colors"
              :class="size === activeSize ? 'bg-brand-primary/10 text-brand-dark font-semibold' : 'text-gray-600 hover:bg-gray-50'"
              type="button"
              @click="handleSelect(size)"
            >
              {{ size }}
              <svg
                v-if="size === activeSize"
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 text-brand-dark"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'

interface Props {
  sizes: string[]
  activeSize?: string | null
  disabled?: boolean
  presetLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  sizes: () => [],
  activeSize: null,
  disabled: false,
  presetLabel: 'Размеры'
})

const emit = defineEmits<{
  (e: 'change', size: string | null): void
}>()

const root = ref<HTMLElement | null>(null)
const isOpen = ref(false)

function handleSelect(size: string | null) {
  if (props.disabled) return
  emit('change', size)
  isOpen.value = false
}

function toggle() {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

function handleClickOutside(event: MouseEvent) {
  if (root.value && !root.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

watch(() => props.disabled, (newVal) => {
  if (newVal) isOpen.value = false
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Оптимизация для сенсорных устройств */
@media (hover: none) and (pointer: coarse) {
  button {
    padding: 0.75rem;
  }
}
</style>
