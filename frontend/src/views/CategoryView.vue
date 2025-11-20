<template>
  <div class="min-h-screen bg-white tg-safe-area">
    <main class="container-safe pb-20 pt-4">
      <div class="bg-brand-dark text-white rounded-3xl overflow-hidden">
        <!-- Header -->
        <header class="sticky top-0 z-50 bg-brand-dark border-b-2 border-brand-primary">
          <div class="flex items-center space-x-3 px-4 py-3">
            <!-- Back button -->
            <button
              @click="$router.back()"
              class="flex items-center gap-1 px-3 py-1.5 bg-brand-primary text-brand-dark rounded-full hover:bg-brand-primary/90 transition-colors flex-shrink-0"
              aria-label="Назад"
            >
              <ArrowLeftIcon class="w-4 h-4" />
              <span class="text-xs font-semibold uppercase tracking-wide">назад</span>
            </button>
            
            <h1 class="text-lg font-semibold flex items-center gap-2">
              <span>{{ category?.name || 'Категория' }}</span>
              <span class="text-sm text-white/70">({{ totalForCategory }})</span>
            </h1>
            <div class="ml-auto relative">
              <button
                class="flex items-center space-x-2 px-3 py-2 bg-brand-primary text-brand-dark rounded-full border-2 border-brand-dark text-gray-700"
                @click="showSortMenu = !showSortMenu"
              >
                <span class="text-sm text-gray-700">{{ sortLabels[catalogStore.sortBy] }}</span>
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
                  class="absolute right-0 top-full mt-2 w-48 bg-white border-2 border-brand-dark rounded-xl z-10 text-brand-dark"
                >
                  <button
                    v-for="(label, key) in sortLabels"
                    :key="key"
                    class="block w-full px-4 py-2 text-left text-sm hover:bg-brand-primary/10 first:rounded-t-lg last:rounded-b-lg transition-colors text-gray-600"
                    :class="{ 'text-brand-dark font-medium': catalogStore.sortBy === key }"
                    @click="selectSort(key as SortOption)"
                  >
                    {{ label }}
                  </button>
                </div>
              </Transition>
            </div>
          </div>
        </header>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-brand-primary border-t-transparent"></div>
        </div>

        <!-- Error -->
        <div v-else-if="error || catalogStore.error" class="flex flex-col items-center justify-center py-16 text-center px-6">
          <ExclamationTriangleIcon class="w-12 h-12 text-brand-primary mb-4" />
          <h2 class="text-xl font-semibold mb-2">Категория недоступна</h2>
          <p class="text-white/80 mb-6">{{ error || catalogStore.error }}</p>
          <router-link 
            to="/"
            class="px-4 py-2 bg-brand-primary text-brand-dark rounded-lg border-2 border-brand-dark"
          >
            На главную
          </router-link>
        </div>

        <!-- Content -->
        <div v-else class="space-y-6 pb-6">
          <div class="px-4" v-if="catalogStore.availableSizes.length">
            <SizeFilter
              :sizes="catalogStore.availableSizes"
              :active-size="catalogStore.activeSize"
              :preset-label="catalogStore.sizePreset?.label || 'Размеры'"
              @change="catalogStore.setActiveSize"
            />
          </div>

          <!-- Products grid -->
          <section class="px-4">
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <!-- Loading skeletons -->
              <div
                v-if="catalogStore.isLoading && !catalogStore.products.length"
                v-for="n in 8"
                :key="`skeleton-${n}`"
                class="rounded-2xl aspect-[3/4] border-2 border-white/20 bg-white/10 animate-pulse"
              />

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
              class="flex-center flex-col space-y-4 py-12 text-white/80"
            >
              <div class="w-16 h-16 bg-white/10 rounded-full flex-center">
                <ShoppingBagIcon class="w-8 h-8 text-white/60" />
              </div>
              <div class="text-center">
                <h3 class="text-lg font-medium mb-2">Товаров не найдено</h3>
                <p>Попробуйте выбрать другую категорию</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'
import { useCatalogStore, type SortOption } from '@/stores/catalog'
import ProductCard from '@/components/ProductCard.vue'
import SizeFilter from '@/components/SizeFilter.vue'
import { 
  ExclamationTriangleIcon,
  ShoppingBagIcon,
  ChevronDownIcon,
  ArrowLeftIcon
} from '@heroicons/vue/24/outline'

interface Props { slug: string }
const props = defineProps<Props>()

const catalogStore = useCatalogStore()

const loading = ref(false)
const error = ref('')
const showSortMenu = ref(false)

const sortLabels: Record<SortOption, string> = {
  price_asc: 'Цена ↑',
  price_desc: 'Цена ↓'
  // newest: 'Новые',
  // oldest: 'Старые'
}

const category = computed(() => 
  catalogStore.categories.find(cat => cat.slug === props.slug) || null
)

const productsForCategory = computed(() => catalogStore.filteredProducts)

const totalForCategory = computed(() => catalogStore.filteredProducts.length)

function selectSort(sortOption: SortOption) {
  catalogStore.setSortBy(sortOption)
  showSortMenu.value = false
}

async function ensureDataForSlug(slug: string) {
  loading.value = true
  error.value = ''
  try {
    // Инициализируем данные каталога если они не загружены
    if (!catalogStore.categories.length) {
      console.log('[CategoryView] Initializing catalog data')
      await catalogStore.initialize()
    }
    
    const exists = catalogStore.categories.some(c => c.slug === slug)
    if (!exists) {
      error.value = 'Запрошенная категория не существует или была удалена.'
      return
    }
    await catalogStore.setActiveCategory(slug) // дождаться загрузки
  } catch (err) {
    console.error('[CategoryView] Error loading category data:', err)
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
