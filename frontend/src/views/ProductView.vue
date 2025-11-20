<template>
  <div class="product-page min-h-screen bg-white">
    <!-- Loading State -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="loading" class="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div class="text-center">
          <div class="relative w-20 h-20 mx-auto mb-4">
            <div class="absolute inset-0 border-4 border-brand-primary/20 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p class="text-brand-dark font-medium animate-pulse font-primary">Загружаем товар...</p>
        </div>
      </div>
    </Transition>

    <!-- Error State -->
    <Transition
      enter-active-class="transition-all duration-300"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div v-if="!loading && error" class="flex flex-col items-center justify-center min-h-screen px-6">
        <div class="text-center">
          <div class="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <ExclamationTriangleIcon class="w-12 h-12 text-red-500" />
          </div>
          <h2 class="text-2xl font-semibold text-brand-dark mb-2 font-primary">Упс! Товар не найден</h2>
          <p class="text-gray-600 mb-8 max-w-md mx-auto font-primary">{{ error }}</p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              @click="$router.back()"
              class="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-brand-dark border-2 border-brand-dark rounded-xl font-semibold hover:bg-gray-50 transition-all font-primary uppercase tracking-wide text-xs"
            >
              <ChevronLeftIcon class="w-4 h-4" />
              <span>назад</span>
            </button>
            <router-link 
              to="/"
              class="px-6 py-3 bg-brand-primary text-brand-dark rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all font-primary"
            >
              На главную
            </router-link>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Product Content -->
    <Transition
      enter-active-class="transition-all duration-500"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      appear
    >
      <div v-if="!loading && product" class="relative">
        <!-- Mobile Layout (unchanged) -->
        <div class="lg:hidden">
          <!-- Product Hero Gallery -->
          <ProductHero
            :images="images"
            :product-title="productDisplayTitle"
            :badges="productBadges"
            :external-current-slide="currentSlide"
            @slide-change="currentSlide = $event"
          />

          <!-- Product Information Tabs -->
          <ProductInfo
            :product="product"
            :category="category"
          />

          <!-- Spacer for bottom bar -->
          <div :style="{ height: bottomBarHeight + 'px' }"></div>
        </div>

        <!-- Desktop Layout -->
        <div class="hidden lg:block">
          <!-- Desktop Header with Back Button -->
          <div class="container mx-auto px-8 py-6 max-w-7xl">
            <div class="flex items-center gap-4 mb-8">
              <button
                @click="router.back()"
                class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all text-xs font-semibold uppercase tracking-wide text-brand-dark"
                aria-label="Назад"
              >
                <ChevronLeftIcon class="w-4 h-4" />
                <span>назад</span>
              </button>
              <nav class="text-sm text-gray-600 font-primary">
                <router-link to="/" class="hover:text-brand-primary transition-colors">Главная</router-link>
                <span class="mx-2">/</span>
                <router-link 
                  v-if="category" 
                  :to="`/category/${category.slug}`" 
                  class="hover:text-brand-primary transition-colors"
                >
                  {{ category.name }}
                </router-link>
                <span v-if="category" class="mx-2">/</span>
                <span class="text-brand-dark font-medium">{{ productDisplayTitle }}</span>
              </nav>
            </div>
          </div>

          <!-- Desktop Product Content -->
          <div class="container mx-auto px-8 pb-16 max-w-7xl">
            <div class="grid grid-cols-12 gap-12">
              <!-- Left Column - Images (7 columns) -->
              <div class="col-span-7">
                <div class="sticky top-8">
                  <!-- Main Image -->
                  <div class="relative mb-6 bg-gradient-to-b from-gray-50 to-white rounded-2xl overflow-hidden shadow-sm">
                    <div class="aspect-square w-full relative">
                      <!-- Badges -->
                      <div 
                        v-if="productBadges.length > 0"
                        class="absolute top-6 left-6 flex flex-col gap-3 z-10"
                      >
                        <TransitionGroup
                          enter-active-class="transition-all duration-500"
                          enter-from-class="opacity-0 -translate-x-4"
                          enter-to-class="opacity-100 translate-x-0"
                        >
                          <div
                            v-for="(badge, idx) in productBadges"
                            :key="`badge-${badge.type}`"
                            class="inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-lg backdrop-blur-md"
                            :class="getBadgeClass(badge.type)"
                            :style="{ transitionDelay: `${idx * 100}ms` }"
                          >
                            <component :is="getBadgeIcon(badge.type)" class="w-4 h-4" />
                            <span class="text-sm font-bold uppercase tracking-wider font-primary">{{ badge.text }}</span>
                          </div>
                        </TransitionGroup>
                      </div>

                      <!-- Current Image -->
                      <img
                        :src="images[currentSlide]"
                        :alt="`${productDisplayTitle} - Фото ${currentSlide + 1}`"
                        class="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                        @click="openDesktopLightbox"
                        loading="eager"
                      />
                    </div>
                  </div>

                  <!-- Thumbnails -->
                  <div v-if="images.length > 1" class="grid grid-cols-6 gap-3">
                    <button
                      v-for="(image, idx) in images"
                      :key="`desktop-thumb-${idx}`"
                      @click="currentSlide = idx"
                      class="relative aspect-square rounded-xl overflow-hidden transition-all duration-300 focus:outline-none"
                      :class="[
                        idx === currentSlide 
                          ? 'ring-2 ring-brand-primary scale-105' 
                          : 'ring-1 ring-gray-200 hover:ring-brand-primary/50 hover:scale-102'
                      ]"
                    >
                      <img
                        :src="image"
                        :alt="`Миниатюра ${idx + 1}`"
                        class="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <!-- Active Overlay -->
                      <div
                        v-if="idx === currentSlide"
                        class="absolute inset-0 bg-brand-primary/10"
                      />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Right Column - Product Info (5 columns) -->
              <div class="col-span-5">
                <div class="sticky top-8">
                  <!-- Product Title -->
                  <h1 class="text-4xl font-primary font-medium text-brand-dark mb-4 leading-tight">
                    {{ productDisplayTitle }}
                  </h1>

                  <!-- Category -->
                  <div class="mb-6">
                    <router-link
                      v-if="category"
                      :to="`/category/${category.slug}`"
                      class="inline-flex items-center gap-2 text-gray-600 hover:text-brand-primary transition-colors font-medium font-primary"
                    >
                      <TagIcon class="w-5 h-5" />
                      <span>{{ category.name }}</span>
                    </router-link>
                  </div>

                  <!-- Price -->
                  <div class="mb-8 p-6 bg-gray-50 rounded-2xl">
                    <div class="flex items-center justify-between mb-4">
                      <div>
                        <span class="text-4xl font-bold text-brand-dark tabular-nums font-primary">
                          {{ formatPrice(product.priceRub) }}
                        </span>
                      </div>
                      <!-- Stock Status -->
                      <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700">
                        <CheckCircleIcon class="w-5 h-5" />
                        <span class="font-medium font-primary">В наличии</span>
                      </div>
                    </div>
                  </div>

                  <!-- Description -->
                  <div v-if="product.description" class="mb-8">
                    <h3 class="text-lg font-medium text-brand-dark mb-3 font-primary">Описание</h3>
                    <p class="text-gray-700 leading-relaxed text-base font-primary">
                      {{ product.description }}
                    </p>
                  </div>

                  <!-- Action Buttons -->
                  <div class="space-y-3">
                    <!-- Add to Cart Button -->
                    <button
                      @click="addToCart"
                      class="w-full py-4 bg-white border-2 border-brand-dark text-brand-dark rounded-xl font-primary font-bold text-lg uppercase tracking-wide shadow-md hover:bg-brand-dark hover:text-white active:scale-98 transition-all duration-300"
                    >
                      <span class="flex items-center justify-center gap-3">
                        <ShoppingCartIcon class="w-6 h-6" />
                        <span>Добавить в корзину</span>
                      </span>
                    </button>
                    
                    <!-- Buy Now Button -->
                    <button
                      @click="buyNow"
                      class="w-full py-4 bg-brand-primary text-brand-dark rounded-xl font-primary font-bold text-lg uppercase tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-98 transition-all duration-300"
                    >
                      <span class="flex items-center justify-center gap-3">
                        <ShoppingBagIcon class="w-6 h-6" />
                        <span>Купить сейчас</span>
                      </span>
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Enhanced Bottom Action Bar - Mobile Only -->
    <Transition
      enter-active-class="transition-all duration-500"
      enter-from-class="translate-y-full"
      enter-to-class="translate-y-0"
      leave-active-class="transition-all duration-300"
      leave-from-class="translate-y-0"
      leave-to-class="translate-y-full"
    >
      <div 
        v-if="!loading && product" 
        ref="bottomBarRef"
        class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-30"
      >
        <div class="px-4 py-3">
          <!-- Price and Stock Info -->
          <div class="flex items-center justify-between" style="margin-bottom: 0.9rem;">
            <div>
              <div class="flex items-baseline gap-2">
                <span class="text-2xl font-bold text-brand-dark tabular-nums font-primary">
                  {{ formatPrice(product.priceRub) }}
                </span>
                <!-- Old price removed as not in Product interface -->
              </div>
            </div>

            <!-- Stock Status -->
            <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700">
              <CheckCircleIcon class="w-4 h-4" />
              <span class="text-sm font-medium font-primary">В наличии</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2">
            <!-- Add to Cart Button -->
            <button
              @click="addToCart"
              class="flex-1 py-3.5 bg-white border-2 border-brand-dark text-brand-dark rounded-xl font-primary font-bold text-sm uppercase tracking-wide shadow-sm hover:bg-brand-dark hover:text-white active:scale-[0.98] transition-all duration-200"
            >
              <span class="flex items-center justify-center gap-1.5">
                <ShoppingCartIcon class="w-5 h-5" />
                <span>В корзину</span>
              </span>
            </button>
            
            <!-- Buy Now Button -->
            <button
              @click="buyNow"
              class="flex-1 py-3.5 bg-brand-primary text-brand-dark rounded-xl font-primary font-bold text-sm uppercase tracking-wide shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
            >
              <span class="flex items-center justify-center gap-1.5">
                <ShoppingBagIcon class="w-5 h-5" />
                <span>Купить</span>
              </span>
            </button>
          </div>

        </div>

        <!-- Safe area for iOS -->
        <div class="h-safe-bottom"></div>
      </div>
    </Transition>

    <!-- Purchase Modal -->
    <PurchaseModal
      :is-open="showPurchaseModalState"
      :product="purchaseProduct"
      @close="showPurchaseModalState = false"
    />

    <!-- Toast Notification -->
    <Toast 
      :message="toastMessage" 
      :type="toastType" 
      :show="showToast"
      @hidden="showToast = false"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter, onBeforeRouteUpdate } from 'vue-router'
