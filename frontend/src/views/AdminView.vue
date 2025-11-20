<template>
  <div class="min-h-screen bg-gray-50">
    
    <!-- Login -->
    <div v-if="!adminStore.isAuthenticated" class="login-container">
      <div class="login-form-wrapper">
        <div class="card-base p-6 sm:p-8">
          <div class="text-center mb-6">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-primary/30 text-brand-dark mb-3">
              <svg class="w-7 h-7" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l2 4 4 .6-3 3 .7 4.4L12 14l-3.7 2.9.7-4.4-3-3L10 8l2-4z"/></svg>
            </div>
            <h1 class="font-primary text-2xl font-bold text-brand-dark uppercase tracking-wider">TOLSTOVKA Admin</h1>
            <p class="font-primary text-base text-gray-600 mt-1">Войдите чтобы управлять контентом</p>
          </div>

          <form @submit.prevent="handleLogin" class="login-form space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 font-primary">Логин</label>
              <input v-model="loginForm.username" type="text" required class="login-input px-3 py-3 sm:px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-dark focus:border-transparent text-base font-primary" placeholder="admin" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 font-primary">Пароль</label>
              <input v-model="loginForm.password" type="password" required class="login-input px-3 py-3 sm:px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-dark focus:border-transparent text-base font-primary" placeholder="••••••••" />
            </div>
            <button type="submit" :disabled="adminStore.isLoading" class="login-button py-3 px-4 bg-brand-primary text-brand-dark font-semibold rounded-xl hover:bg-brand-primary/90 focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 text-base font-primary">
              {{ adminStore.isLoading ? 'Вход...' : 'Войти' }}
            </button>
            <div v-if="adminStore.error" class="p-3 bg-red-100 border border-red-300 rounded-xl text-red-700 text-sm font-primary">{{ adminStore.error }}</div>
          </form>
        </div>
      </div>
    </div>

    <!-- Authenticated layout -->
