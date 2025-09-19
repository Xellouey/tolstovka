<template>
  <article 
    class="product-card group cursor-pointer"
    @click="$emit('click', product)"
    :class="{ 'opacity-50': isLoading }"
  >
    <!-- Image container with skeleton -->
    <div class="relative overflow-hidden bg-gray-100 aspect-product">
      <!-- Image with lazy loading -->
      <img 
        v-if="imageToShow && !imageError"
        :src="imageToShow"
        :alt="product.title || 'Товар'"
        class="product-image group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
        @error="onImageError"
        @load="onImageLoad"
      />
      
      <!-- Skeleton loader -->
      <div 
        v-if="!imageLoaded || isLoading"
        class="absolute inset-0 skeleton-base animate-pulse"
      />
      
      <!-- No image placeholder -->
      <div 
        v-if="imageError || !product.images?.length"
        class="flex-center h-full text-gray-400"
      >
        <PhotoIcon class="w-12 h-12" />
      </div>

      <!-- Price badge -->
      <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
        <span class="font-bold text-brand-dark text-sm">
          {{ formatPrice(product.priceRub) }}
        </span>
      </div>

      <!-- New badge -->
      <div 
        v-if="isNew"
        class="absolute top-3 left-3 bg-brand-accent text-white rounded-lg px-2 py-1"
      >
        <span class="font-medium text-xs uppercase tracking-wide">Новинка</span>
      </div>
    </div>

    <!-- Product info -->
    <div class="p-3 space-y-2">
      <!-- Brand -->
      <div class="text-xs text-gray-500 uppercase tracking-wide font-medium">
        TOLSOVKA
      </div>

      <!-- Title -->
      <h3 class="font-medium text-brand-dark line-clamp-2 text-sm leading-tight">
        {{ product.title || 'Без названия' }}
      </h3>

      <!-- Price -->
      <div class="flex items-center justify-between">
        <span class="text-lg font-bold text-brand-dark">
          {{ formatPrice(product.priceRub) }}
        </span>
        
        <!-- Quick add button -->
        <button
          class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-full hover:bg-gray-100"
          @click.stop="$emit('quickAdd', product)"
        >
          <PlusIcon class="w-4 h-4" />
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { PhotoIcon, PlusIcon } from '@heroicons/vue/24/outline'
import type { Product } from '@/stores/catalog'

interface Props {
  product: Product
  isLoading?: boolean
}

interface Emits {
  (e: 'click', product: Product): void
  (e: 'quickAdd', product: Product): void
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
})

defineEmits<Emits>()

const imageLoaded = ref(false)
const imageError = ref(false)

const imageToShow = computed(() => {
  if (!props.product.images?.length) return null
  return props.product.images[0]
})

const isNew = computed(() => {
  const createdAt = new Date(props.product.createdAt)
  const now = new Date()
  const daysDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  return daysDiff <= 7 // Consider new if created within 7 days
})

function formatPrice(price: number): string {
  return `${price.toLocaleString('ru-RU')} ₽`
}

function onImageLoad() {
  imageLoaded.value = true
  imageError.value = false
}

function onImageError() {
  imageError.value = true
  imageLoaded.value = true
}

// Preload image for better performance
onMounted(() => {
  if (imageToShow.value) {
    const img = new Image()
    img.onload = onImageLoad
    img.onerror = onImageError
    img.src = imageToShow.value
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
</style>