import { useCatalogStore } from '@/stores/catalog'
import { useCartStore } from '@/stores/cart'

// Import new components
import ProductHero from '@/components/product/ProductHero.vue'
import ProductInfo from '@/components/product/ProductInfo.vue'
import PurchaseModal from '@/components/PurchaseModal.vue'
import Toast from '@/components/Toast.vue'

// Icons
import { 
  ExclamationTriangleIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  TagIcon,
  FireIcon,
  SparklesIcon,
  BoltIcon,
  ShieldCheckIcon
} from '@heroicons/vue/24/outline'

// Props and stores
const props = defineProps<{ id: string }>()
const catalogStore = useCatalogStore()
const cartStore = useCartStore()
const router = useRouter()

// State
const loading = ref(false)
const error = ref('')
const currentSlide = ref(0)
const showPurchaseModalState = ref(false)
const purchaseProduct = ref<any>(null)
const bottomBarRef = ref<HTMLElement | null>(null)
const bottomBarHeight = ref(112) // Дефолтное значение h-28
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'info'>('success')

// Computed properties
const product = computed(() => {
  const cp = catalogStore.currentProduct
  if (cp && cp.id === props.id) return cp
  return catalogStore.products.find(p => p.id === props.id) || null
})

const productDisplayTitle = computed(() => {
  const value = product.value
  if (!value) return ''
  const base = (value.title || 'Товар').trim()
  const size = value.size?.toUpperCase()
  if (!size) return base
  return base.toUpperCase().includes(size) ? base : `${base} ${size}`.trim()
})