<AdminLayout v-else v-model="activeTab" :tabs="adminTabs" @logout="handleLogout">
        <template #default>
          <!-- Overview -->
          <div v-if="activeTab === 'dashboard'" class="h-full flex flex-col">
            <!-- Mobile First Design - Single column with full viewport height -->
            <div class="flex-1 flex flex-col gap-2 p-2 min-h-0 max-h-full overflow-hidden">
              <!-- Products Block -->
              <button 
                @click="handleOverviewClick('products')"
                class="flex-1 card-base hover:shadow-lg active:scale-[0.98] transition-all duration-200 cursor-pointer p-3 group max-h-[calc(33vh-2rem)]"
              >
                <div class="flex items-center h-full">
                  <div class="p-2 rounded-lg bg-brand-primary/20 group-hover:bg-brand-primary/30 transition-colors">
                    <CubeIcon class="w-6 h-6 text-brand-dark" />
                  </div>
                  <div class="ml-3 text-left">
                    <p class="text-sm font-medium text-gray-600 font-primary">Товары</p>
                    <p class="text-xl font-bold text-gray-900 font-primary">{{ stats.products }}</p>
                  </div>
                  <div class="ml-auto">
                    <svg class="w-5 h-5 text-gray-400 group-hover:text-brand-dark transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </button>

              <!-- Categories Block -->
              <button 
                @click="handleOverviewClick('categories')"
                class="flex-1 card-base hover:shadow-lg active:scale-[0.98] transition-all duration-200 cursor-pointer p-3 group max-h-[calc(33vh-2rem)]"
              >
                <div class="flex items-center h-full">
                  <div class="p-2 rounded-lg bg-brand-primary/20 group-hover:bg-brand-primary/30 transition-colors">
                    <TagIcon class="w-6 h-6 text-brand-dark" />
                  </div>
                  <div class="ml-3 text-left">
                    <p class="text-sm font-medium text-gray-600 font-primary">Категории</p>
                    <p class="text-xl font-bold text-gray-900 font-primary">{{ stats.categories }}</p>
                  </div>
                  <div class="ml-auto">
                    <svg class="w-5 h-5 text-gray-400 group-hover:text-brand-dark transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </button>

              <!-- Banners Block -->
              <button 
                @click="handleOverviewClick('banners')"
                class="flex-1 card-base hover:shadow-lg active:scale-[0.98] transition-all duration-200 cursor-pointer p-3 group max-h-[calc(33vh-2rem)]"
              >
                <div class="flex items-center h-full">
                  <div class="p-2 rounded-lg bg-brand-primary/20 group-hover:bg-brand-primary/30 transition-colors">
                    <PhotoIcon class="w-6 h-6 text-brand-dark" />
                  </div>
                  <div class="ml-3 text-left">
                    <p class="text-sm font-medium text-gray-600 font-primary">Баннеры</p>
                    <p class="text-xl font-bold text-gray-900 font-primary">{{ stats.banners }}</p>
                  </div>
                  <div class="ml-auto">
                    <svg class="w-5 h-5 text-gray-400 group-hover:text-brand-dark transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </button>

              <!-- Promo Codes Block -->
              <button 
                @click="handleOverviewClick('promocodes')"
                class="flex-1 card-base hover:shadow-lg active:scale-[0.98] transition-all duration-200 cursor-pointer p-3 group max-h-[calc(33vh-2rem)]"
              >
                <div class="flex items-center h-full">
                  <div class="p-2 rounded-lg bg-brand-primary/20 group-hover:bg-brand-primary/30 transition-colors">
                    <TicketIcon class="w-6 h-6 text-brand-dark" />
                  </div>
                  <div class="ml-3 text-left">
                    <p class="text-sm font-medium text-gray-600 font-primary">Промокоды</p>
                    <p class="text-xl font-bold text-gray-900 font-primary">{{ stats.promoCodes }}</p>
                  </div>
                  <div class="ml-auto">
                    <svg class="w-5 h-5 text-gray-400 group-hover:text-brand-dark transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Drops -->
          <div v-else-if="activeTab === 'drops'" class="space-y-6">
            <AdminScheduledDrops
              :products="adminStore.scheduledProducts"
              :is-loading="adminStore.scheduledLoading"
              @refresh="handleRefreshDrops"
              @open="handleOpenScheduled"
            />
          </div>

          <!-- Banners -->
          <div v-else-if="activeTab === 'banners'" class="space-y-6">
            <AdminBannersList
              :banners="adminStore.banners"
              :isLoading="adminStore.isLoading"
              @create="handleCreateBanner"
              @edit="handleEditBanner"
              @delete="handleDeleteBanner"
              @batchDelete="handleBatchDeleteBanners"
              @batchToggle="handleBatchToggleBannerStatus"
              @reorder="handleReorderBanners"
              @toggleStatus="handleToggleBannerStatus"
            />
          </div>

          <!-- Categories -->
          <div v-else-if="activeTab === 'categories'" class="space-y-6">
            <AdminCategoriesList
              :categories="adminStore.categories"
              :isLoading="adminStore.isLoading"
              @create="handleCreateCategory"
              @edit="handleEditCategory"
              @delete="handleDeleteCategory"
              @reorder="handleReorderCategories"
            />
          </div>

          <!-- Products -->
          <div v-else-if="activeTab === 'products'" class="space-y-6">
            <AdminProductsTable
              :products="adminStore.products || []"
              :categories="adminStore.categories || []"
              :pagination="adminStore.productsPagination"
              :isLoading="adminStore.isLoading"
              @create="handleCreateProduct"
              @edit="handleEditProduct"
              @delete="handleDeleteProduct"
              @changePage="handleProductsPageChange"
              @changePageSize="handleProductsPageSizeChange"
              @filters="handleProductsFilters"
              @batchDelete="handleBatchDeleteProducts"
              @batchChangeCategory="handleBatchChangeProductCategory"
            />
          </div>

        <!-- Promo Codes -->
        <div v-else-if="activeTab === 'promocodes'" class="space-y-6">
          <AdminPromoCodes
            :promo-codes="adminStore.promoCodes"
            :is-loading="adminStore.isLoading"
          />
        </div>

          <!-- Settings -->
          <div v-else class="space-y-6">
            <!-- Manager Settings -->
            <div class="card-base p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4 font-primary">Настройки менеджера</h3>
              <form @submit.prevent="handleManagerSettingsUpdate" class="space-y-4 max-w-md">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2 font-primary">
                    Telegram username (без @)
                    <span class="block text-xs text-gray-500 font-normal mt-1 font-primary">
                      Используется для переадресации покупателей при оформлении заказов
                    </span>
                  </label>
                  <input 
                    v-model="managerForm.telegram" 
                    type="text" 
                    required 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-dark focus:border-transparent font-primary"
                    :placeholder="adminStore.settings.manager_telegram || 'innocentyy'"
                  />
                </div>
                <button type="submit" :disabled="adminStore.isLoading" class="w-full px-4 py-2 text-sm font-medium rounded-lg bg-brand-dark text-white shadow-md hover:bg-brand-dark/90 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-50 active:bg-brand-dark/95 transition-all duration-200 inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-dark font-primary">
                  {{ adminStore.isLoading ? 'Сохранение...' : 'Сохранить настройки' }}
                </button>
              </form>
            </div>
            
            <!-- Password Settings -->
            <div class="card-base p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4 font-primary">Смена пароля</h3>
              <form @submit.prevent="handlePasswordChange" class="space-y-4 max-w-md">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2 font-primary">Текущий пароль</label>
                  <input v-model="passwordForm.currentPassword" type="password" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-dark focus:border-transparent font-primary" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2 font-primary">Новый пароль</label>
                  <input v-model="passwordForm.newPassword" type="password" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-dark focus:border-transparent font-primary" />
                </div>
                <button type="submit" :disabled="adminStore.isLoading" class="w-full px-4 py-2 text-sm font-medium rounded-lg bg-brand-dark text-white shadow-md hover:bg-brand-dark/90 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-50 active:bg-brand-dark/95 transition-all duration-200 inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-dark font-primary">
                  {{ adminStore.isLoading ? 'Изменяем пароль...' : 'Сменить пароль' }}
                </button>
              </form>
            </div>
          </div>
        </template>
      </AdminLayout>

    <!-- Banner Modal - УЛУЧШЕННОЕ -->
    <AdminModal 
      :isOpen="showBannerModal" 
      :title="modalTitle" 
      size="lg"
      :showActions="false"
      @cancel="showBannerModal = false" 
      @close="showBannerModal = false"
    >
      <AdminBannerForm :banner="editingBanner" @submit="handleBannerFormSubmit" @cancel="showBannerModal = false" />
    </AdminModal>

    <!-- Category Modal - УЛУЧШЕННОЕ -->
    <AdminModal 
      :isOpen="showCategoryModal" 
      :title="modalTitle" 
      size="md"
      :showActions="false"
      @cancel="showCategoryModal = false" 
      @close="showCategoryModal = false"
    >
      <AdminCategoryForm :category="editingCategory" @submit="handleCategoryFormSubmit" @cancel="showCategoryModal = false" />
    </AdminModal>

    <!-- Product Modal - УЛУЧШЕННОЕ -->
    <AdminModal 
      :isOpen="showProductModal" 
      :title="modalTitle" 
      size="xl"
      :showActions="false"
      @cancel="showProductModal = false" 
      @close="showProductModal = false"
    >
      <AdminProductForm :product="editingProduct" :categories="adminStore.categories" @submit="handleProductFormSubmit" @cancel="showProductModal = false" />
