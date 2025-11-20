<template>
  <AdminModal
    :is-open="props.isOpen"
    title=""
    :show-actions="false"
    @close="emit('close')"
  >
    <template #title>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center shadow-sm">
          <ShoppingBagIcon class="w-5 h-5 text-brand-dark" />
        </div>
        <span class="sr-only">Оформление заказа</span>
      </div>
    </template>

    <div class="space-y-3">
      <!-- Product summary -->
      <div v-if="product" class="flex items-center space-x-3 p-2.5 bg-gray-50 rounded-lg">
        <img
          :src="product.images?.[0] || `https://placehold.co/45x55/383b3d/ffc81a?text=${encodeURIComponent(productDisplayTitle)}`"
          :alt="productDisplayTitle"
          class="w-11 h-14 object-cover rounded-md"
        />
        <div class="flex-1">
          <h3 class="font-display text-sm font-normal text-brand-dark leading-tight">{{ productDisplayTitle }}</h3>
          <p class="font-primary text-base font-bold text-brand-primary mt-0.5 tabular-nums">{{ formatPrice(product.priceRub) }}</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="space-y-3 flex flex-col items-center">
        <!-- Main order button - ОСНОВНАЯ КНОПКА ДЛЯ ЗАКАЗА -->
        <a
          :href="managerLinkWithMessage"
          class="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-brand-primary text-brand-dark rounded-xl font-primary font-semibold text-base tracking-wide shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 no-underline"
          target="_blank"
          rel="noopener"
          @click="onOrderClick"
        >
          <ShoppingBagIcon class="w-5 h-5" />
          <span>Оформить заказ</span>
        </a>
      </div>
    </div>
  </AdminModal>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminModal from '@/components/AdminModal.vue'
import { useSettingsStore } from '@/stores/settings'
import {
  ShoppingBagIcon
} from '@heroicons/vue/24/outline'

interface Product {
  id: string | number
  title?: string
  priceRub: number
  images?: string[]
  size?: string | null
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
const settingsStore = useSettingsStore()

const product = computed(() => props.product)

const productDisplayTitle = computed(() => {
  if (!props.product) return 'Товар'
  const base = (props.product.title || 'Товар').trim()
  const size = props.product.size?.toUpperCase()
  if (!size) return base
  return base.toUpperCase().includes(size) ? base : `${base} ${size}`.trim()
})

const productUrl = computed(() => {
  if (!props.product) return ''
  const resolved = router.resolve({ path: `/p/${props.product.id}` })
  const origin = window?.location?.origin || ''
  return origin ? new URL(resolved.href, origin).toString() : resolved.href
})

const orderMessage = computed(() => {
  if (!props.product) return ''
  const title = productDisplayTitle.value || 'Товар'
  const price = formatPrice(props.product.priceRub)
  const url = productUrl.value
  
  return `Хочу купить: ${title}\nЦена: ${price}\nСсылка: ${url}`
})

const managerLinkWithMessage = computed(() => {
  const encodedMessage = encodeURIComponent(orderMessage.value)
  const telegram = settingsStore.settings.manager_telegram
  return `https://t.me/${telegram}?text=${encodedMessage}`
})


function formatPrice(price: number): string {
  return `${price.toLocaleString('ru-RU')} ₽`
}

function onOrderClick() {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('medium')
    // Пытаемся открыть через Telegram Web App API, если доступно
    if (window.Telegram.WebApp.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(managerLinkWithMessage.value)
      return
    }
  }
  // Обычное открытие ссылки как fallback
}

// Крутые эффекты для кнопки закрытия
// Загружаем настройки при монтировании компонента
onMounted(() => {
  settingsStore.fetchSettings()
})


</script>
