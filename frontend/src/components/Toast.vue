<template>
  <Transition name="toast">
    <div
      v-if="visible"
      class="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md border-2"
      :class="toastClasses"
    >
      <!-- Icon -->
      <div class="flex-shrink-0">
        <CheckCircleIcon v-if="type === 'success'" class="w-6 h-6" />
        <XCircleIcon v-if="type === 'error'" class="w-6 h-6" />
        <InformationCircleIcon v-if="type === 'info'" class="w-6 h-6" />
      </div>
      
      <!-- Message -->
      <div class="font-primary font-bold text-sm tracking-wide">
        {{ message }}
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/vue/24/solid'

interface Props {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  show?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'success',
  duration: 2000,
  show: false
})

const emit = defineEmits<{
  (e: 'hidden'): void
}>()

const visible = ref(false)
let timeout: ReturnType<typeof setTimeout> | null = null

const toastClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-500/95 text-white border-green-400'
    case 'error':
      return 'bg-red-500/95 text-white border-red-400'
    case 'info':
      return 'bg-blue-500/95 text-white border-blue-400'
    default:
      return 'bg-gray-800/95 text-white border-gray-700'
  }
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    visible.value = true
    
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      visible.value = false
      setTimeout(() => {
        emit('hidden')
      }, 300) // Wait for animation to complete
    }, props.duration)
  }
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, -30px) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px) scale(0.95);
}
</style>
