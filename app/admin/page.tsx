"use client"
import React, { useEffect, useMemo, useState } from 'react'
import type { Banner, Category, Product } from '@/lib/types'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-2 text-sm">{label}
      <div className="mt-1">{children}</div>
    </label>
  )
}

export default function AdminPage() {
  const [auth, setAuth] = useState<boolean | null>(null)

  const [banners, setBanners] = useState<Banner[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])

  // Forms
  const [bannerImageUrl, setBannerImageUrl] = useState('')
  const [bannerLinkUrl, setBannerLinkUrl] = useState('')

  const [catName, setCatName] = useState('')
  const [catSlug, setCatSlug] = useState('')
  const [catOrder, setCatOrder] = useState<number>(Date.now())

  const [prodName, setProdName] = useState('')
  const [prodPrice, setProdPrice] = useState<number>(0)
  const [prodCategoryId, setProdCategoryId] = useState<string>('')
  const [prodImages, setProdImages] = useState<string>('')

  const [newUser, setNewUser] = useState('')
  const [newPass, setNewPass] = useState('')

  async function loadAll() {
    const st = await fetch('/api/auth/status').then(r=>r.json())
    setAuth(st.authenticated)
    const [b, c, p] = await Promise.all([
      fetch('/api/banners').then(r=>r.json()),
      fetch('/api/categories').then(r=>r.json()),
      fetch('/api/products').then(r=>r.json()),
    ])
    setBanners(b)
    setCategories(c)
    setProducts(p)
    if (!prodCategoryId && c[0]) setProdCategoryId(c[0].id)
  }

  useEffect(() => { loadAll() }, [])

  if (auth === false) {
    return (
      <main className="p-4">
        <div className="bg-white rounded-xl p-4 border border-black/10">
          <div className="mb-2">Вы не авторизованы.</div>
          <a href="/admin/login" className="underline">Перейти к форме входа</a>
        </div>
      </main>
    )
  }

  return (
    <main className="p-4 space-y-6">
      <section className="bg-white rounded-xl p-4 border border-black/10">
        <h2 className="font-semibold mb-3">Баннеры</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Field label="Ссылка на изображение (URL)">
              <input value={bannerImageUrl} onChange={e=>setBannerImageUrl(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="https://.../banner.webp"/>
            </Field>
            <Field label="Куда ведёт баннер (URL)">
              <input value={bannerLinkUrl} onChange={e=>setBannerLinkUrl(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="https://..."/>
            </Field>
            <button onClick={async()=>{
              const ok = await fetch('/api/banners', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ imageUrl: bannerImageUrl, linkUrl: bannerLinkUrl }) })
              if (ok.ok) { setBannerImageUrl(''); setBannerLinkUrl(''); loadAll() }
            }} className="bg-brandText text-brand px-4 py-2 rounded">Добавить баннер</button>
          </div>
          <div className="space-y-2">
            {banners.map(b => (
              <div key={b.id} className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.imageUrl} alt="banner" className="w-24 h-12 object-cover rounded border" />
                <input className="flex-1 px-2 py-1 border rounded" defaultValue={b.linkUrl} onBlur={async(e)=>{
                  await fetch('/api/banners', { method: 'PUT', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ id: b.id, linkUrl: e.target.value }) })
                }} />
                <button onClick={async()=>{ await fetch('/api/banners', { method: 'DELETE', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ id: b.id }) }); loadAll() }} className="text-sm underline">Удалить</button>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-3">Рекомендованное соотношение сторон баннера: 2.5:1 (например 1200×480). Форматы: JPG/PNG/WebP. Вес до ~500KB.</p>
      </section>

      <section className="bg-white rounded-xl p-4 border border-black/10">
        <h2 className="font-semibold mb-3">Категории</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Field label="Название">
              <input value={catName} onChange={e=>setCatName(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="Футболки"/>
            </Field>
            <Field label="Slug (латиницей)">
              <input value={catSlug} onChange={e=>setCatSlug(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="tshirts"/>
            </Field>
            <Field label="Порядок (число)">
              <input type="number" value={catOrder} onChange={e=>setCatOrder(parseInt(e.target.value||'0'))} className="w-full px-3 py-2 border rounded"/>
            </Field>
            <button onClick={async()=>{
              const ok = await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ name: catName, slug: catSlug, order: catOrder }) })
              if (ok.ok) { setCatName(''); setCatSlug(''); setCatOrder(Date.now()); loadAll() }
            }} className="bg-brandText text-brand px-4 py-2 rounded">Добавить категорию</button>
          </div>
          <div className="space-y-2">
            {categories.map(c => (
              <div key={c.id} className="flex items-center gap-2">
                <input className="flex-1 px-2 py-1 border rounded" defaultValue={c.name} onBlur={async(e)=>{
                  await fetch('/api/categories', { method: 'PUT', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ id: c.id, name: e.target.value }) })
                }} />
                <input className="w-40 px-2 py-1 border rounded" defaultValue={c.slug} onBlur={async(e)=>{
                  await fetch('/api/categories', { method: 'PUT', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ id: c.id, slug: e.target.value }) })
                }} />
                <button onClick={async()=>{ await fetch('/api/categories', { method: 'DELETE', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ id: c.id }) }); loadAll() }} className="text-sm underline">Удалить</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl p-4 border border-black/10">
        <h2 className="font-semibold mb-3">Товары</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Field label="Название">
              <input value={prodName} onChange={e=>setProdName(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="Футболка ..."/>
            </Field>
            <Field label="Цена (₽)">
              <input type="number" value={prodPrice} onChange={e=>setProdPrice(parseInt(e.target.value||'0'))} className="w-full px-3 py-2 border rounded" />
            </Field>
            <Field label="Категория">
              <select value={prodCategoryId} onChange={e=>setProdCategoryId(e.target.value)} className="w-full px-3 py-2 border rounded">
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Ссылки на фото (по одной в строке)">
              <textarea value={prodImages} onChange={e=>setProdImages(e.target.value)} className="w-full px-3 py-2 border rounded min-h-[100px]" placeholder="https://.../1.jpg\nhttps://.../2.jpg"/>
            </Field>
            <button onClick={async()=>{
              const images = prodImages.split(/\r?\n/).map(s=>s.trim()).filter(Boolean)
              const ok = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ name: prodName, price: prodPrice, categoryId: prodCategoryId, images }) })
              if (ok.ok) { setProdName(''); setProdPrice(0); setProdImages(''); loadAll() }
            }} className="bg-brandText text-brand px-4 py-2 rounded">Добавить товар</button>
          </div>
          <div className="space-y-2">
            {products.map(p => (
              <div key={p.id} className="flex items-start gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.images[0]} alt={p.name} className="w-16 h-16 object-cover rounded border" />
                <div className="flex-1">
                  <input className="w-full px-2 py-1 border rounded mb-1" defaultValue={p.name} onBlur={async(e)=>{
                    await fetch('/api/products', { method: 'PUT', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ id: p.id, name: e.target.value }) })
                  }} />
                  <div className="flex items-center gap-2 flex-wrap">
                    <input type="number" className="w-28 px-2 py-1 border rounded" defaultValue={p.price} onBlur={async(e)=>{
                      await fetch('/api/products', { method: 'PUT', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ id: p.id, price: parseInt(e.target.value||'0') }) })
                    }} />
                    <select defaultValue={p.categoryId} onChange={async(e)=>{
                      await fetch('/api/products', { method: 'PUT', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ id: p.id, categoryId: e.target.value }) })
                    }} className="w-44 px-2 py-1 border rounded bg-white">
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button onClick={async()=>{ await fetch('/api/products', { method: 'DELETE', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ id: p.id }) }); loadAll() }} className="text-sm underline">Удалить</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl p-4 border border-black/10">
        <h2 className="font-semibold mb-3">Настройки админа</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Field label="Новый логин">
              <input value={newUser} onChange={e=>setNewUser(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="admin"/>
            </Field>
            <Field label="Новый пароль">
              <input type="password" value={newPass} onChange={e=>setNewPass(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="••••••"/>
            </Field>
            <button onClick={async()=>{
              await fetch('/api/auth/creds', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ username: newUser, password: newPass }) })
              setNewUser(''); setNewPass('')
            }} className="bg-brandText text-brand px-4 py-2 rounded">Обновить</button>
          </div>
          <div>
            <button onClick={async()=>{ await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/' }} className="bg-black text-white px-4 py-2 rounded">Выйти</button>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-3">Внимание: без подключения к базе на Vercel изменения логина/пароля и данных сохраняются только на время работы сервера (для локальной разработки).</p>
      </section>
    </main>
  )
}