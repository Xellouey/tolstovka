<template>
  <div class="space-y-4 md:space-y-6">
    <!-- Header section - mobile responsive -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div>
        <h2 class="text-xl font-semibold text-brand-dark font-primary">Управление категориями</h2>
        <p class="text-sm text-gray-500 font-primary">Создавайте и редактируйте категории товаров</p>
      </div>
      <button
        @click="$emit('create')"
        class="px-4 py-2 bg-brand-primary text-brand-dark rounded-xl font-semibold text-sm uppercase tracking-wide shadow-md hover:shadow-lg transition-all duration-200"
      >
        Добавить категорию
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border p-3 md:p-6">
      <div v-if="isLoading" class="text-center py-8">
        <div class="animate-spin w-8 h-8 border-4 border-brand-dark border-t-transparent rounded-full mx-auto"></div>
        <p class="mt-2 text-gray-600">Загрузка категорий...</p>
      </div>

      <div v-else-if="localCategories.length" class="space-y-4">
        <div class="grid gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          <div
            v-for="(category, index) in localCategories"
            :key="category.id"
            class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200"
          >
            <!-- ========== ЗАГОЛОВОЧНАЯ ОБЛАСТЬ ========== -->
            <div class="flex items-center justify-between mb-4 gap-4">
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-semibold text-gray-900 leading-tight mb-1">{{ category.name }}</h3>
                <p class="text-sm text-gray-500 font-primary">{{ category.slug }}</p>
              </div>
              <button
                @click="copyCategoryLink(category.slug)"
                class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-all duration-200 hover:border-blue-300 flex-shrink-0"
                :title="`Копировать ссылку на категорию`"
              >
                <DocumentDuplicateIcon class="w-3 h-3" />
                Ссылка
              </button>
            </div>

            <!-- ========== БЛОК МЕТРИК ========== -->
            <div class="flex items-center justify-between mb-5 p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center gap-1">
                <span class="text-base font-medium text-gray-900">Товаров:</span>
                <span class="text-base font-semibold text-emerald-600">{{ category.productCount || 0 }}</span>
              </div>
              <div class="text-sm text-gray-600">
                Порядок: <span class="font-medium text-gray-900">{{ index + 1 }}</span>
              </div>
            </div>

            <!-- ========== ДОПОЛНИТЕЛЬНЫЕ МЕТКИ ========== -->
            <div v-if="category.hide_empty === 1 || category.hide_empty === true" class="mb-5">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                🚫 Скрывается при отсутствии товаров
              </span>
            </div>

            <!-- ========== УПРАВЛЕНИЕ ПОРЯДКОМ ========== -->
            <div class="flex items-center justify-center gap-2 mb-5">
              <span class="text-sm text-gray-600 font-medium mr-3">Порядок:</span>
              <button
                class="flex items-center justify-center w-9 h-9 text-gray-600 hover:text-white bg-white hover:bg-blue-500 border-2 border-gray-200 hover:border-blue-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-600 disabled:hover:border-gray-200 transition-all duration-200 transform hover:-translate-y-0.5"
                :disabled="index === 0"
                title="Переместить вверх"
                @click="moveUp(index)"
              >
                <ChevronUpIcon class="w-4 h-4" />
              </button>
              <button
                class="flex items-center justify-center w-9 h-9 text-gray-600 hover:text-white bg-white hover:bg-blue-500 border-2 border-gray-200 hover:border-blue-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-600 disabled:hover:border-gray-200 transition-all duration-200 transform hover:-translate-y-0.5"
                :disabled="index === localCategories.length - 1"
                title="Переместить вниз"
                @click="moveDown(index)"
              >
                <ChevronDownIcon class="w-4 h-4" />
              </button>
            </div>

            <!-- ========== БЛОК ДЕЙСТВИЙ ========== -->
            <div class="flex gap-2">
              <button 
                @click="$emit('edit', category)" 
                class="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
              >
                Редактировать
              </button>
              <button
                @click="$emit('delete', category.id)"
                :disabled="(category.productCount || 0) > 0"
                class="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 transform"
                :class="(category.productCount || 0) > 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'text-white bg-red-600 hover:bg-red-700 hover:shadow-md hover:-translate-y-0.5'"
                :title="(category.productCount || 0) > 0 ? `Нельзя удалить категорию с товарами (${category.productCount})` : 'Удалить категорию'"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>

        <div class="text-xs sm:text-sm text-gray-500 text-center py-3 px-4 border-t bg-gray-50">
          <p class="hidden sm:block">Используйте стрелки вверх/вниз для изменения порядка в меню</p>
          <p class="sm:hidden">Используйте стрелки для изменения порядка</p>
        </div>
      </div>

      <div v-else class="text-center py-8 px-4">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 113 12V7a4 4 0 014-4z"/>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Категорий пока нет</h3>
        <p class="text-gray-600 mb-4">Создайте первую категорию для организации товаров</p>
        <button
          @click="$emit('create')"
          class="w-full sm:w-auto px-6 py-3 bg-brand-dark text-white rounded-lg hover:bg-brand-dark/90 transition-colors font-medium"
        >
          + Создать категорию
        </button>
      </div>
    </div>
    
    <!-- Toast notification -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="copiedToast"
        class="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-medium"
      >
        {{ copiedToast }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ChevronUpIcon, ChevronDownIcon, DocumentDuplicateIcon } from '@heroicons/vue/24/outline'

