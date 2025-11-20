import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CategoryView from '@/views/CategoryView.vue'

// Simple flush helper
const wait = (ms = 0) => new Promise(res => setTimeout(res, ms))

function setupFetchMock({ categories, products }: { categories: any[]; products: any[] }) {
  const json = (data: any) => ({ ok: true, json: async () => data }) as Response
  const mock = vi.fn(async (url: RequestInfo | URL) => {
    const href = String(url)
    if (href.startsWith('/api/categories')) return json(categories)
    if (href.startsWith('/api/products')) return json({ products, total: products.length, hasMore: false })
    if (href.startsWith('/api/banners')) return json([])
    return json({})
  })
  // @ts-ignore
  global.fetch = mock
  return mock
}

describe('CategoryView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders products for category slug', async () => {
    const categories = [{ id: 'c1', slug: 'pidzhaki', name: 'Пиджаки', order: 1 }]
    const products = [{ id: 'p1', categoryId: 'c1', title: 'Пиджак A', priceRub: 1990, description: '', images: [], createdAt: new Date().toISOString() }]
    const fetchMock = setupFetchMock({ categories, products })

    const wrapper = mount(CategoryView, { props: { slug: 'pidzhaki' } })

    // give the component time to fetch and render
    await wait(0)
    await wait(0)

    expect(fetchMock).toHaveBeenCalled()
    expect(wrapper.text()).toContain('Пиджак A')
  })

  it('recovers if a previous fetch is in-flight and still shows the correct products', async () => {
    // First batch (for initial fetch) — unrelated category
    const categories = [
      { id: 'c1', slug: 'pidzhaki', name: 'Пиджаки', order: 1 },
      { id: 'c2', slug: 'jeans', name: 'Джинсы', order: 2 },
    ]

    // Two-phase fetch mock: first call to /api/products returns empty (simulate in-flight/all-products),
    // second call returns the correct category products
    let productsPhase = 0
    const json = (data: any) => ({ ok: true, json: async () => data }) as Response
    const mock = vi.fn(async (url: RequestInfo | URL) => {
      const href = String(url)
      if (href.startsWith('/api/categories')) return json(categories)
      if (href.startsWith('/api/products')) {
        productsPhase += 1
        if (productsPhase === 1) {
          // initial/all-products fetch
          return json({ products: [], total: 0, hasMore: false })
        }
        // fetch for the slug
        return json({ products: [{ id: 'p2', categoryId: 'c1', title: 'Пиджак B', priceRub: 2990, description: '', images: [], createdAt: new Date().toISOString() }], total: 1, hasMore: false })
      }
      if (href.startsWith('/api/banners')) return json([])
      return json({})
    })
    // @ts-ignore
    global.fetch = mock

    const wrapper = mount(CategoryView, { props: { slug: 'pidzhaki' } })

    await wait(0)
    await wait(20)

    expect(wrapper.text()).toContain('Пиджак B')
  })
})
