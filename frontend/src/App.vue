<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ScrollToTopButton from '@/components/ScrollToTopButton.vue'
import { ShoppingCartIcon, ChatBubbleLeftRightIcon, ClockIcon, MapPinIcon } from '@heroicons/vue/24/outline'
import { useSettingsStore } from '@/stores/settings'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const router = useRouter()
const settingsStore = useSettingsStore()
const cartStore = useCartStore()

const isAdminRoute = computed(() => route.path.startsWith('/admin'))
const isProductRoute = computed(() => route.name === 'product')

const contactLink = computed(() => {
  const telegram = settingsStore.settings.manager_telegram
  return `https://t.me/${telegram}`
})

function openContact() {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light')
    if (window.Telegram.WebApp.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(contactLink.value)
      return
    }
  }
  window.open(contactLink.value, '_blank')
}

function openCart() {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light')
  }
  router.push('/cart')
}

onMounted(async () => {
  await settingsStore.fetchSettings()
  
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp
    tg.ready()
    tg.expand()
    
    document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff')
    document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000')
    document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#999999')
    document.documentElement.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color || '#2678b6')
    document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#2678b6')
    document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff')
  }
})
</script>

<template>
  <div class="min-h-screen bg-white text-brand-dark flex flex-col">
    <header
      v-if="!isAdminRoute"
      class="bg-white border-b border-gray-200 pt-6 sm:pt-8"
    >
      <div class="max-w-7xl mx-auto flex items-center justify-between px-4 pb-3 lg:px-6">
        <div class="md:hidden flex items-center">
          <button 
            @click="openContact"
            class="relative flex items-center justify-center w-10 h-10 bg-brand-dark text-white rounded-full hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 focus:ring-offset-white"
            aria-label="Связаться с нами"
          >
            <ChatBubbleLeftRightIcon class="w-5 h-5" />
          </button>
        </div>
        
        <a href="/" class="flex items-center logo-link mx-auto md:mx-0">
          <img 
            src="/logo-mobile.png" 
            alt="Толстовка" 
            class="h-6 sm:h-8 md:h-10 w-auto max-w-[60vw] sm:max-w-none object-contain"
            loading="lazy"
          />
        </a>
        
        <div class="flex items-center gap-2">
          <button 
            @click="openCart"
            class="relative flex items-center justify-center w-10 h-10 bg-brand-dark text-white rounded-full hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 focus:ring-offset-white"
            aria-label="Корзина"
          >
            <ShoppingCartIcon class="w-5 h-5" />
            <span 
              v-if="cartStore.itemsCount > 0"
              class="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold bg-red-500 text-white rounded-full"
            >
              {{ cartStore.itemsCount }}
            </span>
          </button>
          
          <button 
            @click="openContact"
            class="hidden md:flex items-center px-3 py-2 bg-brand-dark text-white rounded-lg text-sm font-primary font-semibold hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 focus:ring-offset-white"
          >
            Связаться с нами
          </button>
        </div>
      </div>
    </header>
    
    <main class="flex-1 flex flex-col">
      <RouterView />
    </main>

    <footer
      v-if="!isAdminRoute"
      class="bg-white border-t border-gray-100"
    >
      <div class="max-w-7xl mx-auto px-4 py-6 text-sm font-primary space-y-2 text-center md:text-left">
        <div class="flex flex-col items-center gap-2 text-brand-primary md:flex-row md:gap-4 md:text-brand-primary">
          <span class="inline-flex items-center gap-2">
            <ClockIcon class="w-4 h-4" />
            Работаем каждый день с 12-00 до 20-00
          </span>
          <span class="inline-flex items-center gap-2">
            <MapPinIcon class="w-4 h-4" />
            Калининград, ул. Комсомольская, 17
          </span>
        </div>
      </div>
    </footer>
    
    <ScrollToTopButton v-if="!isAdminRoute && !isProductRoute" />
  </div>
</template>

<style>
:root {
  --tg-theme-bg-color: #ffffff;
  --tg-theme-text-color: #000000;
  --tg-theme-hint-color: #999999;
  --tg-theme-link-color: #2678b6;
  --tg-theme-button-color: #2678b6;
  --tg-theme-button-text-color: #ffffff;
}

html, body, #app {
  margin: 0;
  padding: 0;
  min-height: 100%;
}

.logo-link {
  outline: none !important;
  -webkit-tap-highlight-color: transparent;
}

.logo-link:focus,
.logo-link:active {
  outline: none !important;
  box-shadow: none !important;
}
</style>
