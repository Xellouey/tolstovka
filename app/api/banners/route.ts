import { NextResponse } from 'next/server'
import { store } from '@/lib/store'
import { isAdmin } from '@/lib/auth'

export async function GET() {
  return NextResponse.json(store.listBanners())
}

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { imageUrl, linkUrl } = await req.json()
  if (!imageUrl || !linkUrl) return NextResponse.json({ error: 'Invalid' }, { status: 400 })
  const b = store.addBanner(imageUrl, linkUrl)
  return NextResponse.json(b)
}

export async function PUT(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, ...patch } = await req.json()
  if (!id) return NextResponse.json({ error: 'Invalid' }, { status: 400 })
  const next = store.updateBanner(id, patch)
  if (!next) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(next)
}

export async function DELETE(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Invalid' }, { status: 400 })
  const ok = store.deleteBanner(id)
  return NextResponse.json({ ok })
}