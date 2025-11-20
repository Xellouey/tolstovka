<template>
  <div class="space-y-5">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h2 class="text-xl font-semibold text-brand-dark font-primary">Запланированные дропы</h2>
        <p class="text-sm text-gray-500 font-primary">Товары со статусом «Отложен», которые автоматически опубликуются в указанное время.</p>
      </div>
      <button
        type="button"
        @click="$emit('refresh')"
        class="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-brand-dark text-white text-sm font-medium shadow-md hover:bg-brand-dark/90 transition-all duration-200"
      >
        Обновить список
      </button>
    </div>

    <div v-if="isLoading" class="p-6 bg-white border rounded-xl text-center text-sm text-gray-600">
      Загружаем запланированные товары...
    </div>

    <div v-else-if="groups.length === 0" class="p-6 bg-white border rounded-xl text-center text-sm text-gray-600">
      Пока нет товаров со статусом «Отложен». Создайте товар в разделе «Товары», выберите статус «Отложенный» и задайте дату публикации — они появятся здесь.
    </div>

    <div v-else class="space-y-5">
      <div
        v-for="group in groups"
        :key="group.key"
        class="bg-white border rounded-2xl shadow-sm overflow-hidden"
      >
        <div class="px-4 py-3 sm:px-6 sm:py-4 bg-gray-50 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 font-primary">{{ group.label }}</h3>
            <p v-if="group.subtitle" class="text-sm text-gray-500 font-primary">{{ group.subtitle }}</p>
          </div>
          <span class="inline-flex items-center px-3 py-1 text-xs font-semibold text-gray-600 bg-white rounded-full border">{{ group.items.length }} шт.</span>
        </div>
        <ul class="divide-y divide-gray-100">
          <li
            v-for="product in group.items"
            :key="product.id"
            class="px-4 py-3 sm:px-6 sm:py-4 flex items-start gap-3"
          >
            <img
              :src="product.images?.[0] || placeholder"
              class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border"
              alt="Изображение товара"
            />
            <div class="flex-1 min-w-0">
              <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div class="min-w-0">
                  <h4 class="text-base sm:text-lg font-semibold text-gray-900 truncate">{{ product.title || product.id }}</h4>
                  <p class="text-sm text-gray-500">Категория: {{ product.categoryName || product.categoryId }}</p>
                  <p v-if="product.priceRub" class="text-sm text-gray-700 mt-1">Цена: {{ product.priceRub }} ₽</p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-amber-100 text-amber-800 border border-amber-200">
                    Отложен
                  </span>
                  <button
                    type="button"
                    class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-dark text-white shadow-sm hover:bg-brand-dark/90 transition-all"
                    @click="$emit('open', product.id)"
                  >
                    Редактировать
                  </button>
                </div>
              </div>
              <div class="mt-2 text-sm text-gray-600 flex flex-wrap items-center gap-2">
                <span class="font-medium">Старт:&nbsp;</span>
                <span>{{ formatPublishAt(product.publishAt) }}</span>
                <span class="hidden sm:inline text-gray-400">•</span>
                <span v-if="product.createdAt" class="text-gray-500">Создан: {{ formatDate(product.createdAt) }}</span>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ScheduledProduct {
  id: string
  title?: string
  priceRub?: number
  categoryId: string
  categoryName?: string
  publishAt?: string | null
  createdAt?: string
  images?: string[]
}

const props = defineProps<{
  products: ScheduledProduct[]
  isLoading?: boolean
}>()

defineEmits<{ (e: 'refresh'): void; (e: 'open', productId: string): void }>()

const placeholder = 'https://placehold.co/120x120/f3f4f6/9ca3af?text=IMG'

const groups = computed(() => {
  const items = [...(props.products || [])].sort((a, b) => {
    const aTime = a.publishAt ? new Date(a.publishAt).getTime() : Number.POSITIVE_INFINITY
    const bTime = b.publishAt ? new Date(b.publishAt).getTime() : Number.POSITIVE_INFINITY
    return aTime - bTime
  })

  const map = new Map<string, { key: string; label: string; subtitle?: string; items: ScheduledProduct[] }>()

  items.forEach((product) => {
    const publish = product.publishAt ? new Date(product.publishAt) : null
    const key = publish ? publish.toISOString().slice(0, 10) : 'no-date'

    if (!map.has(key)) {
      const label = publish
        ? publish.toLocaleDateString('ru-RU', { weekday: 'long', month: 'long', day: 'numeric' })
        : 'Без даты публикации'
      const subtitle = publish
        ? `Время публикации: ${publish.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`
        : undefined
      map.set(key, { key, label, subtitle, items: [] })
    }

    map.get(key)!.items.push(product)
  })

  return Array.from(map.values())
})

function formatPublishAt(value?: string | null) {
  if (!value) return 'Не указано'
  try {
    return new Date(value).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
  } catch (error) {
    console.warn('Не удалось отформатировать publishAt', error)
    return value
  }
}

function formatDate(value?: string) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
  } catch (error) {
    return value
  }
}
</script>
