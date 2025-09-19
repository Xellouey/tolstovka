<template>
  <form @submit="onSubmit" class="space-y-6">
    <!-- URL изображения -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        URL изображения *
      </label>
      <input
        v-model="image"
        v-bind="imageAttrs"
        type="url"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-dark focus:border-transparent"
        placeholder="https://example.com/banner.jpg"
        :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-300': errors.image }"
      />
      <p v-if="errors.image" class="mt-1 text-sm text-red-600">{{ errors.image }}</p>
    </div>

    <!-- Предварительный просмотр -->
    <div v-if="image && !errors.image">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Предварительный просмотр
      </label>
      <div class="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
        <img 
          :src="image" 
          alt="Предварительный просмотр баннера"
          class="w-full h-full object-cover"
          @error="handleImageError"
        />
        <div class="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          12:5
        </div>
      </div>
      <p class="mt-1 text-sm text-gray-500">Рекомендуемое соотношение сторон: 12:5 (например, 960x400px)</p>
    </div>

    <!-- Ссылка -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Ссылка для перехода *
      </label>
      <input
        v-model="href"
        v-bind="hrefAttrs"
        type="text"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-dark focus:border-transparent"
        placeholder="/category/new-drop или https://external-link.com"
        :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-300': errors.href }"
      />
      <p v-if="errors.href" class="mt-1 text-sm text-red-600">{{ errors.href }}</p>
      <p class="mt-1 text-sm text-gray-500">
        Внутренние ссылки: /category/slug или /product/id<br>
        Внешние ссылки: https://example.com
      </p>
    </div>

    <!-- Статус активности -->
    <div>
      <div class="flex items-center">
        <input
          v-model="active"
          v-bind="activeAttrs"
          type="checkbox"
          class="h-4 w-4 text-brand-dark focus:ring-brand-dark border-gray-300 rounded"
        />
        <label class="ml-2 block text-sm text-gray-700">
          Активен (показывать на сайте)
        </label>
      </div>
    </div>

    <!-- Действия -->
    <div class="flex justify-end space-x-3 pt-4">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        Отмена
      </button>
      <button
        type="submit"
        :disabled="!meta.valid || isSubmitting"
        class="px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-dark/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {{ isSubmitting ? 'Сохранение...' : (editingBanner ? 'Обновить' : 'Создать') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

interface Banner {
  id?: string
  image: string
  href: string
  active: boolean
  order?: number
}

interface Props {
  editingBanner?: Banner | null
  isSubmitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  editingBanner: null,
  isSubmitting: false
})

const emit = defineEmits<{
  submit: [banner: Omit<Banner, 'id' | 'order'>]
  cancel: []
}>()

// Схема валидации с Zod
const bannerSchema = toTypedSchema(
  z.object({
    image: z
      .string()
      .min(1, 'URL изображения обязателен')
      .url('Введите корректный URL')
      .refine(url => {
        // Проверяем что это изображение по расширению
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
        const lowercaseUrl = url.toLowerCase()
        return imageExtensions.some(ext => lowercaseUrl.includes(ext)) || 
               lowercaseUrl.includes('placeholder') ||
               lowercaseUrl.includes('unsplash') ||
               lowercaseUrl.includes('images')
      }, 'URL должен указывать на изображение'),
    href: z
      .string()
      .min(1, 'Ссылка обязательна')
      .refine(value => {
        // Разрешаем внутренние ссылки (начинающиеся с /) и внешние URL
        return value.startsWith('/') || z.string().url().safeParse(value).success
      }, 'Введите корректную ссылку'),
    active: z.boolean()
  })
)

// Настройка формы с начальными значениями
const { defineField, handleSubmit, errors, meta, setValues, resetForm } = useForm({
  validationSchema: bannerSchema,
  initialValues: {
    image: props.editingBanner?.image || '',
    href: props.editingBanner?.href || '',
    active: props.editingBanner?.active ?? true
  }
})

// Определяем поля
const [image, imageAttrs] = defineField('image')
const [href, hrefAttrs] = defineField('href')
const [active, activeAttrs] = defineField('active')

// Обновляем значения при изменении редактируемого баннера
watch(() => props.editingBanner, (newBanner) => {
  if (newBanner) {
    setValues({
      image: newBanner.image,
      href: newBanner.href,
      active: newBanner.active
    })
  } else {
    resetForm({
      values: {
        image: '',
        href: '',
        active: true
      }
    })
  }
}, { immediate: true })

// Обработчик отправки формы
const onSubmit = handleSubmit((values) => {
  emit('submit', {
    image: values.image,
    href: values.href,
    active: values.active
  })
})

// Обработчик ошибки загрузки изображения
function handleImageError() {
  // Можно показать placeholder или уведомление об ошибке
  console.warn('Failed to load banner image preview')
}
</script>