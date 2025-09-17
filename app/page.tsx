import TopBar from './components/TopBar'
import BannerCarousel from './components/BannerCarousel'
import Catalog from './components/Catalog'
import { store } from '@/lib/store'

export default async function Home() {
  const banners = store.listBanners()
  const categories = store.listCategories()
  const initialCategoryId = categories.find(c => c.slug === 'new-drop')?.id || null

  return (
    <main>
      <TopBar />
      <BannerCarousel banners={banners} />
      <Catalog categories={categories} initialCategoryId={initialCategoryId} />
    </main>
  )
}
