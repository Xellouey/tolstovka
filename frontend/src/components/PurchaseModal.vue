<template>
  <AdminModal
    :is-open="props.isOpen"
    title="Оформить заказ"
    :description="props.product?.title || 'Товар'"
    :show-actions="false"
    @close="emit('close')"
  >
    <div class="space-y-6">
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
          <div class="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBagIcon class="w-8 h-8 text-brand-dark" />
          </div>
          <h3 class="font-semibold text-brand-dark mb-2">
            Для оформления заказа:
          </h3>
          <p class="text-sm text-gray-600 leading-relaxed">
            Напишите нашему менеджеру в Telegram или поделитесь ссылкой на товар.
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
            href="https://t.me/dmitriy_mityuk"
            class="inline-flex items-center space-x-2 px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-dark/90 transition-colors font-medium"
            target="_blank"
            rel="noopener"
            @click="onManagerClick"
          >
            <span>@dmitriy_mityuk</span>
            <ArrowTopRightOnSquareIcon class="w-4 h-4" />
          </a>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="space-y-3">
        <!-- Share button (with fallback to copy) -->
        <button
          class="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-brand-dark text-white rounded-xl hover:bg-brand-dark/90 transition-colors font-medium"
          @click="shareOrCopy"
        >
          <PaperAirplaneIcon class="w-5 h-5" />
          <span>Поделиться</span>
        </button>

        <!-- Copy link button -->
        <button
          class="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-brand-dark rounded-xl transition-colors font-medium"
          @click="copyProductLink"
        >
          <ClipboardDocumentIcon class="w-5 h-5" />
          <span>{{ copied ? 'Ссылка скопирована!' : 'Скопировать ссылку на товар' }}</span>
        </button>
        
        <!-- Close button -->
        <button
          class="w-full px-4 py-3 text-gray-600 hover:text-brand-dark transition-colors font-medium"
          @click="emit('close')"
        >
          Закрыть
        </button>
      </div>
    </div>
  </AdminModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import AdminModal from '@/components/AdminModal.vue'
import { useClipboard } from '@vueuse/core'
import {
  ShoppingBagIcon,
  UserIcon,
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentIcon,
  PaperAirplaneIcon
} from '@heroicons/vue/24/outline'

interface Product {
  id: string | number
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

const router = useRouter()

const product = computed(() => props.product)

const productUrl = computed(() => {
  if (!props.product) return ''
  const resolved = router.resolve({ path: `/p/${props.product.id}` })
  const origin = window?.location?.origin || ''
  return origin ? new URL(resolved.href, origin).toString() : resolved.href
})

const { copy, copied, isSupported } = useClipboard()

function formatPrice(price: number): string {
  return `${price.toLocaleString('ru-RU')} ₽`
}

function onManagerClick() {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('medium')
  }
}

async function copyProductLink() {
  if (!productUrl.value) return
  await copy(productUrl.value)
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.notificationOccurred('success')
  }
}

async function shareOrCopy() {
  if (!productUrl.value) return
  try {
    if (navigator.share) {
      await navigator.share({
        title: props.product?.title || 'Ссылка на товар',
        url: productUrl.value,
      })
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success')
      }
      return
    }
  } catch (err: any) {
    // Если пользователь отменил native share — не копируем принудительно
    if (err?.name === 'AbortError') return
  }
  await copyProductLink()
}
</script>
