<template>
  <div />
</template>

<script setup lang="ts">
// Legacy AdminBannersList removed (drag-and-drop eliminated). This file is kept as a stub to avoid accidental imports.
</script>
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