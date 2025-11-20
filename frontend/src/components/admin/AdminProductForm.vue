<template>
  <form @submit.prevent="onSubmit" class="space-y-4 sm:space-y-5 w-full max-w-full">
    <!-- Category - МОБИЛЬНО АДАПТИВНОЕ -->
    <div class="w-full">
      <label class="block text-sm font-medium text-gray-700 mb-2">Категория</label>
      <select 
        v-model="form.categoryId" 
        required 
        class="
          w-full max-w-full box-border
          px-3 sm:px-4 py-2 sm:py-3 
          text-sm sm:text-base
          border border-gray-300 rounded-xl 
          focus:ring-2 focus:ring-brand-dark focus:border-transparent
          min-w-0
        "
      >
        <option disabled value="">Выберите категорию</option>
        <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
    </div>

    <!-- Title - МОБИЛЬНО АДАПТИВНОЕ -->
    <div class="w-full">
      <label class="block text-sm font-medium text-gray-700 mb-2">Название (опционально)</label>
      <input 
        v-model.trim="form.title" 
        type="text" 
        class="
          w-full max-w-full box-border
          px-3 sm:px-4 py-2 sm:py-3 
          text-sm sm:text-base
          border border-gray-300 rounded-xl 
          focus:ring-2 focus:ring-brand-dark focus:border-transparent
          min-w-0
        " 
        placeholder="Классическая толстовка" 
      />
    </div>

    <!-- Price - МОБИЛЬНО АДАПТИВНОЕ -->
    <div class="w-full">
      <label class="block text-sm font-medium text-gray-700 mb-2">Цена, ₽ (целое число)</label>
      <input
        v-model.number="form.priceRub"
        type="number"
        min="1"
        step="1"
        required
        class="
          w-full max-w-full box-border
          px-3 sm:px-4 py-2 sm:py-3 
          text-sm sm:text-base
          border border-gray-300 rounded-xl 
          focus:ring-2 focus:ring-brand-dark focus:border-transparent
          min-w-0
        "
        placeholder="2500"
      />
      <p class="mt-1 text-xs text-gray-500 break-words">Без копеек, только целые рубли. Пример: 3990</p>
    </div>

    <!-- Status -->
    <div class="w-full space-y-3">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Статус на витрине</label>
        <select
          v-model="form.status"
          class="
            w-full max-w-full box-border
            px-3 sm:px-4 py-2 sm:py-3
            text-sm sm:text-base
            border border-gray-300 rounded-xl
            focus:ring-2 focus:ring-brand-dark focus:border-transparent
            min-w-0 bg-white
          "
        >
          <option value="published">Опубликован — виден на витрине</option>
          <option value="draft">Черновик — скрыт от пользователей</option>
          <option value="scheduled">Отложенный — появится в выбранное время</option>
        </select>
        <p class="mt-1 text-xs text-gray-500 break-words">
          Черновики скрыты для клиентов. Отложенные товары появятся автоматически в указанную дату и время.
        </p>
      </div>

      <div v-if="isScheduled" class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Дата и время публикации</label>
        <input
          v-model="form.publishAt"
          type="datetime-local"
          :min="minPublishValue"
          class="
            w-full max-w-full box-border
            px-3 sm:px-4 py-2 sm:py-3
            text-sm sm:text-base
            border border-gray-300 rounded-xl
            focus:ring-2 focus:ring-brand-dark focus:border-transparent
            min-w-0 bg-white
          "
        />
        <p class="text-xs text-gray-500 break-words">
          Время указывается в вашем часовом поясе. Планировщик на сервере выполнит публикацию автоматически.
        </p>
      </div>
    </div>

    <!-- Size -->
    <div class="w-full">
      <label class="block text-sm font-medium text-gray-700 mb-2">Размер</label>
      <select
        v-model="form.size"
        class="
          w-full max-w-full box-border
          px-3 sm:px-4 py-2 sm:py-3
          text-sm sm:text-base
          border border-gray-300 rounded-xl
          focus:ring-2 focus:ring-brand-dark focus:border-transparent
          min-w-0 bg-white
        "
      >
        <option
          v-for="option in sizeOptions"
          :key="option.value || 'none'"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      <p class="mt-1 text-xs text-gray-500 break-words">Размеры подбираются автоматически по категории ({{ sizePresetLabel }}). Значение отображается рядом с товаром и участвует в фильтрации.</p>
    </div>

    <!-- Description - МОБИЛЬНО АДАПТИВНОЕ -->
    <div class="w-full">
      <label class="block text-sm font-medium text-gray-700 mb-2">Описание</label>
      <textarea 
        v-model.trim="form.description" 
        rows="4" 
        class="
          w-full max-w-full box-border
          px-3 sm:px-4 py-2 sm:py-3 
          text-sm sm:text-base
          border border-gray-300 rounded-xl 
          focus:ring-2 focus:ring-brand-dark focus:border-transparent
          resize-none min-w-0
        " 
        placeholder="Материал, особенности и т.п."
      ></textarea>
    </div>

    <!-- Images - МОБИЛЬНО АДАПТИВНОЕ -->
    <div class="space-y-3 w-full">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <label class="text-sm font-medium break-words" :class="form.images.length === 0 ? 'text-red-600' : 'text-gray-700'">
          Фотографии (обязательно)
          <span v-if="form.images.length === 0" class="text-red-500 text-xs block sm:inline">
            - добавьте хотя бы одно фото
          </span>
        </label>
        <div class="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="onFilesSelected" />
          <button 
            type="button" 
            :disabled="isUploading" 
            @click="triggerFile" 
            class="
              w-full sm:w-auto px-3 py-2 
              bg-brand-dark text-white rounded-lg 
              text-xs sm:text-sm font-medium
              disabled:opacity-50 min-w-0 max-w-full
              truncate box-border
            "
          >
            <span class="truncate">
              {{ isUploading ? 'Загрузка...' : 'Добавить фото' }}
            </span>
          </button>
        </div>
      </div>

      <div class="w-full overflow-x-hidden">
        <AdminProductImagesSorter v-model="form.images" :disabled="isUploading" @reorder="onImagesReorder" @remove="onRemoveImage" />
      </div>

      <div class="text-xs text-gray-500 break-words space-y-1">
        <p>🖼️ Товары: <strong>3:4</strong> | Рекомендуется: <strong>900×1200px</strong></p>
        <p>Поддерживаются форматы JPG, PNG, WebP.</p>
      </div>
    </div>

    <!-- Actions - МОБИЛЬНО ОПТИМИЗИРОВАННЫЕ -->
    <div class="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-100 w-full max-w-full">
      <button 
        type="button" 
        @click="$emit('cancel')"
        class="
          w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 
          text-sm sm:text-base font-medium
          text-gray-700 bg-gray-50 hover:bg-gray-100 hover:text-gray-900
          border border-gray-200 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent
          transition-all duration-200 touch-manipulation
          min-w-0 max-w-full box-border
        "
      >
        Отмена
      </button>
      <button 
        type="submit" 
        :disabled="isSubmitting || isUploading || form.images.length === 0" 
        class="
          w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 
          text-sm sm:text-base font-medium rounded-lg
          bg-brand-dark text-white shadow-lg
          hover:bg-brand-dark/90 hover:shadow-xl
          focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-50
          active:bg-brand-dark/95 active:shadow-md
          transition-all duration-200 touch-manipulation
          min-w-0 max-w-full justify-center inline-flex items-center box-border
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg
        "
      >
        <span v-if="isSubmitting || isUploading" class="inline-flex items-center justify-center truncate">
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="truncate">{{ isSubmitting ? 'Сохранение...' : 'Загрузка...' }}</span>
        </span>
        <span v-else-if="form.images.length === 0" class="truncate">Добавьте фото</span>
        <span v-else class="truncate">{{ isCreateMode ? 'Создать' : 'Применить' }}</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import AdminProductImagesSorter from '@/components/admin/AdminProductImagesSorter.vue'
