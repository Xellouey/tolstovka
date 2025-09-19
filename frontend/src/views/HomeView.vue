<template>
  <div class="min-h-screen bg-brand-primary tg-safe-area">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-brand-primary/95 backdrop-blur-telegram border-b border-brand-dark/10">
      <div class="flex-between px-4 py-3">
        <!-- Back button (hidden initially) -->
        <button 
          v-show="showBackButton"
          class="flex items-center space-x-2 text-brand-dark hover:text-brand-dark/80 transition-colors"
          @click="goBack"
        >
          <ArrowLeftIcon class="w-5 h-5" />
          <span class="font-medium">Назад</span>
        </button>
        
        <!-- Logo -->
        <h1 class="text-xl font-bold text-brand-dark tracking-tight">
          TOLSOVKA
        </h1>
        
        <!-- Search button -->
        <button 
          class="p-2 rounded-full hover:bg-brand-dark/10 transition-colors"
          @click="toggleSearch"
        >
          <MagnifyingGlassIcon class="w-6 h-6 text-brand-dark" />
        </button>
      </div>

      <!-- Search bar -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="showSearch" class="px-4 pb-3">
          <div class="relative">
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              placeholder="Поиск товаров..."
              class="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-gray-200 focus:border-brand-dark focus:ring-2 focus:ring-brand-dark/20 focus:outline-none transition-colors"
              @keyup.enter="performSearch"
            />
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <button
              v-if="searchQuery"
              class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              @click="clearSearch"
            >
              <XMarkIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </Transition>
    </header>

    <main class="container-safe space-y-6 pb-20">
      <!-- Error message -->
      <div
        v-if="catalogStore.error"
        class="mx-4 p-4 bg-red-100 border border-red-300 rounded-xl"
      >
        <div class="flex items-center space-x-2">
          <ExclamationTriangleIcon class="w-5 h-5 text-red-600" />
          <span class="text-red-800">{{ catalogStore.error }}</span>
        </div>
        <button
          class="mt-2 btn-secondary text-sm"
          @click="catalogStore.clearError"
        >
          Закрыть
        </button>
      </div>

      <!-- Banner Carousel -->
      <div class="px-4">
        <BannerCarousel 
          :banners="catalogStore.banners"
          :isLoading="catalogStore.isLoading && !catalogStore.banners.length"
        />
      </div>

      <!-- Categories -->
      <section class="px-4">
        <h2 class="text-sm font-semibold text-brand-dark/70 uppercase tracking-wider mb-3">
          Категории
        </h2>
        
        <div class="flex space-x-3 overflow-x-auto scrollbar-hide pb-2">
          <!-- All categories chip -->
          <button
            class="flex-shrink-0 px-4 py-2 rounded-full border transition-colors"
            :class="!catalogStore.activeCategory 
              ? 'bg-brand-dark text-white border-brand-dark' 
              : 'bg-white text-brand-dark border-gray-300 hover:border-brand-dark'"
            @click="catalogStore.setActiveCategory(null)"
          >
            Все товары
          </button>
          
          <!-- Category chips -->
          <button
            v-for="category in catalogStore.categories"
            :key="category.id"
            class="flex-shrink-0 px-4 py-2 rounded-full border transition-colors whitespace-nowrap"
            :class="catalogStore.activeCategory === category.slug
              ? 'bg-brand-dark text-white border-brand-dark' 
              : 'bg-white text-brand-dark border-gray-300 hover:border-brand-dark'"
            @click="catalogStore.setActiveCategory(category.slug)"
          >
            {{ category.name }}
          </button>
        </div>
      </section>

      <!-- Products section -->
      <section class="px-4">
        <!-- Section header -->
        <div class="flex-between mb-4">
          <div class="flex items-center space-x-2">
            <h2 class="text-lg font-semibold text-brand-dark">
              {{ catalogStore.activeCategoryName }}
            </h2>
            <span class="text-sm text-gray-500">
              ({{ catalogStore.totalProducts }})
            </span>
          </div>

          <!-- Sort button -->
          <div class="relative">
            <button
              class="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg border border-gray-300 hover:border-brand-dark transition-colors"
              @click="showSortMenu = !showSortMenu"
            >
              <span class="text-sm">{{ sortLabels[catalogStore.sortBy] }}</span>
              <ChevronDownIcon class="w-4 h-4" />
            </button>

            <!-- Sort menu -->
            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <div
                v-if="showSortMenu"
                class="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10"
              >
                <button
                  v-for="(label, key) in sortLabels"
                  :key="key"
                  class="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                  :class="{ 'text-brand-dark font-medium': catalogStore.sortBy === key }"
                  @click="selectSort(key as SortOption)"
                >
                  {{ label }}
                </button>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Products grid -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <!-- Loading skeletons -->
          <div
            v-if="catalogStore.isLoading && !catalogStore.products.length"
            v-for="n in 8"
            :key="`skeleton-${n}`"
            class="card-base aspect-product animate-pulse"
          >
            <div class="skeleton-base h-full" />
          </div>

          <!-- Product cards -->
          <ProductCard
            v-for="product in catalogStore.filteredProducts"
            :key="product.id"
            :product="product"
            @click="openProduct"
            @quick-add="handleQuickAdd"
          />
        </div>

        <!-- Load more button -->
        <div
          v-if="catalogStore.hasMore && catalogStore.products.length"
          class="flex-center mt-6"
        >
          <button
            class="btn-primary"
            :disabled="catalogStore.isLoading"
            @click="catalogStore.loadMoreProducts()"
          >
            {{ catalogStore.isLoading ? 'Загружаем...' : 'Показать ещё' }}
          </button>
        </div>

        <!-- Empty state -->
        <div
          v-if="!catalogStore.isLoading && !catalogStore.products.length"
          class="flex-center flex-col space-y-4 py-12"
        >
          <div class="w-16 h-16 bg-gray-100 rounded-full flex-center">
            <ShoppingBagIcon class="w-8 h-8 text-gray-400" />
          </div>
          <div class="text-center">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Товаров не найдено</h3>
            <p class="text-gray-500">
              {{ catalogStore.searchQuery 
                ? 'Попробуйте изменить поисковый запрос' 
                : 'Попробуйте выбрать другую категорию' }}
            </p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  ShoppingBagIcon
} from '@heroicons/vue/24/outline'

