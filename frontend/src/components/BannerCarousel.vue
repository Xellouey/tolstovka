<template>
<section 
    v-if="banners.length" 
    class="relative w-full overflow-hidden"
    :class="[
      'aspect-banner lg:aspect-auto',
      'lg:max-w-7xl lg:mx-auto lg:rounded-2xl lg:shadow-xl',
      'lg:my-6 lg:max-h-[400px]'
    ]"
  >
    <!-- Banner content - only when banners exist -->
    <div v-if="banners.length">
      <!-- Single banner: только картинка -->
      <template v-if="banners.length === 1">
      <div 
        class="w-full h-full cursor-pointer select-none"
        @click="(event) => handleBannerClick(banners[0], event)"
        @dragstart.prevent
      >
        <img 
          :src="imageOf(banners[0])" 
          :alt="'Banner'" 
          class="w-full h-full object-cover"
          loading="lazy"
          draggable="false"
        />
      </div>
    </template>

    <!-- Multiple banners: только картинки + точки индикаторы -->
    <template v-else>
      <div 
        class="flex h-full transition-transform duration-500 ease-out touch-pan-x cursor-grab active:cursor-grabbing"
        :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
        @mousedown="onMouseDown"
        @mousemove="onMouseMove"
        @mouseup="onMouseUp"
        @mouseleave="onMouseLeave"
      >
        <div 
          v-for="(banner, index) in banners"
          :key="banner.id"
          class="relative flex-shrink-0 w-full h-full cursor-pointer select-none"
          @click="(event) => handleBannerClick(banner, event)"
          @dragstart.prevent
        >
          <img 
          :src="imageOf(banner)" 
          :alt="`Banner ${index + 1}`"
          class="w-full h-full object-cover"
          loading="lazy"
          draggable="false"
          />
        </div>
      </div>

      <!-- Точки-индикаторы -->
      <div 
        v-if="banners.length > 1"
        class="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center space-x-2"
      >
        <button
          v-for="(banner, index) in banners"
          :key="`dot-${banner.id}`"
          class="dot-indicator"
          :class="{ 'active': currentSlide === index }"
          @click="goToSlide(index)"
          :aria-label="`Перейти к баннеру ${index + 1}`"
        />
      </div>
    </template>
    </div>

  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
// Removed chevron icons - using dot indicators instead
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

const router = useRouter()
const currentSlide = ref(0)
const autoPlayTimer = ref<ReturnType<typeof setTimeout>>()

// Touch and Mouse handling
const touchStartX = ref(0)
const touchEndX = ref(0)
const isDragging = ref(false)
const mouseStartX = ref(0)
const isMouseDown = ref(false)

function imageOf(banner: Banner) {
  return (banner as any).image || (banner as any).imageUrl || ''
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

function goToSlide(index: number) {
  currentSlide.value = index
  resetAutoPlay()
}

function handleBannerClick(banner: Banner, event?: Event) {
  // Не переходим по ссылке если было перетаскивание
  if (isDragging.value) {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    return
  }
  
  // Предотвращаем стандартное поведение браузера
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  
  if ((banner as any).href) {
    const href = (banner as any).href as string
    const openInNewTab = (banner as any).openInNewTab === 1
    
    if (href.startsWith('http')) {
      // Для внешних ссылок
      if (window.Telegram?.WebApp?.openLink) {
        // В Telegram WebApp открываем через API
        window.Telegram.WebApp.openLink(href)
      } else {
        // В обычном браузере - проверяем флаг
        if (openInNewTab) {
          const result = window.open(href, '_blank', 'noopener,noreferrer')
          if (!result) {
            // Fallback: try without features
            const fallback = window.open(href, '_blank')
            // Если и fallback не сработал - ничего не делаем
            // Пользователь должен разрешить popup'ы
          }
        } else {
          window.location.href = href
        }
      }
    } else {
      // Для внутренних ссылок проверяем флаг openInNewTab
      if (openInNewTab) {
        // Открываем внутреннюю ссылку в новой вкладке
        const fullUrl = window.location.origin + href
        const result = window.open(fullUrl, '_blank', 'noopener,noreferrer')
        if (!result) {
          // Fallback: try without features
          const fallback = window.open(fullUrl, '_blank')
          // Если и fallback не сработал - ничего не делаем
        }
      } else {
        // Используем обычную навигацию Vue Router
        navigateTo(href)
      }
    }
  }
}

function navigateTo(path: string) {
  try {
    router.push(path)
  } catch (error) {
    console.error('Navigation error:', error)
    // Fallback - используем обычную навигацию
    window.location.href = path
  }
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

// Mouse handlers for desktop
function onMouseDown(e: MouseEvent) {
  e.preventDefault() // Предотвращаем перетаскивание изображения
  isMouseDown.value = true
  mouseStartX.value = e.clientX
  isDragging.value = false
  stopAutoPlay()
}

function onMouseMove(e: MouseEvent) {
  if (!isMouseDown.value) return
  
  e.preventDefault()
  isDragging.value = true
}

function onMouseUp(e: MouseEvent) {
  if (!isMouseDown.value) return
  
  const threshold = 50
  const diff = mouseStartX.value - e.clientX

  if (Math.abs(diff) > threshold) {
    if (diff > 0) {
      nextSlide()
    } else {
      previousSlide()
    }
  } else if (!isDragging.value) {
    // If not dragging, allow click through
    startAutoPlay()
  } else {
    startAutoPlay()
  }

  isMouseDown.value = false
  isDragging.value = false
}

function onMouseLeave() {
  if (isMouseDown.value) {
    isMouseDown.value = false
    isDragging.value = false
    startAutoPlay()
  }
}

onMounted(() => {
  startAutoPlay()
})

onUnmounted(() => {
  stopAutoPlay()
})
</script>

<style scoped>
/* Prevent text selection during drag */
.cursor-grab,
.cursor-grabbing {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* Dot indicators */
.dot-indicator {
  @apply w-1.5 h-1.5 rounded-full bg-white/40 hover:bg-white/60 transition-all duration-300 cursor-pointer;
  backdrop-filter: blur(4px);
}

.dot-indicator.active {
  @apply bg-white w-4 shadow-lg;
}

.dot-indicator:hover {
  @apply scale-110;
}

/* Mobile touch improvements */
@media (max-width: 640px) {
  .dot-indicator {
    @apply w-2 h-2;
  }
  
  .dot-indicator.active {
    @apply w-5;
  }
}
</style>
