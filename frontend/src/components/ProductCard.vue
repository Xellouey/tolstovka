<template>
  <div 
    class="group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg shadow-sm"
    @click="$emit('click', product)"
    :class="{ 'opacity-50': isLoading }"
    style="background-color: #383b3d;"
  >
    <!-- Image carousel with dots -->
    <div class="relative bg-gray-50 aspect-[3/4] rounded-t-lg overflow-hidden mb-1">
      <!-- Images carousel -->
      <div 
        ref="carouselContainer" 
        class="carousel-container overflow-hidden"
      >
        <div 
          class="carousel-track flex transition-transform duration-300 ease-out"
          :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
        >
          <!-- Images -->
          <div 
            v-for="(image, index) in productImages" 
            :key="index"
            class="carousel-slide flex-shrink-0 w-full h-full"
          >
            <img 
              :src="image"
              :alt="`${product.title || 'Без названия'} - фото ${index + 1}`"
              class="w-full h-full object-cover"
              loading="lazy"
              @error="onImageError(index)"
              @load="onImageLoad(index)"
            />
          </div>
        </div>
      </div>
      
      <!-- Skeleton loader -->
      <div 
        v-if="!imagesLoaded || isLoading"
        class="absolute inset-0 bg-gray-200 animate-skeleton pointer-events-none"
      />
      
      <!-- No image placeholder -->
      <div 
        v-if="!productImages.length"
        class="flex-center h-full text-gray-400 bg-gray-100"
      >
        <PhotoIcon class="w-16 h-16" />
      </div>

      <!-- Add to cart button -->
      <button
        @click.stop.prevent="addToCart"
        class="absolute top-3 right-3 w-10 h-10 bg-gray-700/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-gray-600 hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 z-10"
        :class="{ 'bg-brand-primary text-brand-dark': isInCart }"
      >
        <ShoppingCartIcon class="w-5 h-5 text-white" :class="{ 'text-brand-dark': isInCart }" />
      </button>

      <!-- Size badge - bottom right corner with yellow color -->
      <div 
        v-if="displaySizeLabel" 
        class="absolute bottom-2 right-2 inline-flex items-center px-2.5 py-1 rounded-full bg-yellow-400 text-[11px] font-bold text-gray-900 uppercase tracking-wide shadow-md z-10"
      >
        {{ displaySizeLabel }}
      </div>

      <!-- Navigation dots -->
      <div 
        v-if="productImages.length > 1" 
        class="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2"
      >
        <button
          v-for="(_, index) in productImages"
          :key="index"
          @click.stop="goToSlide(index)"
          class="w-2 h-2 rounded-full transition-all duration-200"
          :class="index === currentIndex ? 'bg-white' : 'bg-white/50'"
        />
      </div>
      
      <!-- Touch/swipe navigation -->
      <div 
        class="absolute inset-0"
        @touchstart="onTouchStart"
        @touchend="onTouchEnd"
        @mousedown="onMouseDown"
        @mouseup="onMouseUp"
      ></div>
    </div>

    <!-- Product info with gray background -->
    <div class="p-3 space-y-1.5">
      <!-- Price - yellow, prominent -->
      <div class="text-lg font-bold leading-tight text-yellow-400">
        {{ formatPrice(product.priceRub) }}
      </div>

      <!-- Title - white -->
      <h3 class="font-primary text-sm font-medium text-white leading-tight line-clamp-2">
        {{ product.title || 'Без названия' }}
      </h3>
    </div>
    
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
import { ref, computed, onMounted } from 'vue'
import { PhotoIcon, ShoppingCartIcon } from '@heroicons/vue/24/outline'
import { useCartStore } from '@/stores/cart'
import { formatProductSizeLabel } from '@/constants/productSizes'
import Toast from './Toast.vue'
import type { Product } from '@/stores/catalog'

interface Props {
  product: Product
  isLoading?: boolean
}

interface Emits {
  (e: 'click', product: Product): void
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
})

defineEmits<Emits>()

const cartStore = useCartStore()

