import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import { $fetch } from '@/utils/http'

// Types
export interface User {
  username: string
  role: string
}

export interface Banner {
  id: string
  image: string
  href: string | null
  active: number // 0 or 1 from API
  order: number
  openInNewTab?: number // 0 or 1 from API
  title?: string
  description?: string
}

export interface Category {
  id: string
  slug: string
  name: string
  order: number
  productCount?: number
  hide_empty?: number | boolean
}

export interface Product {
  id: string
  categoryId: string
  categoryName?: string
  title: string
  priceRub: number
  description: string
  images: string[]
  createdAt: string
  size?: string
  status?: 'draft' | 'scheduled' | 'published'
  publishAt?: string | null
  publishedAt?: string | null
  dropId?: string | null
}

export interface PromoCode {
  code: string
  description?: string
  discountType: 'percent' | 'fixed'
  discountValue: number
  minSubtotal: number
  maxUses: number | null
  usageCount: number
  remainingUses: number | null
  isActive: boolean
  expiresAt: string | null
  lastUsedAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface PromoUsage {
  id: string
  code: string
  usedAt: string
  cartTotal: number
  discountApplied: number
  metadata?: any
  telegramUserId?: string | null
  telegramUsername?: string | null
}

interface ProductsResponse {
  products: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface ApiError {
  error: string
  message: string
}

// Реальный стор админки. Без моков.

export const useAdminStore = defineStore('admin', () => {
  // Authentication state
  const isAuthenticated = ref(false)
  const user = ref<User | null>(null)
  const token = ref('')

  // Data state
  const banners = ref<Banner[]>([])
  const categories = ref<Category[]>([])
  const products = ref<Product[]>([])
  const scheduledProducts = ref<Product[]>([])
  const currentProduct = ref<Product | null>(null)
  const settings = ref<Record<string, string>>({})
  const promoCodes = ref<PromoCode[]>([])
  const promoUsages = ref<PromoUsage[]>([])
  const drops = ref([])

  // UI state
  const isLoading = ref(false)
  const scheduledLoading = ref(false)
  const error = ref<string | null>(null)

  // Pagination state
  const productsPagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  })

  // Computed
  const isLoggedIn = computed(() => isAuthenticated.value && !!token.value)

  // Utilities
  function setError(message: string) {
    error.value = message
    setTimeout(() => {
      error.value = null
    }, 5000)
  }

  function handleApiError(err: any) {
    console.error('API Error:', err)
    
    // Специальная обработка дублирования категорий
    if (err.data?.error === 'duplicate_category') {
      setError(err.data.message || 'Категория с таким названием уже существует')
      return
    }
    
    // Обычная обработка ошибок
    if (err.data?.message) {
      setError(err.data.message)
    } else if (err.message) {
      setError(err.message)
    } else {
      setError('Произошла ошибка при выполнении запроса')
    }
  }

