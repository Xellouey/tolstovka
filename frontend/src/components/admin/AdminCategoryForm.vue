<template>
  <form @submit.prevent="onSubmit" class="space-y-6">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Название категории
      </label>
      <input
        v-model="formData.name"
        type="text"
        required
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-dark focus:border-transparent"
        placeholder="Введите название категории"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Описание
      </label>
      <textarea
        v-model="formData.description"
        rows="3"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-dark focus:border-transparent"
        placeholder="Введите описание категории"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Slug (URL)
      </label>
      <input
        v-model="formData.slug"
        type="text"
        required
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-dark focus:border-transparent"
        placeholder="category-slug"
      />
      <p class="mt-1 text-xs text-gray-500">
        Используется в URL. Только латинские буквы, цифры и дефисы.
      </p>
    </div>

    <div class="flex space-x-4">
      <button
        type="submit"
        class="px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-dark/90 transition-colors"
      >
        Сохранить
      </button>
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
      >
        Отмена
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  category: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit', 'cancel'])

const formData = ref({
  name: '',
  description: '',
  slug: ''
})

const onSubmit = () => {
  // Простая генерация slug из названия если slug пустой
  if (!formData.value.slug && formData.value.name) {
    formData.value.slug = formData.value.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
  
  emit('submit', { ...formData.value })
}

// Заполняем форму данными категории при редактировании
watch(
  () => props.category,
  (newCategory) => {
    if (newCategory) {
      formData.value = {
        name: newCategory.name || '',
        description: newCategory.description || '',
        slug: newCategory.slug || ''
      }
    } else {
      formData.value = {
        name: '',
        description: '',
        slug: ''
      }
    }
  },
  { immediate: true }
)
</script>