// Carousel state
const currentIndex = ref(0)
const imagesLoaded = ref(false)
const loadedImages = ref(new Set<number>())
const carouselContainer = ref<HTMLElement | null>(null)

// Cart state
const isInCart = computed(() => {
  return cartStore.items.some(item => item.product.id === props.product.id)
})

// Toast state
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'info'>('success')

// Touch/swipe state
const touchStartX = ref(0)
const touchEndX = ref(0)
const isDragging = ref(false)

const productImages = computed(() => {
  return props.product.images?.filter(img => img && img.trim()) || []
})

const displaySizeLabel = computed(() => {
  if (!props.product.size) return ''
  const label = formatProductSizeLabel(props.product.size)
  if (!label || label === formatProductSizeLabel('')) return ''
  return label
})


function formatPrice(price: number): string {
  return `${price.toLocaleString('ru-RU')} ₽`
}

function onImageLoad(index: number) {
  loadedImages.value.add(index)
  if (loadedImages.value.size === productImages.value.length) {
    imagesLoaded.value = true
  }
}

function onImageError(index: number) {
  loadedImages.value.add(index)
  if (loadedImages.value.size === productImages.value.length) {
    imagesLoaded.value = true
  }
}

// Add to cart
function addToCart(event?: Event) {
  // Prevent any event bubbling
  if (event) {
    event.stopPropagation()
    event.preventDefault()
  }
  
  if (isInCart.value) {
    cartStore.removeFromCart(props.product.id)
    toastMessage.value = 'Товар удалён из корзины'
    toastType.value = 'error'
  } else {
    cartStore.addToCart(props.product)
    toastMessage.value = 'Товар добавлен в корзину'
    toastType.value = 'success'
  }
  
  // Show toast
  showToast.value = true
  
  // Haptic feedback if available
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('medium')
  }
}

// Carousel navigation
function goToSlide(index: number) {
  if (index >= 0 && index < productImages.value.length) {
    currentIndex.value = index
  }
}

function nextSlide() {
  goToSlide((currentIndex.value + 1) % productImages.value.length)
}

function prevSlide() {
  goToSlide((currentIndex.value - 1 + productImages.value.length) % productImages.value.length)
}

// Touch/swipe handlers
function onTouchStart(e: TouchEvent) {
  touchStartX.value = e.touches[0].clientX
  isDragging.value = true
}

function onTouchEnd(e: TouchEvent) {
  if (!isDragging.value) return
  
  touchEndX.value = e.changedTouches[0].clientX
  const diffX = touchStartX.value - touchEndX.value
  const minSwipeDistance = 50
  
  if (Math.abs(diffX) > minSwipeDistance) {
    if (diffX > 0) {
      nextSlide()
    } else {
      prevSlide()
    }
  }
  
  isDragging.value = false
}

// Mouse handlers for desktop
function onMouseDown(e: MouseEvent) {
  touchStartX.value = e.clientX
  isDragging.value = true
}

function onMouseUp(e: MouseEvent) {
  if (!isDragging.value) return
  
  touchEndX.value = e.clientX
  const diffX = touchStartX.value - touchEndX.value
  const minSwipeDistance = 50
  
  if (Math.abs(diffX) > minSwipeDistance) {
    if (diffX > 0) {
      nextSlide()
    } else {
      prevSlide()
    }
  }
  
  isDragging.value = false
}

// Preload images for better performance
onMounted(() => {
  if (productImages.value.length > 0) {
    productImages.value.forEach((src, index) => {
      if (src) {
        const img = new Image()
        img.onload = () => onImageLoad(index)
        img.onerror = () => onImageError(index)
        img.src = src
      }
    })
  } else {
    imagesLoaded.value = true
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.carousel-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.carousel-track {
  height: 100%;
  will-change: transform;
}

.carousel-slide {
  height: 100%;
}

/* Smooth touch scrolling for better mobile experience */
.carousel-track {
  -webkit-overflow-scrolling: touch;
}

/* Prevent text selection during swipe */
.carousel-container {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
