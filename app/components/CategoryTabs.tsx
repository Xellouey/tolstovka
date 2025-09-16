"use client"
import React from 'react'
import type { Category } from '@/lib/types'

export default function CategoryTabs({ categories, selectedId, onSelect }: { categories: Category[]; selectedId: string | null; onSelect: (id: string | null) => void }) {
  return (
    <div className="px-4 mt-4 flex gap-2 flex-wrap">
      <button onClick={() => onSelect(null)} className={`px-3 py-1 rounded-full border ${selectedId===null? 'bg-brandText text-brand' : 'bg-white/70'} transition`}>Все</button>
      {categories.map(c => (
        <button key={c.id} onClick={() => onSelect(c.id)} className={`px-3 py-1 rounded-full border ${selectedId===c.id? 'bg-brandText text-brand' : 'bg-white/70'} transition`}>{c.name}</button>
      ))}
    </div>
  )
}