interface Category {
  id: string
  slug: string
  name: string
  description?: string
  order?: number
  productCount?: number
  hide_empty?: number | boolean
}

const props = withDefaults(defineProps<{ categories: Category[]; isLoading?: boolean }>(), { isLoading: false })
const emit = defineEmits<{
  (e: 'create'): void
  (e: 'edit', category: Category): void
  (e: 'delete', id: string): void
  (e: 'reorder', list: { id: string; order: number }[]): void
}>()

const localCategories = ref<Category[]>([])

watch(() => props.categories, (val) => {
  localCategories.value = Array.isArray(val) ? [...val] : []
}, { immediate: true })

function commitReorder() {
  const payload = localCategories.value.map((c, i) => ({ id: c.id, order: i + 1 }))
  emit('reorder', payload)
}

function moveUp(index: number) {
  if (index <= 0) return
  const arr = [...localCategories.value]
  const [item] = arr.splice(index, 1)
  arr.splice(index - 1, 0, item)
  localCategories.value = arr
  commitReorder()
}

function moveDown(index: number) {
  if (index >= localCategories.value.length - 1) return
  const arr = [...localCategories.value]
  const [item] = arr.splice(index, 1)
  arr.splice(index + 1, 0, item)
  localCategories.value = arr
  commitReorder()
}

const copiedToast = ref('')
const toastTimer = ref<number | null>(null)
const copyInProgress = ref(false)

function copyCategoryLink(slug: string) {
  // Предотвращаем множественные клики
  if (copyInProgress.value) {
    return
  }
  
  copyInProgress.value = true
  
  // Создаём внутреннюю ссылку на категорию (для использования в баннерах)
  const categoryUrl = `/category/${slug}`
  
  // Копируем в буфер обмена
  if (navigator.clipboard) {
    navigator.clipboard.writeText(categoryUrl).then(() => {
      showCopiedToast('Внутренняя ссылка для вставки в баннер скопирована')
      console.log('Ссылка на категорию скопирована:', categoryUrl)
      // Сбрасываем флаг после успешного копирования
      setTimeout(() => {
        copyInProgress.value = false
      }, 500)
    }).catch(err => {
      console.error('Ошибка копирования:', err)
      fallbackCopy(categoryUrl)
    })
  } else {
    fallbackCopy(categoryUrl)
  }
}

function showCopiedToast(message: string) {
  copiedToast.value = message
  if (toastTimer.value) {
    clearTimeout(toastTimer.value)
  }
  toastTimer.value = window.setTimeout(() => {
    copiedToast.value = ''
    toastTimer.value = null
  }, 2000)
}

function fallbackCopy(text: string) {
  // Fallback для старых браузеров
  const textArea = document.createElement('textarea')
  textArea.value = text
  document.body.appendChild(textArea)
  textArea.select()
  try {
    document.execCommand('copy')
    showCopiedToast('Внутренняя ссылка для вставки в баннер скопирована')
    console.log('Ссылка на категорию скопирована (fallback):', text)
  } catch (err) {
    console.error('Ошибка fallback копирования:', err)
    showCopiedToast('Ошибка копирования')
  }
  document.body.removeChild(textArea)
  
  // Сбрасываем флаг после fallback копирования
  setTimeout(() => {
    copyInProgress.value = false
  }, 500)
}
</script>
