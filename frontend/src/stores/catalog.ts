import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  PRODUCT_SIZE_ORDER,
  getSizePresetForCategory,
  type SizePreset
} from '@/constants/productSizes'

export interface Category {
  id: string
  slug: string
  name: string
  order: number
}

export interface Product {
  id: string
  categoryId: string
  title: string
  priceRub: number
  description: string
  images: string[]
  createdAt: string
  color?: string
  variant?: string
  size?: string
}

export interface Banner {
  id: string
  image: string
  href: string | null
  active: number
  order: number
  openInNewTab?: number // 0 or 1 from API
  title?: string
  description?: string
  ctaText?: string | null
}

export interface CartItem {
  product: Product & { is_available?: boolean }
  quantity: number
}

export type SortOption = 'price_asc' | 'price_desc'

export const useCatalogStore = defineStore('catalog', () => {
  // State
  const categories = ref<Category[]>([])
  const products = ref<Product[]>([])
  const allProducts = ref<Product[]>([]) // Store all products for category counts
  const banners = ref<Banner[]>([])
  const currentProduct = ref<Product | null>(null)

  const activeCategory = ref<string | null>(null)
  const sortBy = ref<SortOption>('price_asc')
  const searchQuery = ref('')
  const activeSize = ref<string | null>(null)
  const sizePreset = ref<SizePreset>(getSizePresetForCategory(null))

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Cart state
  const cart = ref<CartItem[]>([])

  // Pagination
  const currentPage = ref(0)
  const itemsPerPage = ref(20)
  const hasMore = ref(true)
  const totalProducts = ref(0)

  // Computed
  const filteredProducts = computed(() => {
    let filtered = products.value

    if (activeCategory.value) {
      const category = categories.value.find(c => c.slug === activeCategory.value)
      if (category) {
        filtered = filtered.filter(p => p.categoryId && String(p.categoryId) === String(category.id))
      }
    }

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(p =>
        (p.title || '').toLowerCase().includes(query) ||
        (p.description || '').toLowerCase().includes(query)
      )
    }

    if (activeSize.value) {
      const sizeToken = activeSize.value
      filtered = filtered.filter(p => (p.size ? p.size.toUpperCase() : '') === sizeToken)
    }

    return filtered
  })

  const SIZE_ORDER = PRODUCT_SIZE_ORDER

  const availableSizes = computed(() => {
    const preset = sizePreset.value
    const normalize = (value: string) => value.replace(/\s+/g, '').toUpperCase()

    const normalizedSet = new Set<string>()
    const normalizedToRaw = new Map<string, string>()

    const activeCategorySlug = activeCategory.value
    const activeCategoryId = activeCategorySlug
      ? categories.value.find(c => c.slug === activeCategorySlug)?.id
      : null

    const source = activeCategoryId
      ? allProducts.value.filter(product => product.categoryId === activeCategoryId)
      : allProducts.value

    source.forEach(product => {
      if (!product.size) return
      const raw = product.size.toUpperCase()
      const normalizedValue = normalize(product.size)
      normalizedSet.add(normalizedValue)
      if (!normalizedToRaw.has(normalizedValue)) {
        normalizedToRaw.set(normalizedValue, raw)
      }
    })

    if (preset) {
      const presetValues = preset.values
      const filtered = presetValues
        .map(value => ({ value, normalized: normalize(value) }))
        .filter(entry => normalizedSet.has(entry.normalized))
        .map(entry => entry.value)

      if (filtered.length) {
        return filtered
      }
    }

    const fallback = Array.from(normalizedSet)
      .map(value => normalizedToRaw.get(value) || value)

    return fallback.sort((a, b) => {
      const normalizedA = normalize(a)
      const normalizedB = normalize(b)
      const indexA = SIZE_ORDER.findIndex(size => size === normalizedA)
      const indexB = SIZE_ORDER.findIndex(size => size === normalizedB)
      if (indexA !== -1 && indexB !== -1) return indexA - indexB
      if (indexA !== -1) return -1
      if (indexB !== -1) return 1
      return normalizedA.localeCompare(normalizedB)
    })
  })

  const categoriesWithProductCounts = computed(() => {
    return categories.value.map(category => ({
      ...category,
      productCount: allProducts.value.filter(p => p.categoryId && String(p.categoryId) === String(category.id)).length
    }))
  })

  const activeCategoryName = computed(() => {
    if (!activeCategory.value) return 'Все товары'
    const category = categories.value.find(c => c.slug === activeCategory.value)
    return category?.name || 'Все товары'
  })

  // Helpers
  function delay(ms: number) { return new Promise(res => setTimeout(res, ms)) }
  async function waitForIdle(timeoutMs = 3000) {
    const start = Date.now()
    while (isLoading.value) {
      if (Date.now() - start > timeoutMs) break
      await delay(50)
    }
  }

  function normalizeProduct(p: any): Product {
    return {
      ...p,
      id: String(p.id),
      categoryId: String(p.categoryId || p.category_id || p.category?.id || ''),
      priceRub: Number(p.priceRub || p.price || 0)
    }
  }

  function normalizeCategory(c: any): Category {
    return {
      ...c,
      id: String(c.id)
    }
  }

  // Actions
  async function fetchCategories() {
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) throw new Error('Failed to fetch categories')
      const data: any[] = await response.json()
      // show only sorted categories by order asc
      const sorted = data.map(normalizeCategory).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      categories.value = sorted
      updateSizePreset()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error fetching categories:', err)
    }
  }

  async function fetchProducts(loadMore = false) {
    if (isLoading.value) return

    try {
      isLoading.value = true
      error.value = null

      const offset = loadMore ? currentPage.value * itemsPerPage.value : 0
      const params = new URLSearchParams({
        limit: itemsPerPage.value.toString(),
        offset: offset.toString(),
        sort: sortBy.value
      })

      if (activeCategory.value) {
        params.set('category', activeCategory.value)
      }

      const response = await fetch(`/api/products?${params}`)
      if (!response.ok) throw new Error('Failed to fetch products')

      const data = await response.json()
      const normalizedProducts = (data.products || []).map(normalizeProduct)

      if (loadMore) {
        products.value.push(...normalizedProducts)
        currentPage.value++
      } else {
        products.value = normalizedProducts
        currentPage.value = 1
      }

      totalProducts.value = data.total
      hasMore.value = data.hasMore

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error fetching products:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchAllProducts() {
    try {
      const limit = 100
      let offset = 0
      let hasMore = true
      const allItems: Product[] = []

      while (hasMore) {
        const response = await fetch(`/api/products?limit=${limit}&offset=${offset}`)
        if (!response.ok) throw new Error('Failed to fetch all products')

        const data = await response.json()
        const pageProducts = (data.products || []).map(normalizeProduct)

        if (pageProducts.length === 0) {
          hasMore = false
        } else {
          allItems.push(...pageProducts)
          offset += limit
          // If we received fewer items than the limit, we've reached the end
          if (pageProducts.length < limit) {
            hasMore = false
          }
          // Safety break to prevent infinite loops if API is misbehaving
          if (offset > 10000) {
            console.warn('fetchAllProducts reached safety limit of 10000 items')
            hasMore = false
          }
        }
      }

      allProducts.value = allItems
      updateSizePreset()
    } catch (err) {
      console.error('Error fetching all products for counts:', err)
    }
  }

  async function fetchProduct(id: string) {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetch(`/api/product/${id}`)
      if (!response.ok) throw new Error('Product not found')

      const raw = await response.json()
      currentProduct.value = normalizeProduct(raw)

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error fetching product:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchBanners() {
    try {
      const response = await fetch('/api/banners')
      if (!response.ok) throw new Error('Failed to fetch banners')
      const raw = await response.json()
      // Normalize shape to { id, image, href, active:number, order, openInNewTab }
      const data: Banner[] = (raw as any[]).map((b: any) => ({
        id: String(b.id),
        image: b.image || b.imageUrl || '',
        href: b.href ?? b.linkUrl ?? null,
        active: typeof b.active === 'boolean' ? (b.active ? 1 : 0) : (b.active ?? (b.isActive ? 1 : 0)),
        order: b.order ?? 0,
        openInNewTab: b.openInNewTab ?? 0, // API returns 0/1, default to 0
        title: b.title ?? b.name ?? undefined,
        description: b.description ?? undefined,
        ctaText: b.ctaText ?? b.buttonText ?? null,
      }))
      // show only active banners sorted by order asc
      banners.value = data
        .filter(b => b.active === 1)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error fetching banners:', err)
    }
  }

  async function searchProducts(query: string) {
    if (!query.trim()) {
      searchQuery.value = ''
      await fetchProducts()
      return
    }

    try {
      isLoading.value = true
      error.value = null
      searchQuery.value = query

      // Client-side search since API might be missing
      const lowerQuery = query.toLowerCase()
      const results = allProducts.value.filter(p =>
        (p.title || '').toLowerCase().includes(lowerQuery) ||
        (p.description || '').toLowerCase().includes(lowerQuery)
      )

      products.value = results
      hasMore.value = false

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error searching products:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function setActiveCategory(categorySlug: string | null) {
    activeCategory.value = categorySlug
    currentPage.value = 0
    activeSize.value = null
    updateSizePreset()
    // Ждем завершения текущей загрузки, чтобы не проигнорировать новый запрос
    await waitForIdle()
    return fetchProducts()
  }

  async function setSortBy(sort: SortOption) {
    sortBy.value = sort
    currentPage.value = 0
    await waitForIdle()
    return fetchProducts()
  }

  function setActiveSize(size: string | null) {
    if (!size) {
      activeSize.value = null
      return
    }

    const normalized = size.toUpperCase()
    activeSize.value = activeSize.value === normalized ? null : normalized
  }

  function updateSizePreset() {
    const slug = activeCategory.value
    const preset = getSizePresetForCategory(slug)
    sizePreset.value = preset

    if (activeSize.value && !preset.values.includes(activeSize.value)) {
      activeSize.value = null
    }
  }

  function loadMoreProducts() {
    if (hasMore.value && !isLoading.value) {
      fetchProducts(true)
    }
  }

  function clearSearch() {
    searchQuery.value = ''
    fetchProducts()
  }

  function clearError() {
    error.value = null
  }

  function clearCurrentProduct() {
    currentProduct.value = null
  }

  // Cart actions
  async function addToCart(product: Product, quantity: number = 1) {
    const existingItem = cart.value.find(item => item.product.id === product.id)
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.value.push({ product: { ...product, is_available: true }, quantity })
    }

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cart.value))
    }
  }

  async function updateCartItem(productId: string, newQuantity: number) {
    const item = cart.value.find(item => item.product.id === productId)
    if (item) {
      if (newQuantity <= 0) {
        await removeFromCart(productId)
      } else {
        item.quantity = newQuantity
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('cart', JSON.stringify(cart.value))
        }
      }
    }
  }

  async function removeFromCart(productId: string) {
    cart.value = cart.value.filter(item => item.product.id !== productId)

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cart.value))
    }
  }

  async function clearCart() {
    cart.value = []

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cart')
    }
  }

  // Load cart from localStorage
  function loadCart() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cart')
      if (saved) {
        try {
          cart.value = JSON.parse(saved)
        } catch (e) {
          console.error('Error loading cart:', e)
          cart.value = []
        }
      }
    }
  }

  // Initialize
  async function initialize() {
    loadCart()
    await Promise.all([
      fetchCategories(),
      fetchBanners(),
      fetchProducts(),
      fetchAllProducts() // Load all products for category counts
    ])
  }

  return {
    // State
    categories,
    products,
    allProducts,
    banners,
    currentProduct,
    activeCategory,
    sortBy,
    searchQuery,
    activeSize,
    isLoading,
    error,
    currentPage,
    hasMore,
    totalProducts,
    cart,

    // Computed
    filteredProducts,
    activeCategoryName,
    categoriesWithProductCounts,
    availableSizes,
    sizePreset,

    // Actions
    fetchCategories,
    fetchProducts,
    fetchAllProducts,
    fetchProduct,
    fetchBanners,
    searchProducts,
    setActiveCategory,
    setSortBy,
    setActiveSize,
    loadMoreProducts,
    clearSearch,
    clearError,
    clearCurrentProduct,
    initialize,

    // Cart actions
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
  }
})
