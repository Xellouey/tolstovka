<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <div class="bg-white shadow-sm px-4 py-3 flex items-center gap-3">
      <button 
        @click="$router.back()"
        class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-semibold uppercase tracking-wide text-brand-dark hover:bg-gray-50 transition-all"
        aria-label="Назад"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span>назад</span>
      </button>
      <h1 class="text-lg font-semibold font-primary text-brand-dark">Корзина</h1>
      <div class="flex-1"></div>
      <button 
        v-if="cartItems.length > 0"
        @click="clearCart" 
        class="px-4 py-2 bg-brand-primary text-brand-dark rounded-xl font-primary font-bold text-xs uppercase tracking-wide shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
      >
        Очистить
      </button>
    </div>

    <!-- Empty Cart -->
    <div v-if="cartItems.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
      <div class="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
        <ShoppingCartIcon class="w-10 h-10 text-gray-400" />
      </div>
      <h2 class="text-xl font-semibold text-brand-dark mb-2 font-primary">Корзина пуста</h2>
      <p class="text-gray-600 mb-6 font-primary">Добавьте товары, чтобы начать покупки</p>
      <router-link 
        to="/"
        class="px-6 py-3 bg-brand-primary text-brand-dark rounded-lg hover:bg-brand-primary/90 transition-colors font-primary font-semibold"
      >
        К покупкам
      </router-link>
    </div>

    <!-- Cart Items -->
    <div v-else class="p-4 pb-32">
      <div class="space-y-4">
        <div 
          v-for="item in cartItems" 
          :key="item.product.id"
          class="bg-white rounded-lg p-4 shadow-sm"
        >
          <div class="flex space-x-3">
            <!-- Product Image -->
            <div class="w-16 h-16 flex-shrink-0">
              <img 
                :src="item.product.images[0] || `https://placehold.co/100x100/e5e7eb/6b7280?text=${encodeURIComponent(formatProductTitle(item.product))}`"
                :alt="formatProductTitle(item.product)"
                class="w-full h-full object-cover rounded-lg bg-gray-100"
                @error="handleImageError"
              />
            </div>

            <!-- Product Info -->
            <div class="flex-1 min-w-0">
              <h3 
                class="font-medium text-gray-900 cursor-pointer hover:text-brand-primary transition-colors font-primary"
                @click="$router.push(`/p/${item.product.id}`)"
              >
                {{ formatProductTitle(item.product) }}
              </h3>
              <p class="text-sm text-gray-600 font-primary">{{ formatPrice(item.product.priceRub) }}</p>
              
              <!-- Remove Button -->
              <div class="flex items-center mt-2">
                <button 
                  @click="removeItem(item.product.id)"
                  class="px-3 py-1.5 bg-red-500 text-white rounded-lg font-primary font-bold text-xs uppercase tracking-wide shadow-sm hover:bg-red-600 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex items-center gap-1.5"
                >
                  <TrashIcon class="w-3.5 h-3.5" />
                  <span>Удалить</span>
                </button>
              </div>
            </div>

            <!-- Item Price -->
            <div class="text-right">
              <p class="font-semibold text-gray-900 font-primary">
                {{ formatPrice(item.product.priceRub) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Promo Code -->
      <div class="mt-6 bg-white rounded-lg p-4 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-semibold text-gray-700">Промокод</span>
          <button
            v-if="hasPromo"
            @click="handleRemovePromo"
            class="px-3 py-1.5 bg-red-500 text-white rounded-lg font-primary font-bold text-xs uppercase tracking-wide shadow-sm hover:bg-red-600 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
            type="button"
          >
            Удалить
          </button>
        </div>

        <div v-if="!hasPromo" class="flex gap-2">
          <input
            v-model="promoCodeInput"
            type="text"
            class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
            placeholder="Введите промокод"
            :disabled="isApplyingPromo"
            @keyup.enter="applyPromo"
          />
          <button
            @click="applyPromo"
            :disabled="!promoCodeInput || isApplyingPromo"
            class="px-4 py-2 rounded-lg text-sm font-semibold uppercase tracking-wide transition-colors"
            :class="[
              (!promoCodeInput || isApplyingPromo)
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-brand-primary text-brand-dark hover:bg-brand-primary/90'
            ]"
            type="button"
          >
            {{ isApplyingPromo ? 'Применяем...' : 'Применить' }}
          </button>
        </div>

        <div
          v-else
          class="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"
        >
          <div class="font-semibold">Промокод {{ appliedPromo?.code }}</div>
          <div>Скидка {{ formatPrice(discount) }}</div>
        </div>

        <p v-if="promoError" class="text-xs text-red-600 font-primary mt-2">{{ promoError }}</p>
      </div>

      <!-- Order Summary -->
      <div class="mt-4 bg-white rounded-lg p-4 shadow-sm">
        <h3 class="font-semibold text-gray-900 mb-3 font-primary">Итого</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between font-primary">
            <span class="text-gray-600">Товаров: {{ totalItems }}</span>
            <span class="font-medium">{{ formatPrice(subtotal) }}</span>
          </div>
          <div
            v-if="discount > 0"
            class="flex justify-between font-primary text-sm text-green-600"
          >
            <span>Скидка</span>
            <span>-{{ formatPrice(discount) }}</span>
          </div>
          <div class="border-t border-gray-200 pt-2 flex justify-between font-semibold font-primary">
            <span>Всего:</span>
            <span class="text-lg">{{ formatPrice(total) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Action Bar -->
    <div v-if="cartItems.length > 0" class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div class="flex flex-col space-y-3">
        <!-- Checkout Button -->
        <button
          @click="proceedToCheckout"
          :disabled="!canCheckout || isProcessing"
          :class="[
            'w-full py-3.5 rounded-xl font-primary font-bold text-sm uppercase tracking-wide shadow-md transition-all duration-200 flex items-center justify-center gap-1.5',
            canCheckout && !isProcessing
              ? 'bg-brand-primary text-brand-dark hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          ]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"></path>
          </svg>
          <span>
            {{ isProcessing ? 'Обработка...' : 'Оформить заказ' }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useSettingsStore } from '@/stores/settings'
import { formatProductSizeLabel } from '@/constants/productSizes'
import type { Product } from '@/stores/catalog'
import { 
  ShoppingCartIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const cartStore = useCartStore()
const settingsStore = useSettingsStore()
const isProcessing = ref(false)
const promoCodeInput = ref('')
const promoError = ref<string | null>(null)
const promoNotice = ref<string | null>(null)

const cartItems = computed(() => cartStore.items)
const totalItems = computed(() => cartStore.itemsCount)
const subtotal = computed(() => cartStore.totalPrice)
const discount = computed(() => cartStore.discountAmount)
const total = computed(() => cartStore.totalAfterDiscount)
const hasPromo = computed(() => cartStore.hasPromo)
const appliedPromo = computed(() => cartStore.appliedPromo)
const isApplyingPromo = computed(() => cartStore.isApplyingPromo)

const canCheckout = computed(() => cartItems.value.length > 0 && !isApplyingPromo.value)

function formatPrice(price: number): string {
  return `${price.toLocaleString('ru-RU')} ₽`
}

function formatProductTitle(product: Product): string {
  const base = (product.title || 'Товар').trim()
  const sizeLabel = product.size ? formatProductSizeLabel(product.size) : ''
  if (!sizeLabel || sizeLabel === formatProductSizeLabel('')) return base
  return base.toUpperCase().includes(sizeLabel.toUpperCase()) ? base : `${base} ${sizeLabel}`.trim()
}

function translatePromoError(error: any): string {
  const code = error?.data?.error || error?.code || ''
  const messages: Record<string, string> = {
    code_required: 'Введите промокод',
    amount_required: 'Промокод доступен при наличии товаров в корзине',
    empty_cart: 'Добавьте товары в корзину',
    not_found: 'Такого промокода нет',
    inactive: 'Промокод больше не активен',
    expired: 'Срок действия промокода истёк',
    usage_limit: 'Лимит использования промокода исчерпан',
    no_discount: 'Для этого заказа скидка не применяется',
    already_used_by_user: 'Вы уже использовали этот промокод'
  }

  if (code === 'min_subtotal') {
    const min = error?.data?.meta?.minSubtotal
    if (typeof min === 'number') {
      return `Минимальная сумма заказа для этого промокода — ${formatPrice(min)}`
    }
    return 'Недостаточная сумма заказа для промокода'
  }

  return messages[code] || 'Не удалось применить промокод'
}

const applyPromo = async () => {
  promoError.value = null
  promoNotice.value = null
  const code = promoCodeInput.value.trim()
  if (!code) {
    promoError.value = 'Введите промокод'
    return
  }

  try {
    const applied = await cartStore.applyPromoCode(code)
    promoNotice.value = `Промокод ${applied.code} активен. Скидка ${formatPrice(applied.discount)}`
    promoCodeInput.value = ''
  } catch (error: any) {
    promoError.value = translatePromoError(error)
  }
}

const handleRemovePromo = () => {
  cartStore.removePromo()
  promoNotice.value = null
  promoError.value = null
}

const removeItem = (productId: string | number) => {
  cartStore.removeFromCart(productId)
}

const clearCart = () => {
  if (typeof window !== 'undefined' && window.confirm('Вы уверены, что хотите очистить корзину?')) {
    cartStore.clearCart()
    promoNotice.value = null
    promoError.value = null
  }
}

const proceedToCheckout = async () => {
  if (!canCheckout.value || isProcessing.value) return
  isProcessing.value = true

  try {
    const items = cartItems.value.map((item, index) => {
      const title = formatProductTitle(item.product)
      const price = formatPrice(item.product.priceRub)
      const url = `${window.location.origin}/p/${item.product.id}`
      
      const quantityLine = item.quantity > 1 ? `   Количество: ${item.quantity}\n` : ''
      return `${index + 1}. ${title}\n${quantityLine}   Цена: ${price}\n   Ссылка: ${url}`
    }).join('\n\n')
    
    const promoSummary = appliedPromo.value && discount.value > 0
      ? `\nПромокод: ${appliedPromo.value.code} (-${formatPrice(discount.value)})`
      : ''

    const orderMessage = `Хочу купить:\n\n${items}\n\nИтого: ${formatPrice(total.value)}${promoSummary}\nКоличество товаров: ${totalItems.value}`

    const metadata = {
      items: cartItems.value.map(item => ({
        id: item.product.id,
        title: formatProductTitle(item.product),
        quantity: item.quantity,
        price: item.product.priceRub
      })),
      promo: appliedPromo.value
    }

    const encodedMessage = encodeURIComponent(orderMessage)
    const telegram = settingsStore.settings.manager_telegram
    const managerLink = `https://t.me/${telegram}?text=${encodedMessage}`

    // ИСПРАВЛЕНИЕ: Открываем ссылку СРАЗУ, до любых асинхронных операций
    // Это критично для iOS Safari, который блокирует window.open() после await
    if (typeof window !== 'undefined') {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium')
        if (window.Telegram.WebApp.openTelegramLink) {
          window.Telegram.WebApp.openTelegramLink(managerLink)
        } else {
          window.open(managerLink, '_blank')
        }
      } else {
        window.open(managerLink, '_blank')
      }
    }

    // Погашаем промокод В ФОНЕ, не блокируя переход пользователя
    // Даже если запрос не успеет завершиться, это не критично
    if (appliedPromo.value) {
      cartStore.redeemPromo(metadata).catch(error => {
        console.warn('Не удалось зафиксировать использование промокода', error)
      })
    }
  } finally {
    isProcessing.value = false
  }
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  const item = cartItems.value.find(item => 
    target.alt === formatProductTitle(item.product)
  )
  if (item) {
    target.src = `https://placehold.co/100x100/e5e7eb/6b7280?text=${encodeURIComponent(formatProductTitle(item.product))}`
  }
}

watch(promoCodeInput, () => {
  if (promoError.value) {
    promoError.value = null
  }
})

watch(appliedPromo, promo => {
  if (promo) {
    promoNotice.value = `Промокод ${promo.code} активен. Скидка ${formatPrice(promo.discount)}`
  } else if (!promoError.value) {
    promoNotice.value = null
  }
})

onMounted(async () => {
  await settingsStore.fetchSettings()
})
</script>
