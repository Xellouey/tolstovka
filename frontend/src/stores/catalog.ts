import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
}

export interface Banner {
  id: string
  image: string
  href: string | null
  active: number
  order: number
}

export type SortOption = 'price_asc' | 'price_desc' | 'newest' | 'oldest'

export const useCatalogStore = defineStore('catalog', () => {
  // State
  const categories = ref<Category[]>([])
  const products = ref<Product[]>([])
  const banners = ref<Banner[]>([])
  const currentProduct = ref<Product | null>(null)
  
  const activeCategory = ref<string | null>(null)
  const sortBy = ref<SortOption>('price_asc')
  const searchQuery = ref('')
  
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
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
        filtered = filtered.filter(p => p.categoryId === category.id)
      }
    }
    
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query)
      )
    }
    
    return filtered
  })

  const activeCategoryName = computed(() => {
    if (!activeCategory.value) return 'Все товары'
    const category = categories.value.find(c => c.slug === activeCategory.value)
    return category?.name || 'Все товары'
  })

  // Actions
  async function fetchCategories() {
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) throw new Error('Failed to fetch categories')
      categories.value = await response.json()
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
      
      if (loadMore) {
        products.value.push(...data.products)
        currentPage.value++
      } else {
        products.value = data.products
        currentPage.value = 0
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

  async function fetchProduct(id: string) {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await fetch(`/api/product/${id}`)
      if (!response.ok) throw new Error('Product not found')
      
      currentProduct.value = await response.json()
      
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
      banners.value = await response.json()
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
      
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=50`)
      if (!response.ok) throw new Error('Search failed')
      
      const data = await response.json()
      products.value = data.results
      hasMore.value = false
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error searching products:', err)
    } finally {
      isLoading.value = false
    }
  }

  function setActiveCategory(categorySlug: string | null) {
    activeCategory.value = categorySlug
    currentPage.value = 0
    fetchProducts()
  }

  function setSortBy(sort: SortOption) {
    sortBy.value = sort
    currentPage.value = 0
    fetchProducts()
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

  // Initialize
  async function initialize() {
    await Promise.all([
      fetchCategories(),
      fetchBanners(),
      fetchProducts()
    ])
  }

  return {
    // State
    categories,
    products,
    banners,
    currentProduct,
    activeCategory,
    sortBy,
    searchQuery,
    isLoading,
    error,
    currentPage,
    hasMore,
    totalProducts,
    
    // Computed
    filteredProducts,
    activeCategoryName,
    
    // Actions
    fetchCategories,
    fetchProducts,
    fetchProduct,
    fetchBanners,
    searchProducts,
    setActiveCategory,
    setSortBy,
    loadMoreProducts,
    clearSearch,
    clearError,
    initialize
  }
})