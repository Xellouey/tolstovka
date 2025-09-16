"use client"
import React, { useEffect, useMemo, useState } from 'react'
import type { Category, Product } from '@/lib/types'
import { openTelegramLink } from '@/lib/telegram'

function formatPriceRUB(value: number) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value)
}

export default function ProductGrid({ categoryId, categories }: { categoryId: string | null; categories: Category[] }) {
  const [sort, setSort] = useState<'price:asc' | 'price:desc'>('price:asc')
  const [products, setProducts] = useState<Product[]>([])

  const manager = process.env.NEXT_PUBLIC_TG_MANAGER_USERNAME || 'manager_username'

  async function load() {
    const params = new URLSearchParams()
    if (categoryId) params.set('categoryId', categoryId)
    params.set('sortBy', sort)
    const res = await fetch(`/api/products?${params.toString()}`, { cache: 'no-store' })
    const data = await res.json()
    setProducts(data)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, sort])

  const categoryMap = useMemo(() => Object.fromEntries(categories.map(c => [c.id, c.name])), [categories])

  function handleContact(p: Product) {
    const text = `Хочу купить: ${categoryMap[p.categoryId] || ''} / ${p.name} — ${formatPriceRUB(p.price)} — ID:${p.id}`
    const url = `https://t.me/${manager}?text=${encodeURIComponent(text)}`
    openTelegramLink(url)
  }

  return (
    <div className="px-4 mt-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm opacity-80">Товаров: {products.length}</div>
        <select value={sort} onChange={e=>setSort(e.target.value as any)} className="text-sm px-2 py-1 rounded border bg-white/80">
          <option value="price:asc">Цена: по возрастанию</option>
          <option value="price:desc">Цена: по убыванию</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {products.map(p => (
          <div key={p.id} className="bg-white rounded-xl overflow-hidden border border-black/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.images[0]} alt={p.name} className="w-full h-48 object-cover" loading="lazy" />
            <div className="p-2 flex items-center justify-between">
              <div className="text-sm font-medium leading-tight">
                <div className="truncate max-w-[8rem]" title={p.name}>{p.name}</div>
                <div className="text-xs opacity-70">{formatPriceRUB(p.price)}</div>
              </div>
              <button onClick={() => handleContact(p)} className="text-xs bg-brandText text-brand px-2 py-1 rounded">Написать</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}