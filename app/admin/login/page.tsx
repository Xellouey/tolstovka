"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) })
    if (res.ok) {
      router.push('/admin')
    } else {
      setError('Неверный логин или пароль')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <form onSubmit={onSubmit} className="bg-white rounded-xl p-6 w-full max-w-sm border border-black/10">
        <h1 className="text-lg font-semibold mb-4">Вход в админку</h1>
        <label className="block mb-2 text-sm">Логин
          <input value={username} onChange={e=>setUsername(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded" />
        </label>
        <label className="block mb-2 text-sm">Пароль
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded" />
        </label>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <button className="w-full bg-brandText text-brand py-2 rounded">Войти</button>
      </form>
    </main>
  )
}