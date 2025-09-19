<script setup lang="ts">
import { onMounted } from 'vue'

// Telegram WebApp initialization
onMounted(() => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp
    tg.ready()
    tg.expand()
    
    // Apply Telegram theme colors
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
  <div id="app" class="min-h-screen bg-brand-primary text-brand-dark">
    <RouterView />
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

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--tg-theme-bg-color);
  color: var(--tg-theme-text-color);
}

#app {
  width: 100%;
  min-height: 100vh;
}
</style>
