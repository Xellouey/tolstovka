import './globals.css'
import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'TOLSTOVKA — Mini App',
  description: 'Каталог и админка внутри Telegram Mini App',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="main-safe-area min-h-screen bg-brand text-brandText">
        {children}
      </body>
    </html>
  )
}