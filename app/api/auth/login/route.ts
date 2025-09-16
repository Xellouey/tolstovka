import { NextResponse } from 'next/server'
import { login } from '@/lib/auth'

export async function POST(req: Request) {
  const { username, password } = await req.json()
  const res = login(username, password)
  if (!res.ok) return NextResponse.json({ ok: false }, { status: 401 })
  return NextResponse.json({ ok: true })
}