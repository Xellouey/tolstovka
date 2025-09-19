import 'virtual:uno.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Initialize Telegram WebApp
if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
  window.Telegram.WebApp.ready()
  window.Telegram.WebApp.expand()
  
  // Set theme colors
  const themeParams = window.Telegram.WebApp.themeParams
  if (themeParams) {
    document.documentElement.style.setProperty('--tg-bg-color', themeParams.bg_color || '#ffffff')
    document.documentElement.style.setProperty('--tg-text-color', themeParams.text_color || '#000000')
    document.documentElement.style.setProperty('--tg-hint-color', themeParams.hint_color || '#999999')
    document.documentElement.style.setProperty('--tg-link-color', themeParams.link_color || '#3390ec')
    document.documentElement.style.setProperty('--tg-button-color', themeParams.button_color || '#3390ec')
    document.documentElement.style.setProperty('--tg-button-text-color', themeParams.button_text_color || '#ffffff')
  }
}

// Register Service Worker
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('SW registered:', registration)
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available, notify user
              console.log('New content available, will refresh on next visit')
            }
          })
        }
      })
    } catch (error) {
      console.warn('SW registration failed:', error)
    }
  })
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
