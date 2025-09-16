"use client"
import Link from 'next/link'
import { readyExpand } from '@/lib/telegram'
import { useEffect } from 'react'

export default function TopBar() {
  useEffect(() => { readyExpand() }, [])
  return (
    <div className="w-full flex items-center justify-between px-4 py-3">
      <div className="font-bold tracking-wide">TOLSTOVKA</div>
      <Link href="/admin/login" className="underline">Вход</Link>
    </div>
  )
}