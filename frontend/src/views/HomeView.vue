<template>
  <div class="tg-safe-area">
    <!-- Banner Carousel -->
    <BannerCarousel 
      v-if="catalogStore.banners.length > 0"
      :banners="catalogStore.banners"
    />

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

      <!-- Categories -->
      <section class="px-4">
        <h2 class="font-primary text-lg font-semibold text-brand-dark uppercase tracking-wide mb-4">
          Категории
        </h2>
        
        <CategorySelector />
      </section>

      <!-- Products section -->
      <section class="px-4">
        <!-- Section header -->
        <div class="flex-between mb-4">
          <div class="flex items-center space-x-2">
            <h2 class="font-primary text-lg font-semibold text-brand-dark uppercase tracking-wide">
              {{ catalogStore.activeCategoryName }}
            </h2>
            <span class="font-primary text-sm text-gray-500">
              ({{ catalogStore.filteredProducts.length }})
            </span>
          </div>

          <!-- Sort button -->
          <div class="relative">
            <button
              class="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg border border-gray-300 hover:border-brand-dark transition-colors font-primary text-gray-600"
              @click="showSortMenu = !showSortMenu"
            >
              <span class="text-sm font-primary text-gray-600">{{ sortLabels[catalogStore.sortBy] }}</span>
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
                  class="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors font-primary text-gray-600"
                  :class="{ 'text-brand-dark font-medium': catalogStore.sortBy === key }"
                  @click="selectSort(key as SortOption)"
                >
                  {{ label }}
                </button>
              </div>
            </Transition>
          </div>
        </div>

        <SizeFilter
          v-if="catalogStore.availableSizes.length"
          :sizes="catalogStore.availableSizes"
          :active-size="catalogStore.activeSize"
          :preset-label="catalogStore.sizePreset?.label || 'Размеры'"
          class="mb-4"
          @change="catalogStore.setActiveSize"
        />

        <!-- Products grid -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
          />
        </div>

        <!-- Load more button -->
        <div
          v-if="catalogStore.hasMore && catalogStore.products.length"
          class="flex-center mt-6"
        >
          <button
            class="btn-tolstovka"
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
            <h3 class="font-display text-lg font-normal text-brand-dark mb-2">Товаров не найдено</h3>
            <p class="font-primary text-sm text-gray-500">
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
  XMarkIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  ShoppingBagIcon,
  CogIcon,
  UserIcon
} from '@heroicons/vue/24/outline'

import { useCatalogStore, type SortOption, type Product } from '@/stores/catalog'
import BannerCarousel from '@/components/BannerCarousel.vue'
import ProductCard from '@/components/ProductCard.vue'
import CategorySelector from '@/components/CategorySelector.vue'
import SizeFilter from '@/components/SizeFilter.vue'

const catalogStore = useCatalogStore()
const router = useRouter()

const showBackButton = ref(false)
const showSortMenu = ref(false)

const sortLabels: Record<SortOption, string> = {
  price_asc: 'Цена ↑',
  price_desc: 'Цена ↓'
  // newest: 'Новые',
  // oldest: 'Старые'
}

// Methods

function selectSort(sortOption: SortOption) {
  catalogStore.setSortBy(sortOption)
  showSortMenu.value = false
}

function openProduct(product: Product) {
  // Мгновенно показываем карточку, затем фоново догружаем с сервера
  catalogStore.currentProduct = product
  router.push({ name: 'product', params: { id: product.id } })
  catalogStore.fetchProduct(product.id)
}

// Category navigation now handled by CategorySelector component

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