</AdminModal>

    <!-- Global Toast for Admin actions -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="toast.visible"
        :class="[
          'fixed bottom-4 left-1/2 transform -translate-x-1/2 px-5 py-4 rounded-lg shadow-2xl z-[10000] text-base font-semibold text-white border-2 border-white/20 max-w-sm mx-auto text-center',
          toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'
        ]"
      >
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { TagIcon, CubeIcon, PhotoIcon, HomeIcon, Cog6ToothIcon, TicketIcon, SparklesIcon } from '@heroicons/vue/24/outline'
import { useAdminStore } from '@/stores/admin'
import AdminBannersList from '@/components/admin/AdminBannersList.vue'
import AdminCategoriesList from '@/components/admin/AdminCategoriesList.vue'
import AdminModal from '@/components/AdminModal.vue'
import AdminBannerForm from '@/components/admin/AdminBannerForm.vue'
import AdminPromoCodes from '@/components/admin/AdminPromoCodes.vue'
import AdminCategoryForm from '@/components/admin/AdminCategoryForm.vue'
import AdminProductForm from '@/components/admin/AdminProductForm.vue'
import AdminLayout from '@/components/admin/layout/AdminLayout.vue'
import AdminProductsTable from '@/components/admin/AdminProductsTable.vue'
import AdminScheduledDrops from '@/components/admin/AdminScheduledDrops.vue'

const router = useRouter()
const adminStore = useAdminStore()

// Forms and modals
const showBannerModal = ref(false)
const showCategoryModal = ref(false)
const showProductModal = ref(false)
const editingBanner = ref<any>(null)
const editingCategory = ref<any>(null)
const editingProduct = ref<any>(null)
const modalTitle = ref('')

