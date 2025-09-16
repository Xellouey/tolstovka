import Catalog from '@/app/components/Catalog'
import BannerCarousel from '@/app/components/BannerCarousel'
import TopBar from '@/app/components/TopBar'
import { store } from '@/lib/store'

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const banners = store.listBanners()
  const categories = store.listCategories()
  const cat = categories.find(c => c.slug === params.slug)
  const initialCategoryId = cat?.id || null

  return (
    <main>
      <TopBar />
      <BannerCarousel banners={banners} />
      <Catalog categories={categories} initialCategoryId={initialCategoryId} />
    </main>
  )
}