"use client"
import React from 'react'
import type { Banner } from '@/lib/types'

export default function BannerCarousel({ banners }: { banners: Banner[] }) {
  if (!banners?.length) return null
  return (
    <div className="px-4">
      <div className="flex gap-3 overflow-x-auto scroll-snap-x pb-2">
        {banners.map((b) => (
          <a key={b.id} href={b.linkUrl} target="_blank" rel="noreferrer" className="min-w-full snap-center">
            <div className="banner-box w-full bg-white/50 rounded-xl overflow-hidden border border-black/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.imageUrl} alt="banner" className="w-full h-full object-cover" loading="lazy" />
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}