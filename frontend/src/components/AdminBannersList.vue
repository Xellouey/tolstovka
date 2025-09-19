<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-semibold text-gray-900">Управление банерами</h3>
      <button
        @click="$emit('create')"
        class="px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-dark/90 transition-colors"
      >
        Добавить банер
      </button>
    </div>
    
    <!-- Список банеров -->
    <div v-if="banners.length" class="space-y-3">
      <div 
        ref="sortableContainer" 
        class="space-y-2"
      >
        <div
          v-for="banner in banners"
          :key="banner.id"
          :data-id="banner.id"
          class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow cursor-default"
          :class="{ 'opacity-50': !banner.active }"
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
            
            <!-- Изображение баннера -->
            <div class="flex-shrink-0">
              <img 
                :src="banner.image" 
                :alt="banner.id"
                class="w-20 h-8 object-cover rounded border"
                @error="handleImageError"
              />
            </div>
            
            <!-- Информация о баннере -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between">
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ banner.id }}
                  </p>
                  <p class="text-sm text-gray-500 truncate">
                    {{ banner.href }}
                  </p>
                  <p class="text-xs text-gray-400 mt-1">
                    Порядок: {{ banner.order }}
                  </p>
                </div>
                
                <!-- Статус -->
                <div class="flex-shrink-0 ml-4">
                  <span 
                    :class="banner.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  >
                    <span 
                      :class="banner.active ? 'bg-green-400' : 'bg-gray-400'"
                      class="w-2 h-2 rounded-full mr-1.5"
                    ></span>
                    {{ banner.active ? 'Активен' : 'Неактивен' }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Действия -->
            <div class="flex-shrink-0 flex items-center space-x-2">
              <button
                @click="$emit('edit', banner)"
                class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Редактировать"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              
              <button
                @click="toggleBannerStatus(banner)"
                :class="banner.active ? 'text-gray-600 hover:bg-gray-50' : 'text-green-600 hover:bg-green-50'"
                class="p-2 rounded-lg transition-colors"
                :title="banner.active ? 'Деактивировать' : 'Активировать'"
              >
                <svg v-if="banner.active" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L8.464 11.293m4.243-1.415L16.95 6.636"/>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
              
              <button
                @click="$emit('delete', banner)"
                class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Удалить"
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
        Перетащите банеры для изменения порядка отображения
      </div>
    </div>
    
    <!-- Пустое состояние -->
    <div v-else class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.712-3.714M14 40v-4a9.971 9.971 0 01.712-3.714M28 16a4 4 0 11-8 0 4 4 0 018 0z"/>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Банеров пока нет</h3>
      <p class="mt-1 text-sm text-gray-500">Создайте первый банер для главной страницы.</p>
      <div class="mt-6">
        <button
          @click="$emit('create')"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-dark hover:bg-brand-dark/90"
        >
          <svg class="-ml-1 mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
          </svg>
          Добавить банер
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import Sortable from 'sortablejs-vue3'

interface Banner {
  id: string
  image: string
  href: string
  active: boolean
  order: number
}

interface Props {
  banners: Banner[]
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
})

const emit = defineEmits<{
  create: []
  edit: [banner: Banner]
  delete: [banner: Banner]
  reorder: [banners: { id: string; order: number }[]]
  toggleStatus: [banner: Banner]
}>()

const sortableContainer = ref<HTMLElement>()
let sortableInstance: any = null

// Инициализация SortableJS
onMounted(async () => {
  await nextTick()
  initializeSortable()
})

// Пересоздание при изменении банеров
watch(() => props.banners, async () => {
  await nextTick()
  if (sortableInstance) {
    sortableInstance.destroy()
  }
  initializeSortable()
})

function initializeSortable() {
  if (!sortableContainer.value || props.banners.length === 0) return
  
  try {
    // Используем прямой импорт SortableJS
    const { Sortable } = require('sortablejs')
    
    sortableInstance = new Sortable(sortableContainer.value, {
      handle: '.handle',
      animation: 150,
      ghostClass: 'opacity-50 bg-gray-50',
      chosenClass: 'ring-2 ring-brand-dark ring-opacity-50',
      dragClass: 'transform rotate-2 scale-105',
      
      onEnd: (evt: any) => {
        if (evt.oldIndex === evt.newIndex) return
        
        // Создаем новый массив с обновленными позициями
        const reorderedBanners = [...props.banners]
        const movedBanner = reorderedBanners[evt.oldIndex]
        
        // Удаляем из старой позиции и вставляем в новую
        reorderedBanners.splice(evt.oldIndex, 1)
        reorderedBanners.splice(evt.newIndex, 0, movedBanner)
        
        // Генерируем новые порядковые номера
        const newOrder = reorderedBanners.map((banner, index) => ({
          id: banner.id,
          order: index + 1
        }))
        
        emit('reorder', newOrder)
      }
    })
  } catch (error) {
    console.error('Failed to initialize SortableJS:', error)
  }
}

// Переключение статуса активности
async function toggleBannerStatus(banner: Banner) {
  emit('toggleStatus', banner)
}

// Обработка ошибки загрузки изображения
function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.src = 'https://placehold.co/80x32/f3f4f6/9ca3af?text=Error'
}

// Cleanup
onUnmounted(() => {
  if (sortableInstance) {
    sortableInstance.destroy()
  }
})
</script>