  // Authentication methods (реальные запросы)
  async function login(credentials: { username: string; password: string }) {
    try {
      isLoading.value = true
      error.value = null

      // Express API only
      const response = await $fetch<{ success?: boolean; token: string; user?: User }>('/api/admin/login', { 
        method: 'POST', 
        body: credentials 
      })

      // Normalise
      // @ts-ignore
      token.value = response.token
      // @ts-ignore
      user.value = response.user || { username: credentials.username, role: 'admin' }
      isAuthenticated.value = true
      if (typeof window !== 'undefined') localStorage.setItem('admin_token', token.value)
      return { success: true, token: token.value, user: user.value as User }
    } catch (err: any) {
      handleApiError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    token.value = ''
    user.value = null
    isAuthenticated.value = false
    if (typeof window !== 'undefined') localStorage.removeItem('admin_token')
  }

  async function checkAuth() {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
    if (!storedToken) {
      isAuthenticated.value = false
      user.value = null
      token.value = ''
      return false
    }
    
    token.value = storedToken
    
    // Probe protected endpoint to verify token
    try {
      await $fetch('/api/admin/banners', { headers: { Authorization: `Bearer ${storedToken}` } })
      user.value = user.value || { username: 'admin', role: 'admin' }
      isAuthenticated.value = true
      return true
    } catch (err) {
      console.warn('Protected endpoint check failed:', err)
      // Clear invalid token
      if (typeof window !== 'undefined') localStorage.removeItem('admin_token')
      isAuthenticated.value = false
      user.value = null
      token.value = ''
      return false
    }
  }

  // Helper for authenticated requests
  function getAuthHeaders() {
    if (!token.value) {
      throw new Error('No authentication token')
    }
    return {
      Authorization: `Bearer ${token.value}`
    }
  }

  // Upload files (real API): /api/admin/upload?target=...
  async function uploadFiles(files: FileList | File[], target?: string) {
    try {
      isLoading.value = true
      const fd = new FormData()
      Array.from(files).forEach(f => fd.append('files', f))
      const qs = target ? `?target=${encodeURIComponent(target)}` : ''
      const res = await $fetch<{ ok: boolean; urls: string[] }>(`/api/admin/upload${qs}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: fd
      })
      return res.urls
    } catch (err: any) {
      handleApiError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Banner CRUD methods
  async function fetchBanners() {
    try {
      isLoading.value = true
      error.value = null

      const response = await $fetch<Banner[]>('/api/admin/banners', {
        headers: getAuthHeaders()
      })

      banners.value = response
    } catch (err: any) {
      handleApiError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchPromoCodes() {
    try {
      isLoading.value = true
      const promos = await $fetch<PromoCode[]>('/api/admin/promocodes', {
      headers: getAuthHeaders()
    })
      promoCodes.value = promos
    } catch (err) {
      handleApiError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createPromoCode(payload: {
    code: string
    description?: string
    discountType: 'percent' | 'fixed'
    discountValue: number
    minSubtotal?: number
    maxUses?: number | null
    isActive?: boolean
    expiresAt?: string | null
  }) {
    try {
      isLoading.value = true
      await $fetch('/api/admin/promocodes', {
        headers: getAuthHeaders(),
        method: 'POST',
        body: {
          ...payload,
          minSubtotal: payload.minSubtotal ?? 0,
          maxUses: payload.maxUses ?? null,
          isActive: payload.isActive ?? true
        }
      })
      await fetchPromoCodes()
    } catch (err) {
      handleApiError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updatePromoCode(code: string, payload: {
    description?: string | null
    discountType?: 'percent' | 'fixed'
    discountValue?: number
    minSubtotal?: number
    maxUses?: number | null
    isActive?: boolean
    expiresAt?: string | null
  }) {
    try {
      isLoading.value = true
      await $fetch(`/api/admin/promocodes/${encodeURIComponent(code)}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: payload
      })
      await fetchPromoCodes()
    } catch (err) {
      handleApiError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deletePromoCode(code: string) {
    try {
      isLoading.value = true
      await $fetch(`/api/admin/promocodes/${encodeURIComponent(code)}`, { method: 'DELETE', headers: getAuthHeaders() })
      promoCodes.value = promoCodes.value.filter(promo => promo.code !== code)
    } catch (err) {
      handleApiError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchPromoCodeUsages(code: string) {
    try {
      const response = await $fetch<{ promo: PromoCode; usages: PromoUsage[] }>(`/api/admin/promocodes/${encodeURIComponent(code)}/usages`, {
      headers: getAuthHeaders()
    })
      promoUsages.value = response.usages
      return response
    } catch (err) {
      handleApiError(err)
      throw err
    }
  }

  async function createBanner(banner: Omit<Banner, 'id' | 'order'>) {
    try {
      isLoading.value = true
      error.value = null

      const response = await $fetch<Banner>('/api/admin/banners', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: banner
      })

      banners.value.push(response)
      return response
    } catch (err: any) {
      handleApiError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateBanner(id: string, updates: Partial<Banner>) {
    try {
      isLoading.value = true
      error.value = null

      const response = await $fetch<Banner>(`/api/admin/banners/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: updates
      })

      // Update local state с данными от сервера
      const index = banners.value.findIndex(b => b.id === id)
      if (index !== -1) {
        banners.value[index] = response
      }

      return banners.value[index]
    } catch (err: any) {
      handleApiError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteBanner(id: string) {
    try {
      isLoading.value = true
      error.value = null

      await $fetch(`/api/admin/banners/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      banners.value = banners.value.filter(b => b.id !== id)
    } catch (err: any) {
      handleApiError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function toggleBannerStatus(id: string) {
    try {
      const banner = banners.value.find(b => b.id === id)
      if (!banner) return
      
      const newActive = banner.active === 1 ? 0 : 1
      await updateBanner(id, { active: newActive })
    } catch (err: any) {
      handleApiError(err)
      throw err
    }
  }

  async function reorderBanners(reorderedBanners: { id: string; order: number }[]) {
    try {
      isLoading.value = true
      error.value = null

      await $fetch('/api/admin/banners/reorder', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: { banners: reorderedBanners }
      })

      // Update local state
      reorderedBanners.forEach(({ id, order }) => {
        const banner = banners.value.find(b => b.id === id)
        if (banner) {
          banner.order = order
        }
      })

      // Sort by order
      banners.value.sort((a, b) => a.order - b.order)
      
      // Принудительно обновляем данные с сервера для синхронизации
      await fetchBanners()
    } catch (err: any) {
      handleApiError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Category CRUD methods
  async function fetchCategories() {
    try {
      isLoading.value = true
      error.value = null

      const response = await $fetch<Category[]>('/api/admin/categories', {
        headers: getAuthHeaders()
      })

      categories.value = response
    } catch (err: any) {
      handleApiError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

async function createCategory(category: { name: string; hideEmpty?: boolean }) {
    try {
      isLoading.value = true
      error.value = null

      const response = await $fetch<any>('/api/admin/categories', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: {
          name: category.name,
          hide_empty: category.hideEmpty || false
        }
      })

      // Express server returns { ok: true, id, slug, name, order }
      if (response.ok && response.id) {
        console.log('[admin] Category created on server:', response)
        
        // Return the category data for the caller to use
        // The list will be refreshed by the calling component
        const newCategory: Category = {
          id: response.id,
          slug: response.slug,
          name: response.name,
          order: response.order,
          productCount: 0, // новая категория, товаров пока нет
          hide_empty: response.hide_empty
        }
        
        return newCategory
      } else {
        throw new Error('Invalid server response format')
      }
    } catch (err: any) {
      handleApiError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateCategory(id: string, updates: Partial<Category>) {
    try {
      isLoading.value = true
      error.value = null

      console.log('[admin] Updating category', id, 'with:', updates)

      const response = await $fetch<Category>(`/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: updates
      })

      console.log('[admin] Update category response:', response)

      // Обновляем локальное состояние полными данными от сервера
      const index = categories.value.findIndex(c => c.id === id)
      if (index !== -1) {
        categories.value[index] = {
          ...categories.value[index],
          ...response
        }
        console.log('[admin] Updated local category:', categories.value[index])
      }

      return response
    } catch (err: any) {
      handleApiError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteCategory(id: string) {
    try {
      isLoading.value = true
      error.value = null

      await $fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      categories.value = categories.value.filter(c => c.id !== id)
    } catch (err: any) {
      handleApiError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function reorderCategories(reorderedCategories: { id: string; order: number }[]) {
    try {
      isLoading.value = true
      error.value = null

      console.log('🔥 [admin] reorderCategories called with:', reorderedCategories)
      const payload = { categories: reorderedCategories }
      console.log('🔥 [admin] Sending payload to server:', JSON.stringify(payload, null, 2))
      console.log('🔥 [admin] Auth headers:', getAuthHeaders())

      const response = await $fetch('/api/admin/categories/reorder', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: payload
      })
      
      console.log('🔥 [admin] Reorder response from server:', response)

      // Update local state
      reorderedCategories.forEach(({ id, order }) => {
        const category = categories.value.find(c => c.id === id)
        if (category) {
          category.order = order
        }
      })

      // Sort by order
      categories.value.sort((a, b) => a.order - b.order)
    } catch (err: any) {
      handleApiError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Product CRUD methods
  async function fetchProducts(options: {
    page?: number
    limit?: number
    category?: string
    search?: string
    status?: string
  } = {}) {
    try {
      isLoading.value = true
      error.value = null

      const params = new URLSearchParams()
      if (options.page) params.set('page', options.page.toString())
      if (options.limit) params.set('limit', options.limit.toString())
      if (options.category) params.set('category', options.category)
      if (options.search) params.set('search', options.search)
      if (options.status) params.set('status', options.status)

      const response = await $fetch<ProductsResponse>(`/api/admin/products?${params}`, {
        headers: getAuthHeaders()
      })

      products.value = response.products
      productsPagination.value = response.pagination
    } catch (err: any) {
      handleApiError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchScheduledProducts(options: {
    limit?: number
    categoryId?: string
  } = {}) {
    try {
      scheduledLoading.value = true
      error.value = null

      const params = new URLSearchParams()
      params.set('status', 'scheduled')
      params.set('limit', String(options.limit ?? 100))
      if (options.categoryId) params.set('category', options.categoryId)

      const response = await $fetch<ProductsResponse>(`/api/admin/products?${params}`, {
        headers: getAuthHeaders()
      })

      scheduledProducts.value = [...(response.products || [])]
        .sort((a, b) => {
          const aTime = a.publishAt ? new Date(a.publishAt).getTime() : Infinity
          const bTime = b.publishAt ? new Date(b.publishAt).getTime() : Infinity
          return aTime - bTime
        })
    } catch (err: any) {
      handleApiError(err)
      throw err
    } finally {
      scheduledLoading.value = false
    }
  }

  function upsertScheduledProduct(product?: Product | null) {
    if (!product) return

    if (product.status !== 'scheduled') {
      scheduledProducts.value = scheduledProducts.value.filter(p => p.id !== product.id)
      return
    }

    const others = scheduledProducts.value.filter(p => p.id !== product.id)
    scheduledProducts.value = [...others, product].sort((a, b) => {
      const aTime = a.publishAt ? new Date(a.publishAt).getTime() : Infinity
      const bTime = b.publishAt ? new Date(b.publishAt).getTime() : Infinity
      return aTime - bTime
    })
  }

  function removeScheduledProduct(id: string) {
    scheduledProducts.value = scheduledProducts.value.filter(p => p.id !== id)
  }

  async function fetchProduct(id: string) {
    try {
      isLoading.value = true
      error.value = null

      const response = await $fetch<Product>(`/api/admin/products/${id}`, {
        headers: getAuthHeaders()
      })

      currentProduct.value = response
      return response
    } catch (err: any) {
      handleApiError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'categoryName'>) {
    try {
      isLoading.value = true
      error.value = null

      console.log('[admin] Creating product with data:', product)
      
      const response = await $fetch<{ ok: boolean; id: string; product: Product }>('/api/admin/products', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: product
      })

      console.log('[admin] Product creation response:', response)
      
      // Use the product data returned from server (includes processed images)
      const createdProduct = response.product
      
      products.value.unshift(createdProduct)
      productsPagination.value.total++
      upsertScheduledProduct(createdProduct)
      return createdProduct
    } catch (err: any) {
      handleApiError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateProduct(id: string, updates: Partial<Product>) {
    try {
      isLoading.value = true
      error.value = null

      const updatedProduct = await $fetch<Product>(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: updates
      })
      
      // Update local state
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = updatedProduct
      }

      if (currentProduct.value?.id === id) {
        currentProduct.value = updatedProduct
      }

      upsertScheduledProduct(updatedProduct)

    } catch (err: any) {
      handleApiError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteProduct(id: string) {
    try {
      isLoading.value = true
      error.value = null

      await $fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      products.value = products.value.filter(p => p.id !== id)
      productsPagination.value.total--
      removeScheduledProduct(id)

      if (currentProduct.value?.id === id) {
        currentProduct.value = null
      }
    } catch (err: any) {
      handleApiError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Batch operations for products
  async function batchDeleteProducts(ids: string[]) {
    try {
      isLoading.value = true
      error.value = null

      // TODO: Здесь можно реализовать более эффективный batch endpoint
      // Пока же используем параллельные запросы
      await Promise.all(ids.map(id => 
        $fetch(`/api/admin/products/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        })
      ))

      // Обновляем локальное состояние
      products.value = products.value.filter(p => !ids.includes(p.id))
      productsPagination.value.total -= ids.length
      scheduledProducts.value = scheduledProducts.value.filter(p => !ids.includes(p.id))

      if (currentProduct.value && ids.includes(currentProduct.value.id)) {
        currentProduct.value = null
      }
    } catch (err: any) {
      handleApiError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function batchUpdateProducts(updates: Array<{ id: string; data: Partial<Product> }>) {
    try {
      isLoading.value = true
      error.value = null

      // TODO: Здесь можно реализовать более эффективный batch endpoint
      await Promise.all(updates.map(({ id, data }) => 
        $fetch(`/api/admin/products/${id}`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: data
        })
      ))

      // Обновляем локальное состояние
      updates.forEach(({ id, data }) => {
        const product = products.value.find(p => p.id === id)
        if (product) {
          Object.assign(product, data)
        }
        
        if (currentProduct.value?.id === id) {
          Object.assign(currentProduct.value, data)
        }
      })

      try {
        await fetchScheduledProducts()
      } catch (e) {
        console.warn('Не удалось обновить список отложенных товаров после пакетного обновления', e)
      }
    } catch (err: any) {
      handleApiError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function reorderProductImages(productId: string, images: string[]) {
    try {
      isLoading.value = true
      error.value = null

      await $fetch(`/api/admin/products/${productId}/images/reorder`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: { urls: images }
      })

      // Update local state
      const product = products.value.find(p => p.id === productId)
      if (product) {
        product.images = images
      }

      if (currentProduct.value?.id === productId) {
        currentProduct.value.images = images
      }

    return images
  } catch (err: any) {
    handleApiError(err)
    throw err
  } finally {
    isLoading.value = false
  }
}

  // Password change method
  async function changePassword(currentPassword: string, newPassword: string) {
    try {
      isLoading.value = true
      error.value = null

      const response = await $fetch<{ ok: boolean }>('/api/admin/password', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: {
          currentPassword,
          newPassword
        }
      })

      if (response.ok) {
        return { success: true }
      } else {
        throw new Error('Password change failed')
      }
    } catch (err: any) {
      // Handle specific error cases
      if (err.data?.error === 'invalid_current_password') {
        setError('Неверный текущий пароль')
      } else if (err.data?.error === 'missing') {
        setError('Не указаны все необходимые поля')
      } else {
        handleApiError(err)
      }
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Settings methods
  async function fetchSettings() {
    try {
      isLoading.value = true
      error.value = null

      const response = await $fetch<Record<string, string>>('/api/admin/settings', {
        headers: getAuthHeaders()
      })

      settings.value = response
      return response
    } catch (err: any) {
      handleApiError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateSettings(newSettings: Record<string, string>) {
    try {
      isLoading.value = true
      error.value = null

      const response = await $fetch<{ ok: boolean; settings: Record<string, string> }>('/api/admin/settings', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: { settings: newSettings }
      })

      if (response.ok) {
        settings.value = { ...settings.value, ...newSettings }
        return response.settings
      } else {
        throw new Error('Failed to update settings')
      }
    } catch (err: any) {
      handleApiError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Clear methods
  function clearError() {
    error.value = null
  }

  function clearProducts() {
    products.value = []
    currentProduct.value = null
    productsPagination.value = {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0
    }
  }

  // Verify token (if present)
  async function verifyToken() {
    try {
      const tokenInStorage = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
      if (!tokenInStorage) {
        isAuthenticated.value = false
        return false
      }
      token.value = tokenInStorage
      const res = await $fetch<{ valid: boolean; user: { username: string; role: string } }>('/api/admin/auth/verify', {
        method: 'POST',
        headers: getAuthHeaders()
      })
      if (res.valid) {
        user.value = res.user
        isAuthenticated.value = true
        return true
      }
      isAuthenticated.value = false
      return false
    } catch (err) {
      // invalid token
      if (typeof window !== 'undefined') localStorage.removeItem('admin_token')
      isAuthenticated.value = false
      return false
    }
  }

  // Initialize method
  async function initialize() {
    // Try to verify existing token
    const isValid = await verifyToken()
    if (isValid) {
      // Load initial data
      try {
        await Promise.all([
          fetchBanners(),
          fetchCategories(),
          fetchProducts()
        ])
      } catch (err) {
        // Non-critical errors during initialization
        console.warn('Failed to load some initial data:', err)
      }
    }
  }

  return {
    // State
    isAuthenticated,
    user,
    token,
    banners,
    categories,
    products,
    scheduledProducts,
    currentProduct,
    settings,
    promoCodes,
    promoUsages,
    isLoading,
    scheduledLoading,
    error,
    productsPagination,

    // Computed
    isLoggedIn,

    // Auth methods
    login,
    logout,
    checkAuth,
    verifyToken,

    // Banner methods
    fetchBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    toggleBannerStatus,
    reorderBanners,

    // Category methods
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,

    // Promo code methods
    fetchPromoCodes,
    fetchPromoCodeUsages,
    createPromoCode,
    updatePromoCode,
    deletePromoCode,

    // Product methods
    fetchProducts,
    fetchScheduledProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    batchDeleteProducts,
    batchUpdateProducts,
    reorderProductImages,

    // Upload
    uploadFiles,

    // Settings methods
    fetchSettings,
    updateSettings,

    // Password management
    changePassword,

    // Utility methods
    clearError,
    clearProducts,
    initialize
  }
})