// Simple global toast state for admin actions
const toast = ref<{ visible: boolean; message: string; type: 'success' | 'error'; timer: number | null }>({
  visible: false,
  message: '',
  type: 'success',
  timer: null
})

function showToast(message: string, type: 'success' | 'error' = 'success', timeout = 2500) {
  // Clear previous timer if any
  if (toast.value.timer) {
    clearTimeout(toast.value.timer)
    toast.value.timer = null
  }
  toast.value.message = message
  toast.value.type = type
  toast.value.visible = true
  toast.value.timer = window.setTimeout(() => {
    toast.value.visible = false
    toast.value.message = ''
    toast.value.timer = null
  }, timeout)
}

const activeTab = ref<'dashboard' | 'drops' | 'banners' | 'categories' | 'products' | 'settings' | 'promocodes'>('dashboard')

const loginForm = ref({ username: '', password: '' })
const passwordForm = ref({ currentPassword: '', newPassword: '' })
const managerForm = ref({ telegram: '' })
const hasLoadedScheduled = ref(false)

// Computed stats from store data
const stats = computed(() => ({
  categories: adminStore.categories?.length || 0,
  products: adminStore.productsPagination?.total || 0,
  banners: adminStore.banners?.length || 0,
  promoCodes: adminStore.promoCodes?.length || 0
}))

const adminTabs = [
  { id: 'dashboard', name: 'Обзор', icon: HomeIcon },
  { id: 'products', name: 'Товары', icon: CubeIcon },
  { id: 'drops', name: 'Дропы', icon: SparklesIcon },
  { id: 'categories', name: 'Категории', icon: TagIcon },
  { id: 'banners', name: 'Баннеры', icon: PhotoIcon },
  { id: 'promocodes', name: 'Промокоды', icon: TicketIcon },
  { id: 'settings', name: 'Настройки', icon: Cog6ToothIcon }
]

const currentTabName = computed(() => adminTabs.find(t => t.id === activeTab.value)?.name || 'Админ-панель')

// Products table state for client-side filters (mock store)
const productsFilters = ref({ search: '', category: '' })

// Auth
async function handleLogin() {
  try {
    await adminStore.login(loginForm.value)
    // Load data after successful login
    if (adminStore.isAuthenticated) {
      await Promise.all([
        adminStore.fetchBanners(),
        adminStore.fetchCategories(),
        adminStore.fetchProducts({ page: 1, limit: 10 }),
      ])
      await loadScheduledDrops()
    }
  } catch (error) {
    console.error('Login failed:', error)
  }
}

function handleLogout() {
  adminStore.logout()
  router.push('/')
}

// Overview navigation
function handleOverviewClick(tabId: 'dashboard' | 'drops' | 'banners' | 'categories' | 'products' | 'settings' | 'promocodes') {
  activeTab.value = tabId
}

async function loadScheduledDrops(force = false, notifyOnError = false) {
  if (hasLoadedScheduled.value && !force) return
  try {
    await adminStore.fetchScheduledProducts()
    hasLoadedScheduled.value = true
  } catch (error) {
    console.error('Failed to load scheduled products:', error)
    if (notifyOnError) {
      showToast('Не удалось загрузить отложенные товары', 'error')
    }
  }
}

async function handleRefreshDrops() {
  await loadScheduledDrops(true, true)
}

async function handleOpenScheduled(productId: string) {
  try {
    let product = adminStore.scheduledProducts.find(p => p.id === productId)
    if (!product) {
      product = adminStore.products.find(p => p.id === productId)
    }

    if (!product || !product.images?.length) {
      const fetched = await adminStore.fetchProduct(productId)
      product = fetched || adminStore.currentProduct
    }

    if (product) {
      handleEditProduct(product)
    } else {
      showToast('Товар не найден', 'error')
    }
  } catch (error) {
    console.error('Failed to open scheduled product:', error)
    showToast('Не удалось загрузить товар', 'error')
  }
}

// Banners
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
  if (editingBanner.value) await adminStore.updateBanner(editingBanner.value.id, formData)
  else await adminStore.createBanner(formData)
  showBannerModal.value = false
}

// Массовые операции с баннерами
async function handleBatchDeleteBanners(bannerIds: string[]) {
  try {
    await Promise.all(bannerIds.map(id => adminStore.deleteBanner(id)))
  } catch (error) {
    console.error('Batch delete banners failed:', error)
  }
}

