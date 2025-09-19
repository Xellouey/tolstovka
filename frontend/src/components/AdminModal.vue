<template>
  <TransitionRoot :show="isOpen" as="template">
    <Dialog @close="handleClose">
      <!-- Backdrop -->
      <TransitionChild
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30 z-40" aria-hidden="true" />
      </TransitionChild>

      <!-- Dialog Panel -->
      <div class="fixed inset-0 flex items-center justify-center p-4 z-50">
        <TransitionChild
          enter="duration-300 ease-out"
          enter-from="opacity-0 scale-95"
          enter-to="opacity-100 scale-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100 scale-100"
          leave-to="opacity-0 scale-95"
        >
          <DialogPanel :class="panelClasses">
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
              <DialogTitle class="text-xl font-semibold text-gray-900">
                {{ title }}
              </DialogTitle>
              
              <button
                v-if="showCloseButton"
                @click="handleClose"
                class="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Закрыть"
              >
                <XMarkIcon class="w-6 h-6" />
              </button>
            </div>

            <!-- Description -->
            <DialogDescription
              v-if="description"
              class="mb-6 text-gray-600"
            >
              {{ description }}
            </DialogDescription>
            
            <!-- Content Slot -->
            <div class="mb-6">
              <slot />
            </div>
            
            <!-- Actions -->
            <div v-if="showActions" class="flex justify-end space-x-3">
              <button
                v-if="showCancelButton"
                @click="handleCancel"
                :disabled="isLoading"
                class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
              >
                {{ cancelText }}
              </button>
              <button
                v-if="showConfirmButton"
                @click="handleConfirm"
                :disabled="isLoading || isConfirmDisabled"
                :class="confirmButtonClasses"
              >
                <span v-if="isLoading" class="inline-flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ loadingText }}
                </span>
                <span v-else>{{ confirmText }}</span>
              </button>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogDescription,
  TransitionRoot,
  TransitionChild,
} from '@headlessui/vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

interface Props {
  isOpen: boolean
  title: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  showCloseButton?: boolean
  showActions?: boolean
  showCancelButton?: boolean
  showConfirmButton?: boolean
  cancelText?: string
  confirmText?: string
  loadingText?: string
  isLoading?: boolean
  isConfirmDisabled?: boolean
  confirmVariant?: 'primary' | 'danger' | 'success'
  persistent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showCloseButton: true,
  showActions: true,
  showCancelButton: true,
  showConfirmButton: true,
  cancelText: 'Отмена',
  confirmText: 'Подтвердить',
  loadingText: 'Загрузка...',
  isLoading: false,
  isConfirmDisabled: false,
  confirmVariant: 'primary',
  persistent: false
})

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  close: []
  cancel: []
  confirm: []
}>()

const panelClasses = computed(() => {
  const baseClasses = 'w-full bg-white rounded-xl shadow-lg p-6'
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  }
  
  return `${baseClasses} ${sizeClasses[props.size]}`
})

const confirmButtonClasses = computed(() => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-brand-dark text-white hover:bg-brand-dark/90',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700'
  }
  
  return `${baseClasses} ${variantClasses[props.confirmVariant]}`
})

function handleClose() {
  if (props.persistent && props.isLoading) {
    return
  }
  
  emit('update:isOpen', false)
  emit('close')
}

function handleCancel() {
  if (props.isLoading) {
    return
  }
  
  emit('update:isOpen', false)
  emit('cancel')
}

function handleConfirm() {
  if (props.isLoading || props.isConfirmDisabled) {
    return
  }
  
  emit('confirm')
}
</script>