<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-900">Управление категориями</h2>
      <button
        @click="$emit('create')"
        class="px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-dark/90 transition-colors"
      >
        Добавить категорию
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border p-6">
      <div v-if="isLoading" class="text-center py-8">
        <div class="animate-spin w-8 h-8 border-4 border-brand-dark border-t-transparent rounded-full mx-auto"></div>
        <p class="mt-2 text-gray-600">Загрузка категорий...</p>
      </div>

      <div v-else-if="localCategories.length" class="space-y-4">
        <draggable
          v-model="localCategories"
          item-key="id"
          handle=".handle"
          ghost-class="opacity-50 bg-gray-50"
          :animation="150"
          @end="onEnd"
        >
          <template #item="{ element: category, index }">
            <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div class="handle cursor-move p-2 text-gray-400 hover:text-gray-600 transition-colors" title="Перетащите для изменения порядка">
                <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M3 7h14M3 10h14M3 13h14"/></svg>
              </div>

              <div class="flex items-center gap-3 flex-1 min-w-0">
                <div class="flex-shrink-0 w-10 h-10 bg-brand-primary/20 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-brand-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                  </svg>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-base font-medium text-gray-900 truncate">{{ category.name }}</p>
                  <div class="flex items-center gap-4 mt-1">
                    <p class="text-sm text-gray-500 truncate">/category/{{ category.slug }}</p>
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {{ (category.productCount || 0) }} {{ (category.productCount || 0) === 1 ? 'товар' : 'товаров' }}
                    </span>
                    <span class="text-xs text-gray-500">Порядок: {{ index + 1 }}</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center space-x-2">
                <button @click="$emit('edit', category)" class="px-3 py-1 text-sm text-blue-600 hover:text-blue-800">Редактировать</button>
                <button
                  @click="$emit('delete', category.id)"
                  :disabled="(category.productCount || 0) > 0"
                  class="px-3 py-1 text-sm rounded-md"
                  :class="(category.productCount || 0) > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-800'"
                  :title="(category.productCount || 0) > 0 ? `Нельзя удалить категорию с товарами (${category.productCount})` : 'Удалить категорию'"
                >
                  Удалить
                </button>
              </div>
            </div>
          </template>
        </draggable>

        <div class="text-sm text-gray-500 text-center py-2 border-t">
          <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
          </svg>
          Перетащите категории для изменения порядка в меню
        </div>
      </div>

      <div v-else class="text-center py-8">
        <p class="text-gray-600">Категорий нет</p>
        <button
          @click="$emit('create')"
          class="mt-4 px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-dark/90 transition-colors"
        >
          Создать первую категорию
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'

interface Category {
  id: string
  slug: string
  name: string
  description?: string
  order?: number
  productCount?: number
}

const props = withDefaults(defineProps<{ categories: Category[]; isLoading?: boolean }>(), { isLoading: false })
const emit = defineEmits<{
  (e: 'create'): void
  (e: 'edit', category: Category): void
  (e: 'delete', id: string): void
  (e: 'reorder', list: { id: string; order: number }[]): void
}>()

const localCategories = ref<Category[]>([])
watch(() => props.categories, (val) => { localCategories.value = Array.isArray(val) ? [...val] : [] }, { immediate: true })

function onEnd() {
  const payload = localCategories.value.map((c, i) => ({ id: c.id, order: i + 1 }))
  emit('reorder', payload)
}
</script>
