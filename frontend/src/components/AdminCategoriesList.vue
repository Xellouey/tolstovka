<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-semibold text-gray-900">Управление категориями</h3>
      <button
        @click="$emit('create')"
        class="px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-dark/90 transition-colors"
      >
        Добавить категорию
      </button>
    </div>
    
    <!-- Список категорий -->
    <div v-if="categories.length" class="space-y-3">
      <div 
        ref="sortableContainer" 
        class="space-y-2"
      >
        <div
          v-for="category in categories"
          :key="category.id"
          :data-id="category.id"
          class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow cursor-default"
        >
          <div class="flex items-center space-x-4">
            <!-- Drag Handle -->
            <div 
              class="handle cursor-move p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Перетащите для изменения порядка"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zM6 4a1 1 0 011-1h6a1 1 0 011 1v12a1 1 0 01-1 1H7a1 1 0 01-1-1V4z"/>
                <path d="M8 6h4v2H8V6zM8 10h4v2H8v-2zM8 14h4v2H8v-2z"/>
              </svg>
            </div>
            
            <!-- Иконка категории -->
            <div class="flex-shrink-0">
              <div class="w-10 h-10 bg-brand-primary/20 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-brand-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                </svg>
              </div>
            </div>
            
            <!-- Информация о категории -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between">
                <div class="min-w-0 flex-1">
                  <p class="text-base font-medium text-gray-900">
                    {{ category.name }}
                  </p>
                  <div class="flex items-center space-x-4 mt-1">
                    <p class="text-sm text-gray-500">
                      /category/{{ category.slug }}
                    </p>
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {{ category.productCount || 0 }} {{ category.productCount === 1 ? 'товар' : 'товаров' }}
                    </span>
                  </div>
                  <p class="text-xs text-gray-400 mt-1">
                    Порядок: {{ category.order }}
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Действия -->
            <div class="flex-shrink-0 flex items-center space-x-2">
              <button
                @click="$emit('edit', category)"
                class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Редактировать"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              
              <button
                @click="$emit('delete', category)"
                :disabled="(category.productCount || 0) > 0"
                class="p-2 rounded-lg transition-colors"
                :class="(category.productCount || 0) > 0 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-red-600 hover:bg-red-50'"
                :title="(category.productCount || 0) > 0 
                  ? `Нельзя удалить категорию с товарами (${category.productCount})` 
                  : 'Удалить категорию'"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Информация о сортировке -->
      <div class="text-sm text-gray-500 text-center py-2 border-t">
        <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
        </svg>
        Перетащите категории для изменения порядка в меню
      </div>
    </div>
    
    <!-- Пустое состояние -->
    <div v-else class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Категорий пока нет</h3>
      <p class="mt-1 text-sm text-gray-500">Создайте первую категорию для организации товаров.</p>
      <div class="mt-6">
        <button
          @click="$emit('create')"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-dark hover:bg-brand-dark/90"
        >
          <svg class="-ml-1 mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
          </svg>
          Добавить категорию
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, onUnmounted } from 'vue'

interface Category {
  id: string
  slug: string
  name: string
  order: number
  productCount?: number
}

interface Props {
  categories: Category[]
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
})

const emit = defineEmits<{
  create: []
  edit: [category: Category]
  delete: [category: Category]
  reorder: [categories: { id: string; order: number }[]]
}>()

const sortableContainer = ref<HTMLElement>()
let sortableInstance: any = null

// Инициализация SortableJS
onMounted(async () => {
  await nextTick()
  initializeSortable()
})

// Пересоздание при изменении категорий
watch(() => props.categories, async () => {
  await nextTick()
  if (sortableInstance) {
    sortableInstance.destroy()
  }
  initializeSortable()
})

function initializeSortable() {
  if (!sortableContainer.value || props.categories.length === 0) return
  
  try {
    // Используем прямой импорт SortableJS
    const { Sortable } = require('sortablejs')
    
    sortableInstance = new Sortable(sortableContainer.value, {
      handle: '.handle',
      animation: 150,
      ghostClass: 'opacity-50 bg-gray-50',
      chosenClass: 'ring-2 ring-brand-dark ring-opacity-50',
      dragClass: 'transform rotate-1 scale-105',
      
      onEnd: (evt: any) => {
        if (evt.oldIndex === evt.newIndex) return
        
        // Создаем новый массив с обновленными позициями
        const reorderedCategories = [...props.categories]
        const movedCategory = reorderedCategories[evt.oldIndex]
        
        // Удаляем из старой позиции и вставляем в новую
        reorderedCategories.splice(evt.oldIndex, 1)
        reorderedCategories.splice(evt.newIndex, 0, movedCategory)
        
        // Генерируем новые порядковые номера
        const newOrder = reorderedCategories.map((category, index) => ({
          id: category.id,
          order: index + 1
        }))
        
        emit('reorder', newOrder)
      }
    })
  } catch (error) {
    console.error('Failed to initialize SortableJS:', error)
  }
}

// Cleanup
onUnmounted(() => {
  if (sortableInstance) {
    sortableInstance.destroy()
  }
})
</script>