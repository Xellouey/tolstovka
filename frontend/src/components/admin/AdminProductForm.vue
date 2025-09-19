<template>
  <form @submit.prevent="onSubmit" class="space-y-5">
    <!-- Category -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Категория</label>
      <select v-model="form.categoryId" required class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-dark focus:border-transparent">
        <option disabled value="">Выберите категорию</option>
        <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
    </div>

    <!-- Title -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Название (опционально)</label>
      <input v-model.trim="form.title" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-dark focus:border-transparent" placeholder="Классическая толстовка" />
    </div>

    <!-- Price -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Цена, ₽ (целое число)</label>
      <input
        v-model.number="form.priceRub"
        inputmode="numeric"
        pattern="\\d*"
        type="tel"
        required
        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-dark focus:border-transparent"
        placeholder="2500"
      />
      <p class="mt-1 text-xs text-gray-500">Без копеек, только целые рубли. Пример: 3990</p>
    </div>

    <!-- Description -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Описание</label>
      <textarea v-model.trim="form.description" rows="4" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-dark focus:border-transparent" placeholder="Материал, особенности и т.п."></textarea>
    </div>

    <!-- Images -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-gray-700">Фотографии (перетаскивайте для изменения порядка)</label>
        <div class="flex items-center gap-3">
          <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="onFilesSelected" />
          <button type="button" :disabled="isUploading || (isCreateMode && !productIdForUpload)" @click="triggerFile" class="px-3 py-2 bg-brand-dark text-white rounded-lg text-sm disabled:opacity-50">
            {{ isCreateMode && !productIdForUpload ? 'Добавьте фото после создания' : isUploading ? 'Загрузка...' : 'Добавить фото' }}
          </button>
        </div>
      </div>

      <AdminProductImagesSorter v-model="form.images" :disabled="isUploading" @reorder="onImagesReorder" @remove="onRemoveImage" />

      <p v-if="isCreateMode" class="text-xs text-gray-500">Для чернового товара загрузка заблокирована: сначала создайте товар, затем добавьте фото. В режиме редактирования фото загружаются сразу в каталог продукта.</p>
    </div>

    <!-- Actions -->
    <div class="pt-2 flex gap-3">
      <button type="submit" :disabled="isSubmitting || isUploading" class="flex-1 py-3 bg-brand-dark text-white rounded-xl font-medium disabled:opacity-50">
        {{ isSubmitting ? 'Сохранение...' : 'Сохранить' }}
      </button>
      <button type="button" @click="$emit('cancel')" class="px-4 py-3 border border-gray-300 rounded-xl">Отмена</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import AdminProductImagesSorter from '@/components/admin/AdminProductImagesSorter.vue'
import { useAdminStore } from '@/stores/admin-mock'

interface Category { id: string; name: string }
interface Product { id: string; categoryId: string; title?: string; priceRub: number; description?: string; images: string[] }

const props = defineProps<{ product: Product | null; categories: Category[] }>()
const emit = defineEmits<{ (e: 'submit', payload: Omit<Product, 'id' | 'createdAt' | 'categoryName'>): void; (e: 'cancel'): void }>()

const admin = useAdminStore()

const isCreateMode = computed(() => !props.product)
const productIdForUpload = computed(() => props.product?.id || '')
const isUploading = ref(false)
const isSubmitting = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const form = reactive<Omit<Product, 'id'>>({
  categoryId: props.product?.categoryId || '',
  title: props.product?.title || '',
  priceRub: props.product?.priceRub || 0,
  description: props.product?.description || '',
  images: [...(props.product?.images || [])]
})

watch(() => props.product, (p) => {
  form.categoryId = p?.categoryId || ''
  form.title = p?.title || ''
  form.priceRub = p?.priceRub || 0
  form.description = p?.description || ''
  form.images = [...(p?.images || [])]
})

function triggerFile() { fileInput.value?.click() }

async function onFilesSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const files = input.files
  if (!files || files.length === 0) return
  try {
    isUploading.value = true
    if (!productIdForUpload.value) {
      // Create mode: блокируем по ТЗ; подсказка уже выше
      return
    }
    // Технологически корректная загрузка (Context7-подход): FormData multipart -> /api/admin/upload?target=products/<id>
    const uploaded = await admin.uploadFiles(files, `products/${productIdForUpload.value}`)
    if (uploaded && Array.isArray(uploaded)) {
      form.images.push(...uploaded)
    }
  } finally {
    isUploading.value = false
    if (input) input.value = ''
  }
}

function onImagesReorder(newOrder: string[]) {
  form.images = [...newOrder]
}

function onRemoveImage(index: number) {
  form.images.splice(index, 1)
}

async function onSubmit() {
  isSubmitting.value = true
  try {
    emit('submit', { ...form })
  } finally {
    isSubmitting.value = false
  }
}
</script>