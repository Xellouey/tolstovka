<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-900">Управление баннерами</h2>
      <button
        @click="$emit('create')"
        class="px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-dark/90 transition-colors"
      >
        Добавить баннер
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border p-6">
      <div v-if="isLoading" class="text-center py-8">
        <div class="animate-spin w-8 h-8 border-4 border-brand-dark border-t-transparent rounded-full mx-auto"></div>
        <p class="mt-2 text-gray-600">Загрузка баннеров...</p>
      </div>

      <div v-else-if="localBanners.length" class="space-y-4">
        <draggable
          v-model="localBanners"
          item-key="id"
          handle=".handle"
          ghost-class="opacity-50 bg-gray-50"
          :animation="150"
          @end="onEnd"
        >
          <template #item="{ element: banner, index }">
            <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div class="handle cursor-move p-2 text-gray-400 hover:text-gray-600 transition-colors" title="Перетащите для изменения порядка">
                <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M3 7h14M3 10h14M3 13h14"/></svg>
              </div>

              <div class="flex items-center gap-3 flex-1 min-w-0">
                <img :src="imageOf(banner)" :alt="banner.id" @error="onImgError" class="w-20 h-8 object-cover rounded border" />
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ banner.title || banner.id }}</p>
                  <p class="text-xs text-gray-500 truncate" v-if="linkOf(banner)">{{ linkOf(banner) }}</p>
                  <div class="flex items-center gap-3 mt-1">
                    <span class="text-xs text-gray-500">Порядок: {{ index + 1 }}</span>
                    <span :class="isActive(banner) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium">
                      <span :class="isActive(banner) ? 'bg-green-400' : 'bg-gray-400'" class="w-2 h-2 rounded-full mr-1.5"></span>
                      {{ isActive(banner) ? 'Активен' : 'Неактивен' }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="flex items-center space-x-2">
                <button @click="$emit('edit', banner)" class="px-3 py-1 text-sm text-blue-600 hover:text-blue-800">Редактировать</button>
                <button @click="$emit('toggleStatus', banner.id)" class="px-3 py-1 text-sm text-yellow-600 hover:text-yellow-800">
                  {{ isActive(banner) ? 'Отключить' : 'Включить' }}
                </button>
                <button @click="$emit('delete', banner.id)" class="px-3 py-1 text-sm text-red-600 hover:text-red-800">Удалить</button>
              </div>
            </div>
          </template>
        </draggable>

        <div class="text-sm text-gray-500 text-center py-2 border-t">
          <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
          </svg>
          Перетащите баннеры для изменения порядка отображения
        </div>
      </div>

      <div v-else class="text-center py-8">
        <p class="text-gray-600">Баннеров нет</p>
        <button
          @click="$emit('create')"
          class="mt-4 px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-dark/90 transition-colors"
        >
          Создать первый баннер
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'

interface Banner {
  id: string
  title?: string
  description?: string
  image?: string
  imageUrl?: string
  href?: string
  linkUrl?: string
  isActive?: boolean
  active?: boolean
  order?: number
}

const props = withDefaults(defineProps<{ banners: Banner[]; isLoading?: boolean }>(), { isLoading: false })
const emit = defineEmits<{
  (e: 'create'): void
  (e: 'edit', banner: Banner): void
  (e: 'delete', id: string): void
  (e: 'reorder', list: { id: string; order: number }[]): void
  (e: 'toggleStatus', id: string): void
}>()

const localBanners = ref<Banner[]>([])
watch(() => props.banners, (val) => { localBanners.value = Array.isArray(val) ? [...val] : [] }, { immediate: true })

function isActive(b: Banner) { return (b.active ?? b.isActive) ?? false }
function imageOf(b: Banner) { return b.image || b.imageUrl || 'https://placehold.co/80x32/f3f4f6/9ca3af?text=No+Image' }
function linkOf(b: Banner) { return b.href || b.linkUrl || '' }
function onImgError(e: Event) { (e.target as HTMLImageElement).src = 'https://placehold.co/80x32/f3f4f6/9ca3af?text=Error' }

function onEnd() {
  const payload = localBanners.value.map((b, i) => ({ id: b.id, order: i + 1 }))
  emit('reorder', payload)
}
</script>
