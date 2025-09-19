<template>
  <div class="min-h-screen bg-brand-primary tg-safe-area">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-brand-primary/95 backdrop-blur-telegram border-b border-brand-dark/10">
      <div class="flex items-center space-x-3 px-4 py-3">
        <button @click="$router.go(-1)" class="p-2 hover:bg-brand-dark/10 rounded-full">
          <ArrowLeftIcon class="w-5 h-5 text-brand-dark" />
        </button>
        <h1 class="text-lg font-semibold text-brand-dark">{{ category?.name || 'Категория' }}</h1>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-brand-dark border-t-transparent"></div>
    </div>

    <!-- Error / Not Found State -->
    <div v-else-if="error" class="flex flex-col items-center justify-center py-16 text-center px-6">
      <ExclamationTriangleIcon class="w-12 h-12 text-red-500 mb-4" />
      <h2 class="text-xl font-semibold text-brand-dark mb-2">Категория не найдена</h2>
      <p class="text-brand-dark/70 mb-6">{{ error }}</p>
      <router-link 
        to="/"
        class="px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-dark/90 transition-colors"
      >
        На главную
      </router-link>
    </div>

    <!-- Content -->
    <main v-else class="container-safe space-y-6 pb-20">
      <!-- Section header with sort -->
      <section class="px-4">
        <div class="flex-between mb-4">
          <div class="flex items-center space-x-2">
            <h2 class="text-lg font-semibold text-brand-dark">
              {{ category?.name || 'Категория' }}
            </h2>
            <span class="text-sm text-gray-600" v-if="totalForCategory !== null">
              ({{ totalForCategory }})
            </span>
          </div>

          <div class="relative">
            <button
              class="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg border border-gray-300 hover:border-brand-dark transition-colors"
              @click="showSortMenu = !showSortMenu"
            >
              <span class="text-sm">{{ sortLabels[catalogStore.sortBy] }}</span>
              <ChevronDownIcon class="w-4 h-4" />
            </button>

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
      </section>

      <!-- Products grid -->
      <section class="px-4">
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

          <!-- Cards -->
          <ProductCard
            v-for="product in productsForCategory"
            :key="product.id"
            :product="product"
            @click="$router.push({ name: 'product', params: { id: product.id } })"
          />
        </div>

        <!-- Empty state -->
        <div
          v-if="!catalogStore.isLoading && !productsForCategory.length"
          class="flex-center flex-col space-y-4 py-12"
        >
          <div class="w-16 h-16 bg-gray-100 rounded-full flex-center">
            <ShoppingBagIcon class="w-8 h-8 text-gray-400" />
          </div>
          <div class="text-center">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Товаров не найдено</h3>
            <p class="text-gray-500">Попробуйте выбрать другую категорию</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'
import { useCatalogStore, type SortOption } from '@/stores/catalog'
import ProductCard from '@/components/ProductCard.vue'
import { 
  ArrowLeftIcon, 
  ExclamationTriangleIcon,
  ShoppingBagIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline'

interface Props { slug: string }
const props = defineProps<Props>()

const catalogStore = useCatalogStore()

const loading = ref(false)
const error = ref('')
const showSortMenu = ref(false)

const sortLabels: Record<SortOption, string> = {
  price_asc: 'Цена ↑',
  price_desc: 'Цена ↓',
  newest: 'Новые',
  oldest: 'Старые'
}

const category = computed(() => 
  catalogStore.categories.find(cat => cat.slug === props.slug) || null
)

const productsForCategory = computed(() => {
  // store.filteredProducts уже учитывает activeCategory (slug)
  return catalogStore.filteredProducts
})

const totalForCategory = computed(() => catalogStore.totalProducts)

function selectSort(sortOption: SortOption) {
  catalogStore.setSortBy(sortOption)
  showSortMenu.value = false
}

async function ensureDataForSlug(slug: string) {
  loading.value = true
  error.value = ''
  try {
    if (!catalogStore.categories.length) {
      await catalogStore.fetchCategories()
    }
    const exists = catalogStore.categories.some(c => c.slug === slug)
    if (!exists) {
      error.value = 'Запрошенная категория не существует или была удалена.'
      return
    }
    catalogStore.setActiveCategory(slug) // вызовет fetchProducts()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Не удалось загрузить товары'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  ensureDataForSlug(props.slug)
})

onBeforeRouteUpdate((to) => {
  const slug = to.params.slug as string
  ensureDataForSlug(slug)
})
</script>