const category = computed(() => {
  if (!product.value) return null
  return catalogStore.categories.find(cat => cat.id === product.value!.categoryId) || null
})

const images = computed(() => product.value?.images ?? [])

const productBadges = computed(() => {
  const badges: Array<{ type: 'new' | 'hot' | 'sale' | 'exclusive' | 'lastpiece', text: string }> = []
  // Remove isNew and isSale checks as they don't exist in Product interface
  // Add badges based on actual product properties if needed
  return badges
})


// Actions
function addToCart() {
  if (!product.value) return
  
  const isAlreadyInCart = cartStore.isInCart(product.value.id)
  
  if (isAlreadyInCart) {
    cartStore.removeFromCart(product.value.id)
    toastMessage.value = 'Товар удален из корзины'
    toastType.value = 'error'
  } else {
    cartStore.addToCart(product.value)
    toastMessage.value = 'Товар добавлен в корзину'
    toastType.value = 'success'
  }
  
  // Show toast notification
  showToast.value = true
  
  hapticFeedback('medium')
}

function buyNow() {
  if (!product.value) return
  
  purchaseProduct.value = product.value
  showPurchaseModalState.value = true
  hapticFeedback('medium')
}

// Desktop lightbox
function openDesktopLightbox() {
  // For now, just cycle through images on click
  if (images.value.length > 1) {
    currentSlide.value = (currentSlide.value + 1) % images.value.length
  }
  hapticFeedback('light')
}

