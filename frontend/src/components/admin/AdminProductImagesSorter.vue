<template>
  <div class="flex flex-wrap gap-3">
    <draggable
      v-model="localImages"
      handle=".handle"
      ghost-class="opacity-50 bg-gray-50"
      :animation="150"
      :delay-on-touch-only="true"
      :delay="120"
      @end="onEnd"
    >
      <template #item="{ element: url, index }">
        <div class="relative w-20 h-20 rounded-lg border border-gray-200 overflow-hidden bg-white">
          <!-- Drag handle -->
          <button
            class="handle absolute top-1 left-1 p-1 bg-white/80 rounded cursor-move text-gray-500 hover:text-gray-700"
            title="Перетащить"
          >
            <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M3 7h14M3 10h14M3 13h14"/></svg>
          </button>

          <!-- Remove button (optional) -->
          <button
            v-if="!disabled"
            class="absolute top-1 right-1 p-1 bg-white/80 rounded text-gray-500 hover:text-red-600"
            title="Удалить"
            @click="$emit('remove', index)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <img :src="url" alt="" class="w-full h-full object-cover" @error="onImgError" />
        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'

const props = withDefaults(defineProps<{
  modelValue: string[]
  disabled?: boolean
}>(), { disabled: false })

const emit = defineEmits<{
  (e: 'update:modelValue', v: string[]): void
  (e: 'reorder', v: string[]): void
  (e: 'remove', index: number): void
}>()

const localImages = ref<string[]>([])

watch(
  () => props.modelValue,
  (v) => { localImages.value = Array.isArray(v) ? [...v] : [] },
  { immediate: true }
)

function onEnd() {
  // Сигнализируем о новом порядке согласно рекомендациям vue.draggable.next
  emit('update:modelValue', localImages.value)
  emit('reorder', localImages.value)
}

function onImgError(e: Event) {
  (e.target as HTMLImageElement).src = 'https://placehold.co/80x80/f3f4f6/9ca3af?text=Error'
}
</script>