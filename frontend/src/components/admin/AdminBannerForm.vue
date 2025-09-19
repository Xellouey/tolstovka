<template>
  <form @submit.prevent="onSubmit" class="space-y-6">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Заголовок баннера
      </label>
      <input
        v-model="formData.title"
        type="text"
        required
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-dark focus:border-transparent"
        placeholder="Введите заголовок баннера"
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
        placeholder="Введите описание баннера"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        URL изображения
      </label>
      <input
        v-model="formData.imageUrl"
        type="url"
        required
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-dark focus:border-transparent"
        placeholder="https://example.com/image.jpg"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Ссылка при клике
      </label>
      <input
        v-model="formData.linkUrl"
        type="text"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-dark focus:border-transparent"
        placeholder="/category/shoes"
      />
    </div>

    <div class="flex items-center">
      <input
        v-model="formData.isActive"
        type="checkbox"
        id="isActive"
        class="w-4 h-4 text-brand-dark border-gray-300 rounded focus:ring-brand-dark focus:ring-2"
      />
      <label for="isActive" class="ml-2 text-sm font-medium text-gray-700">
        Активный баннер
      </label>
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
  banner: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit', 'cancel'])

const formData = ref({
  title: '',
  description: '',
  imageUrl: '',
  linkUrl: '',
  isActive: true
})

const onSubmit = () => {
  emit('submit', { ...formData.value })
}

// Заполняем форму данными баннера при редактировании
watch(
  () => props.banner,
  (newBanner) => {
    if (newBanner) {
      formData.value = {
        title: newBanner.title || '',
        description: newBanner.description || '',
        imageUrl: newBanner.imageUrl || '',
        linkUrl: newBanner.linkUrl || '',
        isActive: newBanner.isActive ?? true
      }
    } else {
      formData.value = {
        title: '',
        description: '',
        imageUrl: '',
        linkUrl: '',
        isActive: true
      }
    }
  },
  { immediate: true }
)
</script>