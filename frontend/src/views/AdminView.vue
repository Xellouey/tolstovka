<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Login Form -->
    <div v-if="!adminStore.isAuthenticated" class="flex items-center justify-center min-h-screen p-4">
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
              :disabled="adminStore.isLoading"
              class="w-full py-3 bg-brand-dark text-white rounded-xl hover:bg-brand-dark/90 transition-colors font-medium disabled:opacity-50"
            >
              {{ adminStore.isLoading ? 'Вход...' : 'Войти' }}
            </button>

            <div v-if="adminStore.error" class="p-3 bg-red-100 border border-red-300 rounded-xl text-red-700 text-sm">
              {{ adminStore.error }}
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
          <AdminBannersList
            :banners="adminStore.banners"
            :isLoading="adminStore.isLoading"
            @create="handleCreateBanner"
            @edit="handleEditBanner"
            @delete="handleDeleteBanner"
            @reorder="handleReorderBanners"
            @toggleStatus="handleToggleBannerStatus"
          />
        </div>

        <!-- Categories Management -->
        <div v-if="activeTab === 'categories'" class="space-y-6">
          <AdminCategoriesList
            :categories="adminStore.categories"
            :isLoading="adminStore.isLoading"
            @create="handleCreateCategory"
            @edit="handleEditCategory"
            @delete="handleDeleteCategory"
            @reorder="handleReorderCategories"
          />
        </div>

        <!-- Products Management -->
        <div v-if="activeTab === 'products'" class="space-y-6">
          <!-- Products list -->
          <div class="bg-white rounded-xl shadow-sm border p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-gray-900">Товары</h2>
              <button disabled class="px-4 py-2 bg-gray-300 text-white rounded-lg" title="Создание будет добавлено позже">Новый товар</button>
            </div>

            <div v-if="adminStore.isLoading" class="text-center py-8 text-gray-600">Загрузка товаров...</div>
            <div v-else>
              <div v-if="adminStore.products && adminStore.products.length" class="grid grid-cols-1 gap-3">
                <div v-for="p in adminStore.products" :key="p.id" class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div class="flex items-center gap-3 min-w-0">
                    <img :src="p.images?.[0] || 'https://placehold.co/64x64/f3f4f6/9ca3af?text=IMG'" class="w-16 h-16 object-cover rounded border" />
                    <div class="min-w-0">
                      <p class="font-medium text-gray-900 truncate">{{ p.title || p.id }}</p>
                      <p class="text-sm text-gray-600 truncate">Цена: {{ p.priceRub }} ₽</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button @click="handleEditProduct(p)" class="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800">Редактировать</button>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-600 text-center py-8">Товаров нет</div>
            </div>
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

    <!-- Banner Modal -->
    <AdminModal
      :isOpen="showBannerModal"
      :title="modalTitle"
      @cancel="showBannerModal = false"
      @close="showBannerModal = false"
    >
      <AdminBannerForm
        :banner="editingBanner"
        @submit="handleBannerFormSubmit"
        @cancel="showBannerModal = false"
      />
    </AdminModal>

    <!-- Category Modal -->
    <AdminModal
      :isOpen="showCategoryModal"
      :title="modalTitle"
      @cancel="showCategoryModal = false"
      @close="showCategoryModal = false"
    >
      <AdminCategoryForm
        :category="editingCategory"
        @submit="handleCategoryFormSubmit"
        @cancel="showCategoryModal = false"
      />
    </AdminModal>

    <!-- Product Modal -->
    <AdminModal
      :isOpen="showProductModal"
      :title="modalTitle"
      @cancel="showProductModal = false"
      @close="showProductModal = false"
    >
      <AdminProductForm
        :product="editingProduct"
        :categories="adminStore.categories"
        @submit="handleProductFormSubmit"
        @cancel="showProductModal = false"
      />
    </AdminModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  TagIcon,
  CubeIcon,
  PhotoIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline'
import { useAdminStore } from '@/stores/admin-mock'
import AdminBannersList from '@/components/admin/AdminBannersList.vue'
import AdminCategoriesList from '@/components/admin/AdminCategoriesList.vue'
import AdminModal from '@/components/AdminModal.vue'
import AdminBannerForm from '@/components/admin/AdminBannerForm.vue'
import AdminCategoryForm from '@/components/admin/AdminCategoryForm.vue'
import AdminProductImagesSorter from '@/components/admin/AdminProductImagesSorter.vue'
import AdminProductForm from '@/components/admin/AdminProductForm.vue'

const router = useRouter()
const adminStore = useAdminStore()

// Product images DnD wiring (демонстрация на первом товаре)
const firstProduct = computed(() => (adminStore.products && adminStore.products.length > 0) ? adminStore.products[0] : null)
const productImages = ref<string[]>([])