// Badge utilities for desktop
function getBadgeClass(type: string) {
  const classes = {
    new: 'bg-green-500/90 text-white',
    hot: 'bg-red-500/90 text-white', 
    sale: 'bg-brand-primary/90 text-brand-dark',
    exclusive: 'bg-purple-600/90 text-white',
    lastpiece: 'bg-orange-500/90 text-white'
  }
  return classes[type as keyof typeof classes] || 'bg-gray-600/90 text-white'
}

function getBadgeIcon(type: string) {
  const icons = {
    new: SparklesIcon,
    hot: FireIcon,
    sale: BoltIcon, 
    exclusive: ShieldCheckIcon,
    lastpiece: FireIcon
  }
  return icons[type as keyof typeof icons] || SparklesIcon
}



// Utilities
function formatPrice(price: number): string {
  return `${price.toLocaleString('ru-RU')} ₽`
}

function hapticFeedback(style: 'light' | 'medium' | 'heavy' | 'error' | 'success' = 'light') {
  if (window.Telegram?.WebApp?.HapticFeedback) {
    const impact = style === 'error' || style === 'success' ? 'heavy' : style as any
    window.Telegram.WebApp.HapticFeedback.impactOccurred(impact)
  }
}

// Обновление высоты нижней панели
function updateBottomBarHeight() {
  nextTick(() => {
    if (bottomBarRef.value) {
      bottomBarHeight.value = bottomBarRef.value.offsetHeight
    }
  })
}

// Data loading
const loadProduct = async (id: string) => {
  loading.value = true
  error.value = ''
  
  try {
    // Load categories if needed
    if (!catalogStore.categories.length) {
      await catalogStore.fetchCategories()
    }
    
    // Clear old product if ID doesn't match
    if (catalogStore.currentProduct && catalogStore.currentProduct.id !== id) {
      catalogStore.clearCurrentProduct()
    }
    
    // Load product
    await catalogStore.fetchProduct(id)
    
    if (!catalogStore.currentProduct || catalogStore.currentProduct.id !== id) {
      error.value = 'Товар не найден'
    }
    
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Не удалось загрузить товар'
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await loadProduct(props.id)
  
  // Update bottom bar height
  updateBottomBarHeight()
  
  // Add animation after mount
  await nextTick()
  document.querySelector('.product-page')?.classList.add('mounted')
})

// Watch for route changes
watch(
  () => props.id,
  async (newId, oldId) => {
    if (newId !== oldId) {
      showPurchaseModalState.value = false
      await loadProduct(newId)
      currentSlide.value = 0
      updateBottomBarHeight()
    }
  },
  { immediate: false }
)

// Watch product changes for height update
watch(
  () => product.value,
  () => {
    updateBottomBarHeight()
  }
)

onBeforeRouteUpdate(async (to) => {
  const id = to.params.id as string
  showPurchaseModalState.value = false
  await loadProduct(id)
  currentSlide.value = 0
})
</script>

<style scoped>
/* Page animations */
.product-page {
  will-change: transform, opacity;
}

.product-page.mounted {
  animation: pageEnter 0.5s ease-out;
}

@keyframes pageEnter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Safe area for iOS */
.h-safe-bottom {
  height: env(safe-area-inset-bottom, 0);
}

/* Custom scrollbar hide */
.scrollbar-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Desktop-specific styles */
@media (min-width: 1024px) {
  .product-page {
    background-color: #fafafa;
  }
  
  .sticky {
    position: -webkit-sticky;
    position: sticky;
  }
  
  /* Smooth hover effects for desktop */
  .hover\:scale-102:hover {
    transform: scale(1.02);
  }
  
  .hover\:scale-105:hover {
    transform: scale(1.05);
  }
  
  .active\:scale-98:active {
    transform: scale(0.98);
  }
  
  /* Custom ring styles */
  .ring-brand-primary\/50 {
    --tw-ring-opacity: 0.5;
    --tw-ring-color: rgb(255 200 26 / var(--tw-ring-opacity));
  }
}
</style>
