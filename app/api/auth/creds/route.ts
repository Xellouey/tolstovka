import { NextResponse } from 'next/server'
import { isAdmin, updateAdminCredentials } from '@/lib/auth'

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { username, password } = await req.json()
  updateAdminCredentials(username, password)
  return NextResponse.json({ ok: true })
}