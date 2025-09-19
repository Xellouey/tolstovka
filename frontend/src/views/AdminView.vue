<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Login Form -->
    <div v-if="!isAuthenticated" class="flex items-center justify-center min-h-screen p-4">
      <div class="w-full max-w-md">
        <div class="bg-white rounded-2xl shadow-lg p-8">
          <div class="text-center mb-6">
            <h1 class="text-2xl font-bold text-brand-dark mb-2">Админ-панель</h1>
            <p class="text-gray-600">TOLSTOVKA</p>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Логин
              </label>
              <input
                v-model="loginForm.username"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-dark focus:border-transparent"
                placeholder="admin"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Пароль
              </label>
              <input
                v-model="loginForm.password"
                type="password"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-dark focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              :disabled="isLoading"
              class="w-full py-3 bg-brand-dark text-white rounded-xl hover:bg-brand-dark/90 transition-colors font-medium disabled:opacity-50"
            >
              {{ isLoading ? 'Вход...' : 'Войти' }}
            </button>

            <div v-if="error" class="p-3 bg-red-100 border border-red-300 rounded-xl text-red-700 text-sm">
              {{ error }}
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Admin Dashboard -->
    <div v-else>
      <!-- Header -->
      <header class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center space-x-4">
              <h1 class="text-xl font-bold text-brand-dark">Админ-панель</h1>
              <span class="text-sm text-gray-500">TOLSTOVKA</span>
            </div>
            <button
              @click="handleLogout"
              class="px-4 py-2 text-gray-600 hover:text-brand-dark transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <!-- Navigation -->
      <nav class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex space-x-8">
            <button
              v-for="tab in adminTabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'py-4 px-2 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-brand-dark text-brand-dark'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              {{ tab.name }}
            </button>
          </div>
        </div>
      </nav>

      <!-- Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Dashboard Overview -->
        <div v-if="activeTab === 'dashboard'" class="space-y-6">
          <h2 class="text-2xl font-bold text-gray-900">Обзор</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-white p-6 rounded-xl shadow-sm border">
              <div class="flex items-center">
                <div class="p-2 bg-brand-primary/20 rounded-lg">
                  <TagIcon class="w-6 h-6 text-brand-dark" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Категории</p>
                  <p class="text-2xl font-bold text-gray-900">{{ stats.categories }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white p-6 rounded-xl shadow-sm border">
              <div class="flex items-center">
                <div class="p-2 bg-brand-primary/20 rounded-lg">
                  <CubeIcon class="w-6 h-6 text-brand-dark" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Товары</p>
                  <p class="text-2xl font-bold text-gray-900">{{ stats.products }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white p-6 rounded-xl shadow-sm border">
              <div class="flex items-center">
                <div class="p-2 bg-brand-primary/20 rounded-lg">
                  <PhotoIcon class="w-6 h-6 text-brand-dark" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Баннеры</p>
                  <p class="text-2xl font-bold text-gray-900">{{ stats.banners }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white p-6 rounded-xl shadow-sm border">
              <div class="flex items-center">
                <div class="p-2 bg-green-100 rounded-lg">
                  <CheckCircleIcon class="w-6 h-6 text-green-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Активные</p>
                  <p class="text-2xl font-bold text-gray-900">{{ stats.active }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Banners Management -->
        <div v-if="activeTab === 'banners'" class="space-y-6">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900">Управление баннерами</h2>
            <button class="px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-dark/90 transition-colors">
              Добавить баннер
            </button>
          </div>
          
          <div class="bg-white rounded-xl shadow-sm border p-6">
            <p class="text-gray-600">Функционал управления баннерами в разработке...</p>
          </div>
        </div>

        <!-- Categories Management -->
        <div v-if="activeTab === 'categories'" class="space-y-6">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900">Управление категориями</h2>
            <button class="px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-dark/90 transition-colors">
              Добавить категорию
            </button>
          </div>
          
          <div class="bg-white rounded-xl shadow-sm border p-6">
            <p class="text-gray-600">Функционал управления категориями в разработке...</p>
          </div>
        </div>

        <!-- Products Management -->
        <div v-if="activeTab === 'products'" class="space-y-6">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900">Управление товарами</h2>
            <button class="px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-dark/90 transition-colors">
              Добавить товар
            </button>
          </div>
          
          <div class="bg-white rounded-xl shadow-sm border p-6">
            <p class="text-gray-600">Функционал управления товарами в разработке...</p>
          </div>
        </div>

        <!-- Settings -->
        <div v-if="activeTab === 'settings'" class="space-y-6">
          <h2 class="text-2xl font-bold text-gray-900">Настройки</h2>
          
          <div class="bg-white rounded-xl shadow-sm border p-6">
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900">Смена пароля</h3>
              
              <form @submit.prevent="handlePasswordChange" class="space-y-4 max-w-md">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Текущий пароль
                  </label>
                  <input
                    v-model="passwordForm.currentPassword"
                    type="password"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-dark focus:border-transparent"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Новый пароль
                  </label>
                  <input
                    v-model="passwordForm.newPassword"
                    type="password"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-dark focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  class="px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-dark/90 transition-colors"
                >
                  Сменить пароль
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  TagIcon,
  CubeIcon,
  PhotoIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline'

const isAuthenticated = ref(false)
const isLoading = ref(false)
const error = ref('')
const activeTab = ref('dashboard')

const loginForm = ref({
  username: '',
  password: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: ''
})

const stats = ref({
  categories: 4,
  products: 8,
  banners: 3,
  active: 2
})

const adminTabs = [
  { id: 'dashboard', name: 'Обзор' },
  { id: 'banners', name: 'Баннеры' },
  { id: 'categories', name: 'Категории' },
  { id: 'products', name: 'Товары' },
  { id: 'settings', name: 'Настройки' }
]

async function handleLogin() {
  isLoading.value = true
  error.value = ''

  try {
    // Simple authentication - in production use proper API
    if (loginForm.value.username === 'admin' && loginForm.value.password === 'admin') {
      isAuthenticated.value = true
      localStorage.setItem('admin_auth', 'true')
    } else {
      error.value = 'Неверный логин или пароль'
    }
  } catch (err) {
    error.value = 'Ошибка входа'
  } finally {
    isLoading.value = false
  }
}

function handleLogout() {
  isAuthenticated.value = false
  localStorage.removeItem('admin_auth')
  loginForm.value = { username: '', password: '' }
}

async function handlePasswordChange() {
  // Password change logic would go here
  alert('Функция смены пароля в разработке')
}

onMounted(() => {
  // Check if already authenticated
  if (localStorage.getItem('admin_auth') === 'true') {
    isAuthenticated.value = true
  }
})
</script>