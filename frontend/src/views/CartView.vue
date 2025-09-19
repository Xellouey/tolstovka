<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm px-4 py-3 flex items-center space-x-3">
      <button @click="$router.go(-1)" class="p-2 hover:bg-gray-100 rounded-full">
        <ArrowLeftIcon class="w-5 h-5" />
      </button>
      <h1 class="text-lg font-semibold">Cart</h1>
      <div class="flex-1"></div>
      <button 
        v-if="cartItems.length > 0"
        @click="clearCart" 
        class="text-sm text-red-600 hover:text-red-700"
      >
        Clear All
      </button>
    </div>

    <!-- Empty Cart -->
    <div v-if="cartItems.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
      <div class="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
        <ShoppingCartIcon class="w-10 h-10 text-gray-400" />
      </div>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
      <p class="text-gray-600 mb-6">Add some items to get started</p>
      <router-link 
        to="/"
        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Start Shopping
      </router-link>
    </div>

    <!-- Cart Items -->
    <div v-else class="p-4 pb-32">
      <div class="space-y-4">
        <div 
          v-for="item in cartItems" 
          :key="item.product.id"
          class="bg-white rounded-lg p-4 shadow-sm"
        >
          <div class="flex space-x-3">
            <!-- Product Image -->
            <div class="w-16 h-16 flex-shrink-0">
              <img 
                :src="item.product.image_url || `https://placehold.co/100x100/e5e7eb/6b7280?text=${encodeURIComponent(item.product.name)}`"
                :alt="item.product.name"
                class="w-full h-full object-cover rounded-lg bg-gray-100"
                @error="handleImageError"
              />
            </div>

            <!-- Product Info -->
            <div class="flex-1 min-w-0">
              <h3 
                class="font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                @click="$router.push(`/product/${item.product.id}`)"
              >
                {{ item.product.name }}
              </h3>
              <p class="text-sm text-gray-600">${{ item.product.price.toFixed(2) }} each</p>
              
              <!-- Quantity Controls -->
              <div class="flex items-center space-x-3 mt-2">
                <button 
                  @click="updateQuantity(item.product.id, item.quantity - 1)"
                  :disabled="item.quantity <= 1"
                  class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MinusIcon class="w-4 h-4" />
                </button>
                <span class="font-medium min-w-[2rem] text-center">{{ item.quantity }}</span>
                <button 
                  @click="updateQuantity(item.product.id, item.quantity + 1)"
                  class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                >
                  <PlusIcon class="w-4 h-4" />
                </button>
                <button 
                  @click="removeItem(item.product.id)"
                  class="ml-2 p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Item Total -->
            <div class="text-right">
              <p class="font-semibold text-gray-900">
                ${{ (item.product.price * item.quantity).toFixed(2) }}
              </p>
              <p v-if="!item.product.is_available" class="text-xs text-red-600 mt-1">
                Out of stock
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="mt-6 bg-white rounded-lg p-4 shadow-sm">
        <h3 class="font-semibold text-gray-900 mb-3">Order Summary</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Subtotal ({{ totalItems }} items)</span>
            <span class="font-medium">${{ subtotal.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Delivery fee</span>
            <span class="font-medium">{{ deliveryFee === 0 ? 'Free' : `$${deliveryFee.toFixed(2)}` }}</span>
          </div>
          <div class="border-t border-gray-200 pt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span class="text-lg">${{ total.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Action Bar -->
    <div v-if="cartItems.length > 0" class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div class="flex flex-col space-y-3">
        <!-- Delivery Address -->
        <div class="flex items-center space-x-2 text-sm text-gray-600">
          <MapPinIcon class="w-4 h-4" />
          <span>{{ deliveryAddress || 'Select delivery address' }}</span>
          <button class="text-blue-600 hover:underline ml-auto">Change</button>
        </div>

        <!-- Checkout Button -->
        <button
          @click="proceedToCheckout"
          :disabled="!canCheckout || isProcessing"
          :class="[
            'w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2',
            canCheckout && !isProcessing
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          ]"
        >
          <span>
            {{ isProcessing ? 'Processing...' : `Checkout - $${total.toFixed(2)}` }}
          </span>
        </button>

        <p v-if="unavailableItems.length > 0" class="text-xs text-red-600 text-center">
          {{ unavailableItems.length }} item(s) are currently unavailable
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCatalogStore } from '@/stores/catalog'
import { 
  ArrowLeftIcon,
  ShoppingCartIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
  MapPinIcon
} from '@heroicons/vue/24/outline'

const catalogStore = useCatalogStore()
const isProcessing = ref(false)
const deliveryAddress = ref('123 Main St, City') // Mock address
const deliveryFee = ref(0) // Free delivery for now

const cartItems = computed(() => catalogStore.cart)
const totalItems = computed(() => cartItems.value.reduce((sum, item) => sum + item.quantity, 0))
const subtotal = computed(() => cartItems.value.reduce((sum, item) => sum + (item.product.price * item.quantity), 0))
const total = computed(() => subtotal.value + deliveryFee.value)

const unavailableItems = computed(() => 
  cartItems.value.filter(item => !item.product.is_available)
)

const canCheckout = computed(() => 
  cartItems.value.length > 0 && unavailableItems.value.length === 0
)

const updateQuantity = async (productId: number, newQuantity: number) => {
  if (newQuantity <= 0) {
    await removeItem(productId)
    return
  }
  
  try {
    await catalogStore.updateCartItem(productId, newQuantity)
  } catch (err) {
    console.error('Failed to update quantity:', err)
  }
}

const removeItem = async (productId: number) => {
  try {
    await catalogStore.removeFromCart(productId)
    
    // Show feedback
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light')
    }
  } catch (err) {
    console.error('Failed to remove item:', err)
  }
}

const clearCart = async () => {
  if (window.confirm('Are you sure you want to clear your cart?')) {
    try {
      await catalogStore.clearCart()
    } catch (err) {
      console.error('Failed to clear cart:', err)
    }
  }
}

const proceedToCheckout = async () => {
  if (!canCheckout.value) return
  
  isProcessing.value = true
  
  try {
    // TODO: Implement actual checkout logic
    // For now, simulate checkout
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Show success and redirect
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert('Order placed successfully!')
      window.Telegram.WebApp.close()
    } else {
      alert('Order placed successfully!')
      await catalogStore.clearCart()
    }
  } catch (err) {
    console.error('Checkout failed:', err)
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert('Checkout failed. Please try again.')
    } else {
      alert('Checkout failed. Please try again.')
    }
  } finally {
    isProcessing.value = false
  }
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  const item = cartItems.value.find(item => 
    target.alt === item.product.name
  )
  if (item) {
    target.src = `https://placehold.co/100x100/e5e7eb/6b7280?text=${encodeURIComponent(item.product.name)}`
  }
}
</script>