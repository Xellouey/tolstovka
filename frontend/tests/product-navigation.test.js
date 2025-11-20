/**
 * Test для проверки навигации к товару после исправления роутинга
 * Проверяет что клик по ProductCard успешно открывает ProductView
 * без ошибок "No match for category"
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import ProductView from '@/views/ProductView.vue'
import CategoryView from '@/views/CategoryView.vue'

// Mock данные для тестирования
const mockProduct = {
  id: 'p_test123',
  title: 'Test Product',
  priceRub: 1500,
  images: ['test-image.jpg'],
  categoryId: 'cat_test1',
  createdAt: '2023-01-01T00:00:00Z',
  description: 'Test product description'
}

const mockCategory = {
  id: 'cat_test1',
  slug: 'test-category',
  name: 'Test Category'
}

// Mock Pinia store
const mockCatalogStore = {
  products: [mockProduct],
  categories: [mockCategory],
  currentProduct: null,
  filteredProducts: [mockProduct],
  isLoading: false,
  error: null,
  initialize: vi.fn(),
  fetchProduct: vi.fn().mockResolvedValue(mockProduct),
  fetchCategories: vi.fn().mockResolvedValue([mockCategory])
}

vi.mock('@/stores/catalog', () => ({
  useCatalogStore: () => mockCatalogStore
}))

// Mock Heroicons
vi.mock('@heroicons/vue/24/outline', () => ({
  ArrowLeftIcon: { template: '<div>ArrowLeft</div>' },
  ChevronDownIcon: { template: '<div>ChevronDown</div>' },
  TagIcon: { template: '<div>Tag</div>' },
  ShoppingCartIcon: { template: '<div>Cart</div>' },
  MinusIcon: { template: '<div>Minus</div>' },
  PlusIcon: { template: '<div>Plus</div>' },
  ClockIcon: { template: '<div>Clock</div>' },
  ChevronLeftIcon: { template: '<div>ChevronLeft</div>' },
  ChevronRightIcon: { template: '<div>ChevronRight</div>' },
  ShoppingBagIcon: { template: '<div>Bag</div>' },
  ExclamationTriangleIcon: { template: '<div>Warning</div>' }
}))

// Mock embla carousel
vi.mock('embla-carousel-vue', () => ({
  default: () => [null, { value: null }]
}))
vi.mock('embla-carousel-autoplay', () => ({
  default: () => ({})
}))

describe('Product Navigation Fix', () => {
  let router

  beforeEach(() => {
    // Создаём роутер с исправленными маршрутами
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: 'home', component: HomeView },
        { path: '/p/:id', name: 'product', component: ProductView, props: true },
        { path: '/category/:slug', name: 'category', component: CategoryView, props: true }
      ]
    })
  })

  it('should navigate to product page without router errors', async () => {
    // Mount HomeView with router
    const wrapper = mount(HomeView, {
      global: {
        plugins: [router]
      }
    })

    // Дождаться инициализации
    await wrapper.vm.$nextTick()

    // Проверить что ProductCard рендерится без ошибок
    expect(wrapper.findComponent({ name: 'ProductCard' }).exists()).toBe(true)
    
    // Симулировать клик по товару
    const productCard = wrapper.findComponent({ name: 'ProductCard' })
    await productCard.trigger('click')
    
    // Проверить что навигация произошла без ошибок
    expect(router.currentRoute.value.name).toBe('product')
    expect(router.currentRoute.value.params.id).toBe(mockProduct.id)
  })

  it('should resolve category route correctly', async () => {
    // Тестируем что роутер теперь правильно резолвит category маршрут
    const categoryRoute = router.resolve({ 
      name: 'category', 
      params: { slug: 'test-category' } 
    })
    
    expect(categoryRoute.name).toBe('category')
    expect(categoryRoute.params.slug).toBe('test-category')
    expect(categoryRoute.matched.length).toBeGreaterThan(0)
  })

  it('should render ProductView with category link without errors', async () => {
    // Переходим на страницу товара
    await router.push({ name: 'product', params: { id: mockProduct.id } })
    
    // Mock currentProduct для ProductView
    mockCatalogStore.currentProduct = mockProduct
    
    const wrapper = mount(ProductView, {
      global: {
        plugins: [router]
      },
      props: {
        id: mockProduct.id
      }
    })

    await wrapper.vm.$nextTick()
    
    // Проверить что RouterLink к category рендерится без ошибок
    const categoryLink = wrapper.find('router-link[to*="category"]')
    expect(categoryLink.exists()).toBe(true)
    
    // Проверить что категория корректно отображается
    expect(wrapper.text()).toContain(mockCategory.name)
  })
})