async function handleBatchToggleBannerStatus(bannerIds: string[], active: boolean) {
  try {
    await Promise.all(bannerIds.map(id => adminStore.updateBanner(id, { active: active ? 1 : 0 })))
  } catch (error) {
    console.error('Batch toggle banner status failed:', error)
  }
}

// Products
function handleCreateProduct() {
  editingProduct.value = null
  modalTitle.value = 'Создать товар'
  showProductModal.value = true
}
function handleEditProduct(p: any) {
  editingProduct.value = p
  modalTitle.value = 'Редактировать товар'
  showProductModal.value = true
}
async function handleDeleteProduct(product: any) {
  if (confirm(`Удалить товар "${product.title || product.id}"?`)) {
    await adminStore.deleteProduct(product.id)
  }
}
async function handleProductFormSubmit(formData: any) {
  if (editingProduct.value) {
    // Редактирование существующего товара
    await adminStore.updateProduct(editingProduct.value.id, formData)
    if (Array.isArray(formData.images)) {
      // @ts-ignore - метод присутствует и в mock, и в реальном сторе
      await adminStore.reorderProductImages(editingProduct.value.id, formData.images)
    }
  } else {
    // Создание нового товара
    await adminStore.createProduct(formData)
  }
  showProductModal.value = false
  
  // Обновляем список товаров
  await adminStore.fetchProducts({ 
    page: adminStore.productsPagination?.page || 1, 
    limit: adminStore.productsPagination?.limit || 10 
  })
}

// Pagination & filters for products (works with mock store; server can use same events)
function handleProductsPageChange(page: number) {
  adminStore.fetchProducts({ page, limit: adminStore.productsPagination?.limit || 10 })
}
function handleProductsPageSizeChange(limit: number) {
  adminStore.fetchProducts({ page: 1, limit })
}
function handleProductsFilters(v: { search: string; category: string }) {
  productsFilters.value = v
  // For real API you might call: adminStore.fetchProducts({ page: 1, limit: adminStore.productsPagination?.limit || 10, search: v.search, category: v.category })
}

// Массовые операции с товарами
async function handleBatchDeleteProducts(productIds: string[]) {
  try {
    // Используем новый batch метод
    await adminStore.batchDeleteProducts(productIds)
    
    // Обновляем список для синхронизации
    await adminStore.fetchProducts({ 
      page: adminStore.productsPagination?.page || 1, 
      limit: adminStore.productsPagination?.limit || 10 
    })
  } catch (error) {
    console.error('Batch delete products failed:', error)
  }
}

async function handleBatchChangeProductCategory(productIds: string[], categoryId: string) {
  try {
    // Используем batch update метод
    const updates = productIds.map(id => ({ id, data: { categoryId } }))
    await adminStore.batchUpdateProducts(updates)
    
    // Обновляем список для синхронизации
    await adminStore.fetchProducts({ 
      page: adminStore.productsPagination?.page || 1, 
      limit: adminStore.productsPagination?.limit || 10 
    })
  } catch (error) {
    console.error('Batch change product category failed:', error)
  }
}


// Categories
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
  try {
    // Преобразуем formData для API
    const categoryData = {
      name: formData.name,
      hide_empty: formData.hideEmpty || false
    }
    
    if (editingCategory.value) {
      console.log('[AdminView] Updating category with data:', categoryData)
      await adminStore.updateCategory(editingCategory.value.id, categoryData)
      showToast('Категория обновлена', 'success')
    } else {
      console.log('[AdminView] Creating category with data:', categoryData)
      await adminStore.createCategory({
        name: formData.name,
        hideEmpty: formData.hideEmpty || false
      })
      showToast('Категория создана', 'success')
    }
    showCategoryModal.value = false
    
    // Обновляем список категорий для синхронизации с сервером
    await adminStore.fetchCategories()
    console.log('[AdminView] Category list refreshed after', editingCategory.value ? 'update' : 'creation')
  } catch (error: any) {
    console.error('[AdminView] Category form submission failed:', error)
    // Явная обработка дубликатов категорий
    const msg = (typeof error?.message === 'string' ? error.message : '')
    if (/Категория\s+с\s+(таким|похожим)\s+названием\s+уже\s+существует/i.test(msg)) {
      showToast(msg, 'error', 3500)
    } else {
      showToast('Не удалось сохранить категорию. Попробуйте ещё раз', 'error')
    }
    // Модал остается открытым при ошибке
  }
}

