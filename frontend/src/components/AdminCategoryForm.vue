<template>
  <form @submit="onSubmit" class="space-y-6">
    <!-- Название категории -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Название категории *
      </label>
      <input
        v-model="name"
        v-bind="nameAttrs"
        type="text"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-dark focus:border-transparent"
        placeholder="Например: Пиджаки"
        :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-300': errors.name }"
      />
      <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
    </div>

    <!-- URL slug -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        URL адрес (slug)
      </label>
      <div class="relative">
        <input
          v-model="slug"
          v-bind="slugAttrs"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-dark focus:border-transparent"
          :placeholder="suggestedSlug || 'pidzhaki'"
          :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-300': errors.slug }"
        />
        <button
          v-if="name && suggestedSlug && slug !== suggestedSlug"
          type="button"
          @click="useGeneratedSlug"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
        >
          Использовать: {{ suggestedSlug }}
        </button>
      </div>
      <p v-if="errors.slug" class="mt-1 text-sm text-red-600">{{ errors.slug }}</p>
      <p class="mt-1 text-sm text-gray-500">
        Автоматически генерируется из названия. Используется в URL: /category/<strong>{{ slug || suggestedSlug || 'slug' }}</strong>
      </p>
    </div>

    <!-- Предварительный просмотр URL -->
    <div v-if="slug || suggestedSlug" class="bg-gray-50 p-3 rounded-lg">
      <p class="text-sm font-medium text-gray-700">Предварительный просмотр:</p>
      <p class="text-sm text-gray-600 mt-1">
        Категория будет доступна по адресу: <code class="bg-white px-2 py-1 rounded text-brand-dark">/category/{{ slug || suggestedSlug }}</code>
      </p>
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
        {{ isSubmitting ? 'Сохранение...' : (editingCategory ? 'Обновить' : 'Создать') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

interface Category {
  id?: string
  slug: string
  name: string
  order?: number
}

interface Props {
  editingCategory?: Category | null
  isSubmitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  editingCategory: null,
  isSubmitting: false
})

const emit = defineEmits<{
  submit: [category: Pick<Category, 'name' | 'slug'>]
  cancel: []
}>()

// Функция для генерации slug из названия
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[а-яё]/g, (match) => {
      const cyrillicMap: Record<string, string> = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
      }
      return cyrillicMap[match] || match
    })
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Схема валидации с Zod
const categorySchema = toTypedSchema(
  z.object({
    name: z
      .string()
      .min(1, 'Название категории обязательно')
      .max(100, 'Название не должно превышать 100 символов'),
    slug: z
      .string()
      .min(1, 'URL адрес обязателен')
      .max(100, 'URL адрес не должен превышать 100 символов')
      .regex(/^[a-z0-9-]+$/, 'URL адрес может содержать только латинские буквы, цифры и дефисы')
      .refine(value => !value.startsWith('-') && !value.endsWith('-'), 'URL адрес не должен начинаться или заканчиваться дефисом')
  })
)

// Настройка формы с начальными значениями
const { defineField, handleSubmit, errors, meta, setValues, resetForm } = useForm({
  validationSchema: categorySchema,
  initialValues: {
    name: props.editingCategory?.name || '',
    slug: props.editingCategory?.slug || ''
  }
})

// Определяем поля
const [name, nameAttrs] = defineField('name')
const [slug, slugAttrs] = defineField('slug')

// Предлагаемый slug на основе названия
const suggestedSlug = computed(() => {
  if (!name.value) return ''
  return generateSlug(name.value)
})

// Автоматически устанавливаем slug при изменении названия (только для новых категорий)
watch(name, (newName) => {
  if (!props.editingCategory && newName && !slug.value) {
    slug.value = generateSlug(newName)
  }
})

// Обновляем значения при изменении редактируемой категории
watch(() => props.editingCategory, (newCategory) => {
  if (newCategory) {
    setValues({
      name: newCategory.name,
      slug: newCategory.slug
    })
  } else {
    resetForm({
      values: {
        name: '',
        slug: ''
      }
    })
  }
}, { immediate: true })

// Функция для использования сгенерированного slug
function useGeneratedSlug() {
  if (suggestedSlug.value) {
    slug.value = suggestedSlug.value
  }
}

// Обработчик отправки формы
const onSubmit = handleSubmit((values) => {
  emit('submit', {
    name: values.name,
    slug: values.slug
  })
})
</script>