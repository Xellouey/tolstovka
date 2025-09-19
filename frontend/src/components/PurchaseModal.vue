<template>
  <Teleport to="body">
    <Transition
      enter-active-class="duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click="onBackdropClick"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

        <!-- Modal -->
        <Transition
          enter-active-class="duration-300 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="duration-200 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="isOpen"
            class="relative bg-white rounded-2xl shadow-xl max-w-sm w-full max-h-[90vh] overflow-hidden"
            @click.stop
          >
            <!-- Header -->
            <div class="relative p-6 text-center border-b border-gray-100">
              <button
                class="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                @click="$emit('close')"
              >
                <XMarkIcon class="w-5 h-5" />
              </button>
              
              <div class="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBagIcon class="w-8 h-8 text-brand-dark" />
              </div>
              
              <h2 class="text-xl font-bold text-brand-dark mb-2">
                Оформить заказ
              </h2>
              <p class="text-sm text-gray-600">
                {{ product?.title || 'Товар' }}
              </p>
            </div>

            <!-- Content -->
            <div class="p-6 space-y-6">
              <!-- Product summary -->
              <div v-if="product" class="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <img
                  :src="product.images?.[0] || `https://placehold.co/60x80/383b3d/ffc81a?text=${encodeURIComponent(product.title || 'Товар')}`"
                  :alt="product.title || 'Товар'"
                  class="w-15 h-20 object-cover rounded-lg"
                />
                <div class="flex-1">
                  <h3 class="font-medium text-brand-dark text-sm">{{ product.title }}</h3>
                  <p class="text-lg font-bold text-brand-dark">{{ formatPrice(product.priceRub) }}</p>
                </div>
              </div>

              <!-- Instructions -->
              <div class="space-y-4">
                <div class="text-center">
                  <h3 class="font-semibold text-brand-dark mb-2">
                    Для оформления заказа:
                  </h3>
                  <p class="text-sm text-gray-600 leading-relaxed">
                    Напишите нашему менеджеру в Telegram. Мы ответим быстро и поможем с оформлением заказа.
                  </p>
                </div>

                <!-- Manager contact -->
                <div class="bg-brand-primary/20 rounded-xl p-4 text-center">
                  <div class="flex items-center justify-center space-x-2 mb-3">
                    <div class="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center">
                      <UserIcon class="w-4 h-4 text-brand-dark" />
                    </div>
                    <span class="font-medium text-brand-dark">Менеджер</span>
                  </div>
                  
                  <a
                    :href="managerTelegramUrl"
                    class="inline-flex items-center space-x-2 px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-dark/90 transition-colors font-medium"
                    @click="onManagerClick"
                  >
                    <span>@dmitriy_mityuk</span>
                    <ArrowTopRightOnSquareIcon class="w-4 h-4" />
                  </a>
                </div>
              </div>
              
              <!-- Actions -->
              <div class="space-y-3">
                <!-- Copy link button -->
                <button
                  class="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-brand-dark rounded-xl transition-colors font-medium"
                  @click="copyProductLink"
                >
                  <ClipboardDocumentIcon class="w-5 h-5" />
                  <span>{{ linkCopied ? 'Ссылка скопирована!' : 'Скопировать ссылку на товар' }}</span>
                </button>
                
                <!-- Close button -->
                <button
                  class="w-full px-4 py-3 text-gray-600 hover:text-brand-dark transition-colors font-medium"
                  @click="$emit('close')"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  XMarkIcon,
  ShoppingBagIcon,
  UserIcon,
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentIcon
} from '@heroicons/vue/24/outline'

interface Product {
  id: string
  title?: string
  priceRub: number
  images?: string[]
}

interface Props {
  isOpen: boolean
  product: Product | null
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const linkCopied = ref(false)

const managerTelegramUrl = computed(() => {
  return 'https://t.me/dmitriy_mityuk'
})

const productUrl = computed(() => {
  if (!props.product) return ''
  return `${window.location.origin}/p/${props.product.id}`
})

function formatPrice(price: number): string {
  return `${price.toLocaleString('ru-RU')} ₽`
}

function onBackdropClick() {
  emit('close')
}

function onManagerClick() {
  // Trigger haptic feedback if in Telegram
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('medium')
  }
}

async function copyProductLink() {
  try {
    await navigator.clipboard.writeText(productUrl.value)
    linkCopied.value = true
    
    // Show haptic feedback
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success')
    }
    
    // Reset after 2 seconds
    setTimeout(() => {
      linkCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy link:', err)
    
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea')
      textArea.value = productUrl.value
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      
      linkCopied.value = true
      setTimeout(() => {
        linkCopied.value = false
      }, 2000)
    } catch (fallbackErr) {
      console.error('Fallback copy failed:', fallbackErr)
    }
  }
}
</script>