async function handleManagerSettingsUpdate() {
  if (!managerForm.value.telegram || !managerForm.value.telegram.trim()) {
    showToast('Укажите Telegram username', 'error')
    return
  }
  
  try {
    await adminStore.updateSettings({
      manager_telegram: managerForm.value.telegram.trim()
    })
    showToast('Настройки менеджера успешно сохранены!', 'success')
  } catch (error) {
    console.error('Failed to update manager settings:', error)
    showToast('Ошибка при сохранении настроек', 'error')
  }
}

async function handlePasswordChange() {
  if (!passwordForm.value.currentPassword || !passwordForm.value.newPassword) {
    showToast('Заполните все поля', 'error')
    return
  }

  if (passwordForm.value.newPassword.length < 6) {
    showToast('Новый пароль должен содержать не менее 6 символов', 'error')
    return
  }

  try {
    await adminStore.changePassword(
      passwordForm.value.currentPassword,
      passwordForm.value.newPassword
    )
    
    // Очищаем форму
    passwordForm.value.currentPassword = ''
    passwordForm.value.newPassword = ''
    
    showToast('Пароль успешно изменён!', 'success')
  } catch (error: any) {
    console.error('Password change failed:', error)
    
    // Показываем конкретную ошибку из стора
    const errorMessage = adminStore.error || 'Не удалось изменить пароль'
    showToast(errorMessage, 'error', 4000)
  }
}

// Init
onMounted(async () => {
  // @ts-ignore - checkAuth method exists in adminStore
  await adminStore.checkAuth()
  if (adminStore.isAuthenticated) {
    await Promise.all([
      adminStore.fetchBanners(),
      adminStore.fetchCategories(),
      adminStore.fetchProducts({ page: 1, limit: 10 }),
      adminStore.fetchPromoCodes(),
      adminStore.fetchSettings()
    ])
    await loadScheduledDrops()
    
    // Заполняем форму настроек менеджера
    updateManagerForm()
  }
})

// Отслеживаем изменения настроек для обновления формы
watch(activeTab, async (tab) => {
  if (tab === 'drops') {
    await loadScheduledDrops()
  }

  if (tab === 'promocodes' && !adminStore.promoCodes.length) {
    try {
      await adminStore.fetchPromoCodes()
    } catch (err) {
      // ошибка уже обработана в сторе
    }
  }
})

watch(() => adminStore.settings.manager_telegram, () => {
  updateManagerForm()
})

function updateManagerForm() {
  const currentValue = adminStore.settings.manager_telegram || 'innocentyy'
  console.log('[AdminView] Updating manager form with value:', currentValue)
  managerForm.value.telegram = currentValue
}
</script>

<style scoped>
/* РАДИКАЛЬНОЕ переопределение всех стилей */
* {
  box-sizing: border-box !important;
}

.login-container {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 20px !important;
  background: #f9fafb !important;
}

.login-form-wrapper {
  width: 100% !important;
  max-width: 400px !important;
  margin: 0 !important;
  padding: 0 !important;
}

.login-form-wrapper .card-base {
  width: 100% !important;
  margin: 0 !important;
  padding: 32px !important;
}

.login-form {
  width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
}

.login-form > div {
  width: 100% !important;
  margin: 0 0 16px 0 !important;
  padding: 0 !important;
}

.login-form label {
  display: block !important;
  width: 100% !important;
  margin: 0 0 8px 0 !important;
  text-align: left !important;
}

.login-input {
  width: 100% !important;
  display: block !important;
  margin: 0 !important;
  padding: 12px 16px !important;
  border: 1px solid #d1d5db !important;
  border-radius: 12px !important;
  background: white !important;
  font-size: 16px !important;
  line-height: 1.5 !important;
  outline: none !important;
}

.login-input:focus {
  border-color: #383b3d !important;
  box-shadow: 0 0 0 2px rgba(56, 59, 61, 0.2) !important;
}

.login-button {
  width: 100% !important;
  display: block !important;
  margin: 20px 0 0 0 !important;
  padding: 12px 16px !important;
  background: #ffc81a !important;
  color: #383b3d !important;
  border: none !important;
  border-radius: 12px !important;
  font-size: 16px !important;
  font-weight: 600 !important;
  text-align: center !important;
  cursor: pointer !important;
  transition: all 0.2s !important;
}

.login-button:hover {
  background: rgba(255, 200, 26, 0.9) !important;
}

.login-button:disabled {
  opacity: 0.5 !important;
  cursor: not-allowed !important;
}
</style>