import { useCatalogStore, type SortOption, type Product } from '@/stores/catalog'
import BannerCarousel from '@/components/BannerCarousel.vue'
import ProductCard from '@/components/ProductCard.vue'

const catalogStore = useCatalogStore()
const router = useRouter()

const showBackButton = ref(false)
const showSearch = ref(false)
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement>()
const showSortMenu = ref(false)

const sortLabels: Record<SortOption, string> = {
  price_asc: 'Цена ↑',
  price_desc: 'Цена ↓',
  newest: 'Новые',
  oldest: 'Старые'
}

// Methods
async function toggleSearch() {
  showSearch.value = !showSearch.value
  if (showSearch.value) {
    await nextTick()
    searchInput.value?.focus()
  } else {
    clearSearch()
  }
}

function clearSearch() {
  searchQuery.value = ''
  catalogStore.clearSearch()
}

function performSearch() {
  if (searchQuery.value.trim()) {
    catalogStore.searchProducts(searchQuery.value)
  }
}

function selectSort(sortOption: SortOption) {
  catalogStore.setSortBy(sortOption)
  showSortMenu.value = false
}

function openProduct(product: Product) {
  router.push(`/product/${product.id}`)
}

function handleQuickAdd(product: Product) {
  // Quick add to cart functionality
  console.log('Quick add:', product)
  
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light')
  }
}

function goBack() {
  router.go(-1)
}

// Close dropdowns when clicking outside
function handleClickOutside(event: Event) {
  const target = event.target as Element
  if (!target.closest('.relative')) {
    showSortMenu.value = false
  }
}

onMounted(async () => {
  // Initialize catalog data
  await catalogStore.initialize()
  
  // Add click outside listener
  document.addEventListener('click', handleClickOutside)
  
  // Initialize Telegram WebApp
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready()
    window.Telegram.WebApp.expand()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>