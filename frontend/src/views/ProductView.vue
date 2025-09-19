<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <div class="sticky top-0 bg-white shadow-sm px-4 py-3 flex items-center justify-between z-10">
      <button @click="$router.go(-1)" class="p-2 hover:bg-gray-100 rounded-full">
        <ArrowLeftIcon class="w-5 h-5" />
      </button>
      <button @click="toggleFavorite" class="p-2 hover:bg-gray-100 rounded-full">
        <HeartIcon 
          :class="[
            'w-5 h-5 transition-colors',
            isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'
          ]" 
        />
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex flex-col items-center justify-center py-16 text-center px-6">
      <ExclamationTriangleIcon class="w-12 h-12 text-red-500 mb-4" />
      <h2 class="text-xl font-semibold text-brand-dark mb-2">Товар не найден</h2>
      <p class="text-brand-dark/70 mb-6">{{ error }}</p>
      <router-link 
        to="/"
        class="px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-dark/90 transition-colors"
      >
        На главную
      </router-link>
    </div>

    <!-- Product Details -->
    <div v-else-if="product" class="pb-24">
      <!-- Product Gallery (Embla) -->
      <div class="relative w-full aspect-[3/4] bg-gray-100">
        <div 
          class="embla overflow-hidden absolute inset-0"
          ref="emblaRef"
          @mouseenter="onEmblaMouseEnter"
          @mouseleave="onEmblaMouseLeave"
          @focusin="onEmblaMouseEnter"
          @focusout="onEmblaMouseLeave"
        >
          <div class="embla__container flex h-full">
            <div
              v-for="(src, idx) in images"
              :key="src + '-' + idx"
              class="embla__slide min-w-full h-full bg-gray-100"
            >
              <img
                :src="src"
                :alt="product.title || 'Товар'"
                class="w-full h-full object-cover"
                loading="lazy"
                @error="handleImageError"
              />
            </div>
          </div>
        </div>

        <!-- Prev/Next controls -->
        <button
          v-if="images.length > 1"
          type="button"
          class="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-white"
          @click="scrollPrev"
          aria-label="Предыдущее изображение"
        >
          <ChevronLeftIcon class="w-6 h-6" />
        </button>
        <button
          v-if="images.length > 1"
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-white"
          @click="scrollNext"
          aria-label="Следующее изображение"
        >
          <ChevronRightIcon class="w-6 h-6" />
        </button>

        <!-- Dots -->
        <div
          v-if="images.length > 1"
          class="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2"
        >
          <button
            v-for="(src, idx) in images"
            :key="'dot-' + idx"
            class="h-2 rounded-full transition-all"
            :style="{ width: idx === currentSlide ? '1.25rem' : '0.5rem' }"
            :class="idx === currentSlide ? 'bg-white' : 'bg-white/60'"
            @click="goToSlide(idx)"
            :aria-label="`Перейти к изображению ${idx + 1}`"
            :aria-current="idx === currentSlide ? 'true' : 'false'"
          />
        </div>

        <!-- ARIA live region for screen readers -->
        <div
          aria-live="polite"
          :aria-atomic="true"
          style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;"
        >
          {{ liveAnnouncement }}
        </div>
      </div>

      <!-- Thumbnails -->
      <div v-if="images.length > 1" class="px-4 mt-3">
        <div class="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            v-for="(src, idx) in images"
            :key="'thumb-' + idx"
            class="relative flex-shrink-0 w-14 h-18 rounded-lg overflow-hidden border focus:outline-none focus:ring-2 focus:ring-brand-dark"
            :class="idx === currentSlide ? 'border-brand-dark ring-2 ring-brand-dark' : 'border-gray-200'"
            @click="goToSlide(idx)"
            @keydown.enter.prevent="goToSlide(idx)"
            @keydown.space.prevent="goToSlide(idx)"
            :aria-label="`Показать изображение ${idx + 1}`"
            :aria-pressed="idx === currentSlide ? 'true' : 'false'"
            tabindex="0"
          >
            <img
              :src="src"
              :alt="product?.title || 'Товар'"
              class="w-full h-full object-cover"
              loading="lazy"
              @load="markThumbLoaded(idx)"
              @error="handleImageError"
            />
            <div v-if="!thumbLoaded[idx]" class="absolute inset-0 skeleton-base animate-pulse" />
          </button>
        </div>
      </div>

      <!-- Product Info -->
      <div class="p-4">
        <div class="flex items-start justify-between mb-2">
          <h1 class="text-xl font-bold text-gray-900 flex-1">{{ product.title || 'Без названия' }}</h1>
          <span class="text-xl font-bold text-brand-dark ml-4">{{ formatPrice(product.priceRub) }}</span>
        </div>

        <p v-if="product.description" class="text-gray-600 mb-4 leading-relaxed">
          {{ product.description }}
        </p>

        <!-- Category badge (clickable) -->
        <router-link
          v-if="category"
          :to="{ name: 'category', params: { slug: category.slug } }"
          class="inline-flex items-center space-x-2 mb-4 px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-brand-dark hover:border-brand-dark transition-colors"
        >
          <TagIcon class="w-4 h-4 text-gray-500" />
          <span>{{ category.name }}</span>
        </router-link>

        <!-- Quantity Selector -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Количество</label>
          <div class="flex items-center space-x-3">
            <button 
              @click="decreaseQuantity"
              :disabled="quantity <= 1"
              class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MinusIcon class="w-4 h-4" />
            </button>
            <span class="text-lg font-medium min-w-[2rem] text-center">{{ quantity }}</span>
            <button 
              @click="increaseQuantity"
              class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
            >
              <PlusIcon class="w-4 h-4" />
            </button>
          </div>
          <p class="text-sm text-gray-500 mt-1">
            Итого: {{ formatPrice(product.priceRub * quantity) }}
          </p>
        </div>

        <!-- Additional Info -->
        <div class="space-y-3 text-sm text-gray-600">
          <div class="flex items-center space-x-2">
            <ClockIcon class="w-4 h-4" />
            <span>Добавлен {{ formatDate(product.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Action Bar -->
    <div v-if="product" class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div class="flex space-x-3">
        <button
          @click="showPurchaseModal"
          class="flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 bg-brand-dark text-white hover:bg-brand-dark/90"
        >
          <ShoppingCartIcon class="w-5 h-5" />
          <span>Купить</span>
        </button>
      </div>
    </div>

    <!-- Purchase Modal -->
    <PurchaseModal
      :is-open="showModal"
      :product="product"
      @close="showModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'
import emblaCarouselVue from 'embla-carousel-vue'
import Autoplay from 'embla-carousel-autoplay'
import { useCatalogStore } from '@/stores/catalog'
import PurchaseModal from '@/components/PurchaseModal.vue'
import { 
  ArrowLeftIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  TagIcon,
  MinusIcon,
  PlusIcon,
  ClockIcon,
  ShoppingCartIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'

// Получаем id товара из props (props: true в маршруте)
const props = defineProps<{ id: string }>()
const catalogStore = useCatalogStore()

const loading = ref(false)
const error = ref('')
const quantity = ref(1)
const isFavorite = ref(false)
const showModal = ref(false)

// Embla carousel
const [emblaRef, emblaApi] = emblaCarouselVue(
  { loop: true, align: 'center' },
  [Autoplay({ delay: 4000, stopOnInteraction: false })]
)
const currentSlide = ref(0)

const product = computed(() => {
  // Предпочтительно показываем currentProduct, если id совпадает,
  // иначе ищем в списке products
  const cp = catalogStore.currentProduct
  if (cp && cp.id === props.id) return cp
  return catalogStore.products.find(p => p.id === props.id) || null
})

const category = computed(() => {
  if (!product.value) return null
  return catalogStore.categories.find(cat => cat.id === product.value!.categoryId) || null
})

const images = computed(() => product.value?.images ?? [])

// Thumbnail skeleton load states
const thumbLoaded = ref<boolean[]>([])

function initThumbStates() {
  thumbLoaded.value = images.value.map(() => false)
}

function markThumbLoaded(index: number) {
  thumbLoaded.value[index] = true
}

const decreaseQuantity = () => {
  if (quantity.value > 1) quantity.value--
}

const increaseQuantity = () => {
  quantity.value++
}

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
  // TODO: Sync with backend
}

const showPurchaseModal = () => {
  if (!product.value) return
  showModal.value = true
  // Haptic feedback in Telegram
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('medium')
  }
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = `https://placehold.co/400x300/e5e7eb/6b7280?text=${encodeURIComponent(product.value?.title || 'Товар')}`
}

function goToSlide(index: number) {
  emblaApi.value?.scrollTo(index)
}

function scrollPrev() {
  emblaApi.value?.scrollPrev()
}
function scrollNext() {
  emblaApi.value?.scrollNext()
}

function onSelect() {
  const api = emblaApi.value
  if (!api) return
  currentSlide.value = api.selectedScrollSnap()
}

function onEmblaMouseEnter() {
  try { emblaApi.value?.plugins()?.autoplay?.stop() } catch (_) {}
}
function onEmblaMouseLeave() {
  try { emblaApi.value?.plugins()?.autoplay?.play() } catch (_) {}
}

function formatPrice(price: number): string {
  return `${price.toLocaleString('ru-RU')} ₽`
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'вчера'
  if (diffDays < 7) return `${diffDays} дн. назад`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} нед. назад`
  return date.toLocaleDateString('ru-RU')
}

const liveAnnouncement = computed(() => {
  if (!images.value.length) return ''
  return `Изображение ${currentSlide.value + 1} из ${images.value.length}`
})

const loadProduct = async (id: string) => {
  loading.value = true
  error.value = ''
  try {
    // Категории нужны для отображения названия категории
    if (!catalogStore.categories.length) {
      await catalogStore.fetchCategories()
    }
    // Если товара нет или id не совпадает — догрузим
    if (!product.value || product.value.id !== id) {
      await catalogStore.fetchProduct(id)
    }
    if (!catalogStore.currentProduct || catalogStore.currentProduct.id !== id) {
      // Если и после запроса нет — отобразим ошибку
      error.value = 'Товар не найден'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Не удалось загрузить товар'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadProduct(props.id)
  initThumbStates()
  await nextTick()
  const api = emblaApi.value
  if (api) {
    api.on('select', onSelect)
    api.on('reInit', () => { onSelect(); initThumbStates() })
    onSelect()
  }
})

onBeforeRouteUpdate((to) => {
  const id = to.params.id as string
  showModal.value = false
  loadProduct(id)
  nextTick().then(() => {
    currentSlide.value = 0
    emblaApi.value?.scrollTo(0)
    initThumbStates()
  })
})
</script>
