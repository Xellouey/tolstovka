<template>
  <section 
    v-if="banners.length" 
    class="relative w-full aspect-banner overflow-hidden rounded-2xl bg-gray-100"
  >
    <!-- Single banner -->
    <template v-if="banners.length === 1">
      <div 
        class="w-full h-full cursor-pointer transition-transform duration-300 hover:scale-105"
        @click="handleBannerClick(banners[0])"
      >
        <img 
          :src="banners[0].image" 
          :alt="'Banner'" 
          class="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    </template>

    <!-- Multiple banners carousel -->
    <template v-else>
      <div 
        class="flex h-full transition-transform duration-500 ease-out touch-pan-x"
        :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      >
        <div 
          v-for="(banner, index) in banners"
          :key="banner.id"
          class="flex-shrink-0 w-full h-full cursor-pointer"
          @click="handleBannerClick(banner)"
        >
          <img 
            :src="banner.image" 
            :alt="`Banner ${index + 1}`"
            class="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </div>

      <!-- Dots indicator -->
      <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        <button
          v-for="(banner, index) in banners"
          :key="`dot-${banner.id}`"
          class="w-2 h-2 rounded-full transition-all duration-300"
          :class="index === currentSlide ? 'bg-white w-6' : 'bg-white/50'"
          @click="goToSlide(index)"
        />
      </div>

      <!-- Navigation arrows (desktop) -->
      <div class="hidden md:block">
        <button
          class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-colors"
          @click="previousSlide"
        >
          <ChevronLeftIcon class="w-6 h-6" />
        </button>
        <button
          class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-colors"
          @click="nextSlide"
        >
          <ChevronRightIcon class="w-6 h-6" />
        </button>
      </div>
    </template>

    <!-- Loading skeleton -->
    <div 
      v-if="isLoading" 
      class="absolute inset-0 skeleton-base animate-pulse"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import type { Banner } from '@/stores/catalog'

interface Props {
  banners: Banner[]
  isLoading?: boolean
  autoPlay?: boolean
  autoPlayInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  autoPlay: true,
  autoPlayInterval: 5000
})

const currentSlide = ref(0)
const autoPlayTimer = ref<NodeJS.Timeout>()

// Touch handling
const touchStartX = ref(0)
const touchEndX = ref(0)
const isDragging = ref(false)

function goToSlide(index: number) {
  currentSlide.value = index
  resetAutoPlay()
}

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % props.banners.length
  resetAutoPlay()
}

function previousSlide() {
  currentSlide.value = currentSlide.value === 0 
    ? props.banners.length - 1 
    : currentSlide.value - 1
  resetAutoPlay()
}

function startAutoPlay() {
  if (props.autoPlay && props.banners.length > 1) {
    autoPlayTimer.value = setInterval(nextSlide, props.autoPlayInterval)
  }
}

function stopAutoPlay() {
  if (autoPlayTimer.value) {
    clearInterval(autoPlayTimer.value)
    autoPlayTimer.value = undefined
  }
}

function resetAutoPlay() {
  stopAutoPlay()
  startAutoPlay()
}

function handleBannerClick(banner: Banner) {
  if (banner.href) {
    if (banner.href.startsWith('http')) {
      // External link
      if (window.Telegram?.WebApp?.openLink) {
        window.Telegram.WebApp.openLink(banner.href)
      } else {
        window.open(banner.href, '_blank')
      }
    } else {
      // Internal navigation
      navigateTo(banner.href)
    }
  }
}

function navigateTo(path: string) {
  // This would be handled by router
  console.log('Navigate to:', path)
}

// Touch handlers
function onTouchStart(e: TouchEvent) {
  touchStartX.value = e.touches[0].clientX
  isDragging.value = false
  stopAutoPlay()
}

function onTouchMove(e: TouchEvent) {
  if (!isDragging.value) {
    isDragging.value = true
  }
  touchEndX.value = e.touches[0].clientX
}

function onTouchEnd() {
  if (!isDragging.value) {
    startAutoPlay()
    return
  }

  const threshold = 50
  const diff = touchStartX.value - touchEndX.value

  if (Math.abs(diff) > threshold) {
    if (diff > 0) {
      nextSlide()
    } else {
      previousSlide()
    }
  } else {
    startAutoPlay()
  }

  isDragging.value = false
}

onMounted(() => {
  startAutoPlay()
})

onUnmounted(() => {
  stopAutoPlay()
})
</script>