import { useAdminStore } from '@/stores/admin'
import { getSizePresetForCategory, SIZE_PRESETS, type SizeOption, type SizePreset } from '@/constants/productSizes'

interface Category { id: string; name: string; slug?: string }
interface Product {
  id: string;
  categoryId: string;
  title?: string;
  priceRub: number;
  description?: string;
  images: string[];
  size?: string | null;
  status?: 'draft' | 'scheduled' | 'published';
  publishAt?: string | null;
}

const props = defineProps<{ product: Product | null; categories: Category[] }>()
const emit = defineEmits<{ (e: 'submit', payload: Omit<Product, 'id' | 'createdAt' | 'categoryName'>): void; (e: 'cancel'): void }>()

const admin = useAdminStore()

const isCreateMode = computed(() => !props.product)
const productIdForUpload = computed(() => props.product?.id || '')
const isUploading = ref(false)
const isSubmitting = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const currentSizePreset = ref<SizePreset>(SIZE_PRESETS.apparel)
const sizeOptions = ref<SizeOption[]>([...SIZE_PRESETS.apparel.options])
const sizePresetLabel = computed(() => currentSizePreset.value.label)

const form = reactive<Omit<Product, 'id'>>({
  categoryId: props.product?.categoryId || '',
  title: props.product?.title || '',
  priceRub: props.product?.priceRub || 0,
  size: props.product?.size ? props.product.size.toUpperCase() : '',
  description: props.product?.description || '',
  images: [...(props.product?.images || [])],
  status: props.product?.status || 'published',
  publishAt: props.product?.publishAt ? toLocalInputValue(props.product.publishAt) : ''
})

const isScheduled = computed(() => form.status === 'scheduled')

const minPublishValue = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
})

function syncSizePreset(categoryId: string) {
  const category = props.categories.find(c => c.id === categoryId)
  const preset = getSizePresetForCategory(category?.slug)
  currentSizePreset.value = preset
  sizeOptions.value = [...preset.options]

  if (form.size) {
    const normalized = form.size.toUpperCase()
    if (!preset.values.includes(normalized)) {
      form.size = ''
    }
  }
}

