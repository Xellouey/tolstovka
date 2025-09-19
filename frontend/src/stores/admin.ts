import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Types
interface User {
  username: string
  role: string
}

interface Banner {
  id: string
  image: string
  href: string
  active: boolean
  order: number
}

interface Category {
  id: string
  slug: string
  name: string
  order: number
  productCount?: number
}

interface Product {
  id: string
  categoryId: string
  categoryName?: string
  title: string
  priceRub: number
  description: string
  images: string[]
  createdAt: string
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

// Mock data
const mockBanners: Banner[] = [
  { id: '1', title: 'Летняя распродажа', description: 'Скидки до 50%', imageUrl: 'https://via.placeholder.com/800x300', linkUrl: '/sale', isActive: true, order: 1 },
  { id: '2', title: 'Новая коллекция', description: 'Модные толстовки', imageUrl: 'https://via.placeholder.com/800x300', linkUrl: '/new', isActive: false, order: 2 }
]

const mockCategories: Category[] = [
  { id: '1', slug: 'hoodies', name: 'Толстовки', order: 1, productCount: 5 },
  { id: '2', slug: 'sweatshirts', name: 'Свитшоты', order: 2, productCount: 3 },
  { id: '3', slug: 'accessories', name: 'Аксессуары', order: 3, productCount: 2 }
]

const mockProducts: Product[] = [
  { id: '1', categoryId: '1', title: 'Классическая толстовка', priceRub: 2500, description: 'Удобная толстовка из хлопка', images: ['https://via.placeholder.com/400x400'], createdAt: new Date().toISOString() },
  { id: '2', categoryId: '1', title: 'Толстовка с капюшоном', priceRub: 2800, description: 'Стильная толстовка с капюшоном', images: ['https://via.placeholder.com/400x400'], createdAt: new Date().toISOString() }
]

export const useAdminStore = defineStore('admin', () => {
  // Authentication state
  const isAuthenticated = ref(false)
  const user = ref<User | null>(null)
  const token = ref('')

  // Data state
  const banners = ref<Banner[]>([...mockBanners])
  const categories = ref<Category[]>([...mockCategories])
  const products = ref<Product[]>([...mockProducts])
  const currentProduct = ref<Product | null>(null)

  // UI state
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Pagination state
  const productsPagination = ref({
    page: 1,
    limit: 20,
    total: mockProducts.length,
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
    if (err.data?.message) {
      setError(err.data.message)
    } else if (err.message) {
      setError(err.message)
    } else {
      setError('Произошла ошибка при выполнении запроса')
    }
  }

  // Authentication methods
  async function login(credentials: { username: string; password: string }) {
    try {
      isLoading.value = true
      error.value = null

      // Mock login delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (credentials.username === 'admin' && credentials.password === 'admin') {
        const mockToken = 'mock-admin-token-' + Date.now()
        const mockUser: User = { username: 'admin', role: 'admin' }
        
        token.value = mockToken
        user.value = mockUser
        isAuthenticated.value = true

        // Store token in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_token', mockToken)
        }

        return { success: true, token: mockToken, user: mockUser }
      } else {
        throw new Error('Неверный логин или пароль')
      }
    } catch (err: any) {
      handleApiError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    // Mock logout - just clear local state
    token.value = ''
    user.value = null
    isAuthenticated.value = false

    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token')
    }
  }

  async function checkAuth() {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
    if (!storedToken) {
      isAuthenticated.value = false
      return false
    }

    // Mock token verification
    if (storedToken.startsWith('mock-admin-token-')) {
      token.value = storedToken
      user.value = { username: 'admin', role: 'admin' }
      isAuthenticated.value = true
      return true
    }

    // Invalid token
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token')
    }
    isAuthenticated.value = false
    return false
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
        method: 'PUT',
        headers: getAuthHeaders(),
        body: updates
      })

      const index = banners.value.findIndex(b => b.id === id)
      if (index !== -1) {
        banners.value[index] = response
      }

      return response
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

  async function createCategory(category: Pick<Category, 'name' | 'slug'>) {
    try {
      isLoading.value = true
      error.value = null

      const response = await $fetch<Category>('/api/admin/categories', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: category
      })

      categories.value.push(response)
      return response
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

      const response = await $fetch<Category>(`/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: updates
      })

      const index = categories.value.findIndex(c => c.id === id)
      if (index !== -1) {
        categories.value[index] = response
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

      await $fetch('/api/admin/categories/reorder', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: { categories: reorderedCategories }
      })

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
  } = {}) {
    try {
      isLoading.value = true
      error.value = null

      const params = new URLSearchParams()
      if (options.page) params.set('page', options.page.toString())
      if (options.limit) params.set('limit', options.limit.toString())
      if (options.category) params.set('category', options.category)
      if (options.search) params.set('search', options.search)

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

      const response = await $fetch<Product>('/api/admin/products', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: product
      })

      products.value.unshift(response)
      productsPagination.value.total++
      return response
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

      const response = await $fetch<Product>(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: updates
      })

      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = response
      }

      if (currentProduct.value?.id === id) {
        currentProduct.value = response
      }

      return response
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

  async function reorderProductImages(productId: string, images: string[]) {
    try {
      isLoading.value = true
      error.value = null

      const response = await $fetch<{ success: boolean; images: string[] }>(`/api/admin/products/${productId}/images/reorder`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: { images }
      })

      // Update local state
      const product = products.value.find(p => p.id === productId)
      if (product) {
        product.images = response.images
      }

      if (currentProduct.value?.id === productId) {
        currentProduct.value.images = response.images
      }

      return response.images
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
    currentProduct,
    isLoading,
    error,
    productsPagination,

    // Computed
    isLoggedIn,

    // Auth methods
    login,
    logout,
    verifyToken,

    // Banner methods
    fetchBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    reorderBanners,

    // Category methods
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,

    // Product methods
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    reorderProductImages,

    // Upload
    uploadFiles,

    // Utility methods
    clearError,
    clearProducts,
    initialize
  }
})