watch(firstProduct, (p) => {
  productImages.value = p?.images ? [...p.images] : []
}, { immediate: true })

// Forms and modals
const showBannerModal = ref(false)
const showCategoryModal = ref(false)
const showProductModal = ref(false)
const editingBanner = ref(null)
const editingCategory = ref(null)
const editingProduct = ref<any>(null)
const modalTitle = ref('')

const activeTab = ref('dashboard')

const loginForm = ref({
  username: '',
  password: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: ''
})

// Computed stats from store data
const stats = computed(() => ({
  categories: adminStore.categories?.length || 0,
  products: adminStore.productsPagination?.total || 0,
  banners: adminStore.banners?.length || 0,
  active: adminStore.banners?.filter(b => b.isActive)?.length || 0
}))

const adminTabs = [
  { id: 'dashboard', name: 'Обзор' },
  { id: 'banners', name: 'Баннеры' },
  { id: 'categories', name: 'Категории' },
  { id: 'products', name: 'Товары' },
  { id: 'settings', name: 'Настройки' }
]

// Login functionality
async function handleLogin() {
  try {
    await adminStore.login(loginForm.value)
  } catch (error) {
    console.error('Login failed:', error)
  }
}

// Logout functionality
function handleLogout() {
  adminStore.logout()
  router.push('/')
}

// Banner handlers
function handleCreateBanner() {
  editingBanner.value = null
  modalTitle.value = 'Добавить баннер'
  showBannerModal.value = true
}

function handleEditBanner(banner: any) {
  editingBanner.value = banner
  modalTitle.value = 'Редактировать баннер'
  showBannerModal.value = true
}

async function handleDeleteBanner(bannerId: string) {
  if (confirm('Удалить баннер?')) {
    await adminStore.deleteBanner(bannerId)
  }
}

async function handleReorderBanners(reorderedBanners: any[]) {
  await adminStore.reorderBanners(reorderedBanners)
}

async function handleToggleBannerStatus(bannerId: string) {
  await adminStore.toggleBannerStatus(bannerId)
}

async function handleBannerFormSubmit(formData: any) {
  if (editingBanner.value) {
    await adminStore.updateBanner(editingBanner.value.id, formData)
  } else {
    await adminStore.createBanner(formData)
  }
  showBannerModal.value = false
}

// Product handlers
function handleEditProduct(p: any) {
  editingProduct.value = p
  modalTitle.value = 'Редактировать товар'
  showProductModal.value = true
}

async function handleProductFormSubmit(formData: any) {
  if (editingProduct.value) {
    await adminStore.updateProduct(editingProduct.value.id, formData)
    // Если изменили массив изображений — фиксируем порядок через единый метод
    if (Array.isArray(formData.images)) {
      // @ts-ignore
      await adminStore.reorderProductImages(editingProduct.value.id, formData.images)
    }
  }
  showProductModal.value = false
}

// Category handlers
function handleCreateCategory() {
  editingCategory.value = null
  modalTitle.value = 'Добавить категорию'
  showCategoryModal.value = true
}

function handleEditCategory(category: any) {
  editingCategory.value = category
  modalTitle.value = 'Редактировать категорию'
  showCategoryModal.value = true
}

async function handleDeleteCategory(categoryId: string) {
  if (confirm('Удалить категорию?')) {
    await adminStore.deleteCategory(categoryId)
  }
}

async function handleReorderCategories(reorderedCategories: any[]) {
  await adminStore.reorderCategories(reorderedCategories)
}

async function handleCategoryFormSubmit(formData: any) {
  if (editingCategory.value) {
    await adminStore.updateCategory(editingCategory.value.id, formData)
  } else {
    await adminStore.createCategory(formData)
  }
  showCategoryModal.value = false
}

async function handleProductImagesReorder(newOrder: string[]) {
  if (!firstProduct.value) return
  productImages.value = [...newOrder]
  // В mock-сторе обновим локально; в реальном сторе уйдет PATCH на бекенд
  // Метод одинаково называется в обоих сторах для технологической совместимости
  // (см. /api/admin/products/:id/images/reorder)
  // @ts-ignore
  await adminStore.reorderProductImages(firstProduct.value.id, newOrder)
}

function handleProductImageRemove(index: number) {
  const next = productImages.value.slice()
  next.splice(index, 1)
  // повторно используем общий обработчик сохранения порядка
  handleProductImagesReorder(next)
}

async function handlePasswordChange() {
  // Password change logic would go here
  alert('Функция смены пароля в разработке')
}

// Check authentication and load data on mount
onMounted(async () => {
  await adminStore.checkAuth()
  if (adminStore.isAuthenticated) {
    await Promise.all([
      adminStore.fetchBanners(),
      adminStore.fetchCategories(),
      adminStore.fetchProducts({ page: 1, limit: 10 })
    ])
  }
})
</script>