watch(() => props.product, (p) => {
  form.categoryId = p?.categoryId || ''
  form.title = p?.title || ''
  form.priceRub = p?.priceRub || 0
  form.size = p?.size ? p.size.toUpperCase() : ''
  form.description = p?.description || ''
  form.images = [...(p?.images || [])]
  form.status = p?.status || 'published'
  form.publishAt = p?.publishAt ? toLocalInputValue(p.publishAt) : ''
  syncSizePreset(form.categoryId)
})

watch(() => props.categories, () => {
  syncSizePreset(form.categoryId)
})

watch(
  () => form.categoryId,
  (categoryId) => {
    syncSizePreset(categoryId)
  },
  { immediate: true }
)

watch(() => form.status, (next) => {
  if (next !== 'scheduled') {
    form.publishAt = ''
  }
})

function toLocalInputValue(iso: string) {
  try {
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return ''
    const pad = (v: number) => v.toString().padStart(2, '0')
    const year = date.getFullYear()
    const month = pad(date.getMonth() + 1)
    const day = pad(date.getDate())
    const hours = pad(date.getHours())
    const minutes = pad(date.getMinutes())
    return `${year}-${month}-${day}T${hours}:${minutes}`
  } catch (error) {
    console.error('Не удалось преобразовать publishAt в локальный формат', error)
    return ''
  }
}

function toIsoString(localValue: string) {
  const date = new Date(localValue)
  if (Number.isNaN(date.getTime())) {
    throw new Error('Некорректный формат даты публикации')
  }
  return date.toISOString()
}

function triggerFile() { fileInput.value?.click() }

// Привязать загруженные изображения к товару в базе
async function attachImagesToProduct(productId: string, urls: string[]) {
  try {
    const response = await fetch(`/api/admin/products/${productId}/images/attach`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${admin.token}`
      },
      body: JSON.stringify({ urls })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Не удалось привязать изображения (${response.status}): ${errorText}`)
    }
    
    console.log('Изображения успешно привязаны к товару', urls)
  } catch (error) {
    console.error('Ошибка привязки изображений:', error)
    throw error
  }
}

async function onFilesSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const files = input.files
  
  console.log('Файлы выбраны:', files ? files.length : 0)
  
  if (!files || files.length === 0) {
    console.log('Нет файлов для загрузки')
    return
  }
  
  try {
    isUploading.value = true
    
    // Для новых товаров загружаем в темпорарную папку
    const uploadPath = isCreateMode.value ? 'temp' : `products/${productIdForUpload.value}`
    console.log('Начинаем загрузку в:', uploadPath)
    
    // Загрузка файлов
    const uploaded = await admin.uploadFiles(files, uploadPath)
    console.log('Файлы загружены:', uploaded)
    
    if (uploaded && Array.isArray(uploaded) && uploaded.length > 0) {
      console.log('Загружено файлов:', uploaded.length, uploaded)
      
      if (!isCreateMode.value && productIdForUpload.value) {
        // Для существующих товаров - привязать к базе
        console.log('Привязываем изображения к товару...')
        await attachImagesToProduct(productIdForUpload.value, uploaded)
      }
      
      // Обновляем локальное состояние
      console.log('Состояние form.images до:', [...form.images])
      // Создаем новый массив для корректной реактивности Vue
      form.images = [...form.images, ...uploaded]
      console.log('Состояние form.images после:', [...form.images])
      console.log('Изображения добавлены в форму. Всего:', form.images.length)
    } else {
      console.log('Не удалось загрузить файлы или пустой результат:', uploaded)
      alert('Не удалось загрузить файлы')
    }
    
  } catch (error) {
    console.error('Ошибка загрузки файлов:', error)
    alert(`Ошибка загрузки: ${error}`)
  } finally {
    isUploading.value = false
    if (input) input.value = ''
  }
}

function onImagesReorder(newOrder: string[]) {
  // Обновляем порядок с новым массивом
  form.images = [...newOrder]
}

function onRemoveImage(index: number) {
  console.log(`Удаляем изображение по индексу: ${index}`)
  if (index >= 0 && index < form.images.length) {
    const removedImage = form.images[index]
    // Создаем новый массив без удаленного элемента
    form.images = form.images.filter((_, i) => i !== index)
    console.log(`Изображение ${removedImage} удалено. Осталось: ${form.images.length}`)
  } else {
    console.error(`Неверный индекс для удаления: ${index}`)
  }
}

async function onSubmit() {
  isSubmitting.value = true
  try {
    // Валидация: товар должен иметь хотя бы одно изображение
    if (form.images.length === 0) {
      alert('Добавьте хотя бы одно изображение товара')
      return
    }

    if (isScheduled.value && !form.publishAt) {
      alert('Укажите дату и время публикации для отложенного товара')
      return
    }

    const payload = {
      ...form,
      publishAt: form.publishAt ? toIsoString(form.publishAt) : null,
      status: form.status
    }

    if (!isScheduled.value) {
      payload.publishAt = null
    }

    emit('submit', payload)
  } finally {
    isSubmitting.value = false
  }
}
</script>
