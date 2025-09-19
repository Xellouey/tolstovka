<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm px-4 py-3 flex items-center space-x-3">
      <button @click="$router.go(-1)" class="p-2 hover:bg-gray-100 rounded-full">
        <ArrowLeftIcon class="w-5 h-5" />
      </button>
      <h1 class="text-lg font-semibold">{{ category?.name || 'Category' }}</h1>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex flex-col items-center justify-center py-12 text-center">
      <ExclamationTriangleIcon class="w-12 h-12 text-red-500 mb-4" />
      <h2 class="text-lg font-semibold text-gray-900 mb-2">Error Loading Category</h2>
      <p class="text-gray-600 mb-4">{{ error }}</p>
      <button @click="loadCategoryProducts" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
        Try Again
      </button>
    </div>

    <!-- Products Grid -->
    <div v-else class="p-4">
      <!-- Filters -->
      <div class="mb-4 flex flex-wrap gap-2">
        <button
          v-for="filter in filters"
          :key="filter.value"
          @click="activeFilter = filter.value"
          :class="[
            'px-3 py-1 rounded-full text-sm transition-colors',
            activeFilter === filter.value
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          ]"
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- Sort Options -->
      <div class="mb-4 flex items-center justify-between">
        <p class="text-sm text-gray-600">{{ filteredProducts.length }} products</p>
        <select v-model="sortBy" class="px-3 py-1 border rounded-lg text-sm bg-white">
          <option value="name">Sort by Name</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="newest">Newest First</option>
        </select>
      </div>

      <!-- Products Grid -->
      <div v-if="filteredProducts.length > 0" class="grid grid-cols-2 gap-4">
        <ProductCard
          v-for="product in sortedProducts"
          :key="product.id"
          :product="product"
          @click="$router.push(`/product/${product.id}`)"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center py-12 text-center">
        <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <ShoppingBagIcon class="w-8 h-8 text-gray-400" />
        </div>
        <h2 class="text-lg font-semibold text-gray-900 mb-2">No Products Found</h2>
        <p class="text-gray-600">This category doesn't have any products yet.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCatalogStore } from '@/stores/catalog'
import ProductCard from '@/components/ProductCard.vue'
import { 
  ArrowLeftIcon, 
  ExclamationTriangleIcon,
  ShoppingBagIcon 
} from '@heroicons/vue/24/outline'

const route = useRoute()
const catalogStore = useCatalogStore()

const loading = ref(false)
const error = ref('')
const activeFilter = ref('all')
const sortBy = ref('name')

const categoryId = computed(() => parseInt(route.params.id as string))
const category = computed(() => 
  catalogStore.categories.find(cat => cat.id === categoryId.value)
)

const products = computed(() => 
  catalogStore.products.filter(product => product.category_id === categoryId.value)
)

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Available', value: 'available' },
  { label: 'New', value: 'new' }
]

const filteredProducts = computed(() => {
  let filtered = products.value

  switch (activeFilter.value) {
    case 'available':
      filtered = filtered.filter(p => p.is_available)
      break
    case 'new':
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      filtered = filtered.filter(p => new Date(p.created_at) > weekAgo)
      break
  }

  return filtered
})

const sortedProducts = computed(() => {
  const sorted = [...filteredProducts.value]

  switch (sortBy.value) {
    case 'price_low':
      return sorted.sort((a, b) => a.price - b.price)
    case 'price_high':
      return sorted.sort((a, b) => b.price - a.price)
    case 'newest':
      return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    case 'name':
    default:
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
  }
})

const loadCategoryProducts = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // Load products if not already loaded
    if (catalogStore.products.length === 0) {
      await catalogStore.fetchProducts()
    }
    
    // Check if category exists
    if (!category.value) {
      error.value = 'Category not found'
      return
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load products'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCategoryProducts()
})
</script>