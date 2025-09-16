import { randomUUID } from 'crypto'
import type { Banner, Category, Id, Product } from './types'

class Store {
  categories: Map<Id, Category> = new Map()
  products: Map<Id, Product> = new Map()
  banners: Map<Id, Banner> = new Map()

  constructor() {
    // Стартовые данные: категория "Новый дроп"
    const dropId = randomUUID()
    this.categories.set(dropId, { id: dropId, name: 'Новый дроп', slug: 'new-drop', order: 1 })
  }

  // Categories
  listCategories(): Category[] {
    return Array.from(this.categories.values()).sort((a, b) => a.order - b.order)
  }
  addCategory(name: string, slug: string, order: number = Date.now()): Category {
    const id = randomUUID()
    const cat: Category = { id, name, slug, order }
    this.categories.set(id, cat)
    return cat
  }
  updateCategory(id: Id, patch: Partial<Category>): Category | null {
    const cur = this.categories.get(id)
    if (!cur) return null
    const next = { ...cur, ...patch, id: cur.id }
    this.categories.set(id, next)
    return next
  }
  deleteCategory(id: Id): boolean {
    // Удаляем товары этой категории
    for (const p of Array.from(this.products.values())) {
      if (p.categoryId === id) this.products.delete(p.id)
    }
    return this.categories.delete(id)
  }

  // Products
  listProducts(params?: { categoryId?: Id; sort?: 'price:asc' | 'price:desc' }): Product[] {
    let items = Array.from(this.products.values()).filter(p => p.active)
    if (params?.categoryId) items = items.filter(p => p.categoryId === params.categoryId)
    if (params?.sort === 'price:asc') items.sort((a, b) => a.price - b.price)
    if (params?.sort === 'price:desc') items.sort((a, b) => b.price - a.price)
    return items
  }
  addProduct(input: Omit<Product, 'id' | 'createdAt' | 'active' | 'currency'> & { price: number; images: string[]; }): Product {
    const id = randomUUID()
    const prod: Product = { id, name: input.name, price: input.price, currency: 'RUB', categoryId: input.categoryId, images: input.images, active: true, createdAt: Date.now() }
    this.products.set(id, prod)
    return prod
  }
  updateProduct(id: Id, patch: Partial<Product>): Product | null {
    const cur = this.products.get(id)
    if (!cur) return null
    const next = { ...cur, ...patch, id: cur.id }
    this.products.set(id, next)
    return next
  }
  deleteProduct(id: Id): boolean {
    return this.products.delete(id)
  }

  // Banners
  listBanners(): Banner[] {
    return Array.from(this.banners.values()).sort((a, b) => a.order - b.order).filter(b => b.active)
  }
  addBanner(imageUrl: string, linkUrl: string, order: number = Date.now()): Banner {
    const id = randomUUID()
    const b: Banner = { id, imageUrl, linkUrl, order, active: true }
    this.banners.set(id, b)
    return b
  }
  updateBanner(id: Id, patch: Partial<Banner>): Banner | null {
    const cur = this.banners.get(id)
    if (!cur) return null
    const next = { ...cur, ...patch, id: cur.id }
    this.banners.set(id, next)
    return next
  }
  deleteBanner(id: Id): boolean {
    return this.banners.delete(id)
  }
}

// Singleton
export const store = new Store()