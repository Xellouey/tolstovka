<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm px-4 py-3 flex items-center space-x-3">
      <button @click="$router.go(-1)" class="p-2 hover:bg-gray-100 rounded-full">
        <ArrowLeftIcon class="w-5 h-5" />
      </button>
      <h1 class="text-lg font-semibold">Profile</h1>
    </div>

    <!-- Profile Info -->
    <div class="p-4 space-y-4">
      <!-- User Info Card -->
      <div class="bg-white rounded-lg p-4 shadow-sm">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <UserIcon class="w-6 h-6 text-white" />
          </div>
          <div class="flex-1">
            <h2 class="font-semibold text-gray-900">{{ userInfo.name || 'Guest User' }}</h2>
            <p class="text-sm text-gray-600">{{ userInfo.username ? `@${userInfo.username}` : 'Welcome to TOLSTOVKA' }}</p>
          </div>
          <button 
            v-if="isInTelegram"
            @click="shareProfile" 
            class="p-2 hover:bg-gray-100 rounded-full"
          >
            <ShareIcon class="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <div v-if="userInfo.phone" class="mt-3 pt-3 border-t border-gray-100">
          <div class="flex items-center space-x-2 text-sm text-gray-600">
            <PhoneIcon class="w-4 h-4" />
            <span>{{ userInfo.phone }}</span>
          </div>
        </div>
      </div>

      <!-- Statistics -->
      <div class="grid grid-cols-3 gap-3">
        <div class="bg-white rounded-lg p-3 text-center shadow-sm">
          <div class="text-lg font-semibold text-gray-900">{{ stats.totalOrders }}</div>
          <div class="text-xs text-gray-600">Orders</div>
        </div>
        <div class="bg-white rounded-lg p-3 text-center shadow-sm">
          <div class="text-lg font-semibold text-green-600">${{ stats.totalSpent.toFixed(0) }}</div>
          <div class="text-xs text-gray-600">Spent</div>
        </div>
        <div class="bg-white rounded-lg p-3 text-center shadow-sm">
          <div class="text-lg font-semibold text-blue-600">{{ stats.favoriteItems }}</div>
          <div class="text-xs text-gray-600">Favorites</div>
        </div>
      </div>

      <!-- Menu Items -->
      <div class="space-y-3">
        <!-- Order History -->
        <div class="bg-white rounded-lg shadow-sm">
          <button 
            @click="viewOrderHistory"
            class="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <ClockIcon class="w-5 h-5 text-gray-400" />
              <span class="font-medium">Order History</span>
            </div>
            <ChevronRightIcon class="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <!-- Favorites -->
        <div class="bg-white rounded-lg shadow-sm">
          <button 
            @click="viewFavorites"
            class="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <HeartIcon class="w-5 h-5 text-gray-400" />
              <span class="font-medium">Favorite Items</span>
            </div>
            <ChevronRightIcon class="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <!-- Delivery Addresses -->
        <div class="bg-white rounded-lg shadow-sm">
          <button 
            @click="manageAddresses"
            class="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <MapPinIcon class="w-5 h-5 text-gray-400" />
              <span class="font-medium">Delivery Addresses</span>
            </div>
            <ChevronRightIcon class="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <!-- Settings -->
        <div class="bg-white rounded-lg shadow-sm">
          <button 
            @click="openSettings"
            class="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <CogIcon class="w-5 h-5 text-gray-400" />
              <span class="font-medium">Settings</span>
            </div>
            <ChevronRightIcon class="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <!-- Help & Support -->
        <div class="bg-white rounded-lg shadow-sm">
          <button 
            @click="getSupport"
            class="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <QuestionMarkCircleIcon class="w-5 h-5 text-gray-400" />
              <span class="font-medium">Help & Support</span>
            </div>
            <ChevronRightIcon class="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      <!-- App Info -->
      <div class="bg-white rounded-lg p-4 shadow-sm">
        <h3 class="font-medium text-gray-900 mb-2">About TOLSTOVKA</h3>
        <div class="space-y-1 text-sm text-gray-600">
          <div class="flex justify-between">
            <span>Version</span>
            <span>2.0.0</span>
          </div>
          <div class="flex justify-between">
            <span>Last Updated</span>
            <span>{{ formatDate(new Date()) }}</span>
          </div>
        </div>
      </div>

      <!-- Logout (if not in Telegram) -->
      <div v-if="!isInTelegram" class="pt-4">
        <button 
          @click="logout"
          class="w-full py-3 text-red-600 font-medium hover:bg-red-50 transition-colors rounded-lg"
        >
          Sign Out
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  ArrowLeftIcon,
  UserIcon,
  ShareIcon,
  PhoneIcon,
  ClockIcon,
  HeartIcon,
  MapPinIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'

// Mock user info - in real app, this would come from store or API
const userInfo = ref({
  id: 1,
  name: 'John Doe',
  username: 'johndoe',
  phone: '+1 (555) 123-4567',
  avatar: null
})

const stats = ref({
  totalOrders: 12,
  totalSpent: 324.50,
  favoriteItems: 8
})

const isInTelegram = computed(() => 
  typeof window !== 'undefined' && window.Telegram?.WebApp
)

// Initialize user info from Telegram if available
onMounted(() => {
  if (isInTelegram.value) {
    const tgUser = window.Telegram.WebApp.initDataUnsafe?.user
    if (tgUser) {
      userInfo.value = {
        id: tgUser.id,
        name: `${tgUser.first_name} ${tgUser.last_name || ''}`.trim(),
        username: tgUser.username || '',
        phone: '',
        avatar: tgUser.photo_url || null
      }
    }
  }
})

const viewOrderHistory = () => {
  // TODO: Navigate to order history or show modal
  if (isInTelegram.value) {
    window.Telegram.WebApp.showAlert('Order history feature coming soon!')
  } else {
    alert('Order history feature coming soon!')
  }
}

const viewFavorites = () => {
  // TODO: Navigate to favorites
  if (isInTelegram.value) {
    window.Telegram.WebApp.showAlert('Favorites feature coming soon!')
  } else {
    alert('Favorites feature coming soon!')
  }
}

const manageAddresses = () => {
  // TODO: Show address management
  if (isInTelegram.value) {
    window.Telegram.WebApp.showAlert('Address management coming soon!')
  } else {
    alert('Address management coming soon!')
  }
}

const openSettings = () => {
  // TODO: Show settings
  if (isInTelegram.value) {
    window.Telegram.WebApp.showAlert('Settings coming soon!')
  } else {
    alert('Settings coming soon!')
  }
}

const getSupport = () => {
  if (isInTelegram.value) {
    window.Telegram.WebApp.openTelegramLink('https://t.me/tolstovka_support')
  } else {
    window.open('https://t.me/tolstovka_support', '_blank')
  }
}

const shareProfile = () => {
  if (isInTelegram.value) {
    const shareText = `Check out TOLSTOVKA - amazing food delivery! 🍕`
    const shareUrl = `https://t.me/share/url?url=https://tolstovka.vercel.app&text=${encodeURIComponent(shareText)}`
    window.Telegram.WebApp.openTelegramLink(shareUrl)
  }
}

const logout = () => {
  if (confirm('Are you sure you want to sign out?')) {
    // TODO: Implement actual logout
    console.log('Logging out...')
  }
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}
</script>