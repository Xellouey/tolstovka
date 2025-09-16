"use client"
import React, { useState } from 'react'
import type { Category } from '@/lib/types'
import CategoryTabs from './CategoryTabs'
import ProductGrid from './ProductGrid'

export default function Catalog({ categories, initialCategoryId }: { categories: Category[]; initialCategoryId: string | null }) {
  const [selectedId, setSelectedId] = useState<string | null>(initialCategoryId)
  return (
    <>
      <CategoryTabs categories={categories} selectedId={selectedId} onSelect={setSelectedId} />
      <ProductGrid categoryId={selectedId} categories={categories} />
    </>
  )
}