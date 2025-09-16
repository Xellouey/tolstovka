import { NextResponse } from 'next/server'
import { store } from '@/lib/store'
import { isAdmin } from '@/lib/auth'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const categoryId = searchParams.get('categoryId') || undefined
  const sortBy = (searchParams.get('sortBy') as 'price:asc' | 'price:desc' | null) || undefined
  return NextResponse.json(store.listProducts({ categoryId: categoryId || undefined, sort: sortBy }))
}

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, price, categoryId, images } = await req.json()
  if (!name || typeof price !== 'number' || !categoryId || !Array.isArray(images) || images.length === 0) {
    return NextResponse.json({ error: 'Invalid' }, { status: 400 })
  }
  const prod = store.addProduct({ name, price, categoryId, images })
  return NextResponse.json(prod)
}

export async function PUT(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, ...patch } = await req.json()
  if (!id) return NextResponse.json({ error: 'Invalid' }, { status: 400 })
  const next = store.updateProduct(id, patch)
  if (!next) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(next)
}

export async function DELETE(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Invalid' }, { status: 400 })
  const ok = store.deleteProduct(id)
  return NextResponse.json({ ok })
}