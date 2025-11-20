<template>
  <div class="product-search">
    <div class="search-container">
      <MagnifyingGlassIcon class="search-icon" />
      <input
        ref="searchInput"
        v-model="localQuery"
        type="text"
        placeholder="Поиск товаров..."
        class="search-input font-primary"
        @input="handleInput"
        @keydown.escape="clearSearch"
        inputmode="search"
      />
      <button
        v-if="localQuery"
        class="search-clear"
        @click="clearSearch"
        aria-label="Очистить поиск"
      >
        <XMarkIcon class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { useCatalogStore } from '@/stores/catalog'

const catalogStore = useCatalogStore()
const localQuery = ref('')
const searchInput = ref<HTMLInputElement>()
let debounceTimeout: ReturnType<typeof setTimeout> | null = null

function handleInput() {
  // Clear previous timeout
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }
  
  // Set new timeout
  debounceTimeout = setTimeout(() => {
    catalogStore.searchProducts(localQuery.value)
  }, 500)
}

function clearSearch() {
  localQuery.value = ''
  catalogStore.clearSearch()
  searchInput.value?.focus()
}
</script>

<style scoped>
/* Global constraints to prevent overflow */
.product-search * {
  box-sizing: border-box;
  max-width: 100%;
}

.product-search {
  @apply mb-4;
}

.search-container {
  @apply relative flex items-center;
}

.search-input {
  @apply w-full pl-10 pr-10 py-3 bg-white rounded-xl transition-all duration-200 text-base;
  font-family: var(--font-primary);
  font-weight: 600;
  color: #383b3d;
  box-sizing: border-box;
  border: 2px solid #383b3d;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.search-input::placeholder {
  @apply text-gray-400;
  font-weight: 500;
}

.search-input:hover {
  @apply bg-brand-primary/10;
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.search-input:focus {
  @apply outline-none bg-white;
  border: 2px solid #383b3d;
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.search-icon {
  @apply absolute w-5 h-5 text-gray-400 pointer-events-none;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
}

.search-clear {
  @apply absolute p-1 hover:bg-gray-100 rounded-full transition-colors duration-200 text-gray-400 hover:text-brand-dark;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
}
</style>

