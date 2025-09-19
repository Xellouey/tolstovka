<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <div class="sticky top-0 bg-white shadow-sm px-4 py-3 flex items-center justify-between z-10">
      <button @click="$router.go(-1)" class="p-2 hover:bg-gray-100 rounded-full">
        <ArrowLeftIcon class="w-5 h-5" />
      </button>
      <button @click="toggleFavorite" class="p-2 hover:bg-gray-100 rounded-full">
        <HeartIcon 
          :class="[
            'w-5 h-5 transition-colors',
            isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'
          ]" 
        />
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex flex-col items-center justify-center py-12 text-center">
      <ExclamationTriangleIcon class="w-12 h-12 text-red-500 mb-4" />
      <h2 class="text-lg font-semibold text-gray-900 mb-2">Product Not Found</h2>
      <p class="text-gray-600 mb-4">{{ error }}</p>
      <button @click="$router.go(-1)" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
        Go Back
      </button>
    </div>

    <!-- Product Details -->
    <div v-else-if="product" class="pb-24">
      <!-- Product Image -->
      <div class="relative">
        <img 
          :src="product.image_url || `https://placehold.co/400x300/e5e7eb/6b7280?text=${encodeURIComponent(product.name)}`"
          :alt="product.name"
          class="w-full h-64 object-cover bg-gray-100"
          @error="handleImageError"
        />
        <div v-if="!product.is_available" class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Out of Stock
          </span>
        </div>
      </div>

      <!-- Product Info -->
      <div class="p-4">
        <div class="flex items-start justify-between mb-2">
          <h1 class="text-xl font-bold text-gray-900 flex-1">{{ product.name }}</h1>
          <span class="text-xl font-bold text-brand-dark ml-4">{{ formatPrice(product.priceRub) }}</span>
        </div>

        <p v-if="product.description" class="text-gray-600 mb-4 leading-relaxed">
          {{ product.description }}
        </p>

        <!-- Category -->
        <div class="flex items-center space-x-2 mb-4">
          <TagIcon class="w-4 h-4 text-gray-400" />
          <router-link 
            v-if="category"
            :to="`/category/${category.id}`"
            class="text-sm text-blue-600 hover:underline"
          >
            {{ category.name }}
          </router-link>
        </div>

        <!-- Quantity Selector -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
          <div class="flex items-center space-x-3">
            <button 
              @click="decreaseQuantity"
              :disabled="quantity <= 1"
              class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MinusIcon class="w-4 h-4" />
            </button>
            <span class="text-lg font-medium min-w-[2rem] text-center">{{ quantity }}</span>
            <button 
              @click="increaseQuantity"
              class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
            >
              <PlusIcon class="w-4 h-4" />
            </button>
          </div>
          <p class="text-sm text-gray-500 mt-1">
            Total: ${{ (product.price * quantity).toFixed(2) }}
          </p>
        </div>

        <!-- Additional Info -->
        <div class="space-y-3 text-sm text-gray-600">
          <div class="flex items-center space-x-2">
            <ClockIcon class="w-4 h-4" />
            <span>Added {{ formatDate(product.created_at) }}</span>
          </div>
          
          <div v-if="product.is_available" class="flex items-center space-x-2">
            <CheckCircleIcon class="w-4 h-4 text-green-500" />
            <span class="text-green-600">Available now</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Action Bar -->
    <div v-if="product" class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div class="flex space-x-3">
        <button
          @click="showPurchaseModal"
          :disabled="!product.is_available"
          :class="[
            'flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2',
            product.is_available
              ? 'bg-brand-dark text-white hover:bg-brand-dark/90'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          ]"
        >
          <ShoppingCartIcon class="w-5 h-5" />
          <span>Купить</span>
        </button>
      </div>
    </div>

    <!-- Purchase Modal -->
    <PurchaseModal
      :is-open="showModal"
      :product="product"
      @close="showModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCatalogStore } from '@/stores/catalog'
import PurchaseModal from '@/components/PurchaseModal.vue'
import { 
  ArrowLeftIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  TagIcon,
  MinusIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  ShoppingCartIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const catalogStore = useCatalogStore()

const loading = ref(false)
const error = ref('')
const quantity = ref(1)
const isFavorite = ref(false)
const showModal = ref(false)

const productId = computed(() => parseInt(route.params.id as string))
const product = computed(() => 
  catalogStore.products.find(p => p.id === productId.value)
)
const category = computed(() => 
  product.value ? catalogStore.categories.find(cat => cat.id === product.value!.category_id) : null
)

const decreaseQuantity = () => {
  if (quantity.value > 1) quantity.value--
}

const increaseQuantity = () => {
  quantity.value++
}

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
  // TODO: Sync with backend
}

const showPurchaseModal = () => {
  if (!product.value || !product.value.is_available) return
  
  showModal.value = true
  
  // Trigger haptic feedback if in Telegram
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('medium')
  }
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = `https://placehold.co/400x300/e5e7eb/6b7280?text=${encodeURIComponent(product.value?.name || 'Product')}`
}

function formatPrice(price: number): string {
  return `${price.toLocaleString('ru-RU')} ₽`
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
  return date.toLocaleDateString()
}

const loadProduct = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // Load products if not already loaded
    if (catalogStore.products.length === 0) {
      await catalogStore.fetchProducts()
    }
    
    // Load categories if not already loaded
    if (catalogStore.categories.length === 0) {
      await catalogStore.fetchCategories()
    }
    
    // Check if product exists
    if (!product.value) {
      error.value = 'Product not found'
      return
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load product'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProduct()
})
</script>