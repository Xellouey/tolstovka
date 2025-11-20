<template>
  <div class="card-base p-4 sm:p-6 space-y-4">
    <!-- Header с кнопкой создания -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div>
        <h2 class="text-xl font-semibold text-brand-dark font-primary">Товары</h2>
        <p class="text-sm text-gray-500 font-primary">Управление товарами в каталоге</p>
      </div>
      <button
        @click="$emit('create')"
        class="px-4 py-2 bg-brand-primary text-brand-dark rounded-xl font-semibold text-sm uppercase tracking-wide shadow-md hover:shadow-lg transition-all duration-200"
      >
        Создать товар
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg border p-4 space-y-3">
      <div class="flex flex-col md:flex-row md:items-center gap-3">
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <input
            v-model="search"
            type="text"
            placeholder="Поиск по названию..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            @input="onFiltersChanged"
          />
          <select
            v-model="category"
            class="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            @change="onFiltersChanged"
          >
            <option value="">Все категории</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <!-- Десктоп: обычный вид -->
        <div class="hidden sm:flex items-center gap-2">
          <label class="text-sm text-gray-600">На странице</label>
          <select
            v-model.number="pageSize"
            class="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            @change="onPageSizeChange"
          >
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
        </div>
        <div class="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            @click="viewMode = 'table'"
            :class="[
              'flex items-center justify-center p-2 rounded-md transition-all',
              viewMode === 'table' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            ]"
            title="Вид таблицы"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z"/>
            </svg>
          </button>
          <button
            @click="viewMode = 'list'"
            :class="[
              'flex items-center justify-center p-2 rounded-md transition-all',
              viewMode === 'list' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            ]"
            title="Вид списка"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
        
        <!-- Мобильные: комбинированный вид -->
        <div class="flex sm:hidden items-center gap-2">
          <label class="text-sm text-gray-600">На странице</label>
          <select
            v-model.number="pageSize"
            class="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            @change="onPageSizeChange"
          >
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
          <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              @click="viewMode = 'table'"
              :class="[
                'flex items-center justify-center p-2 rounded-md transition-all',
                viewMode === 'table' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              ]"
              title="Вид таблицы"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z"/>
              </svg>
            </button>
            <button
              @click="viewMode = 'list'"
              :class="[
                'flex items-center justify-center p-2 rounded-md transition-all',
                viewMode === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              ]"
              title="Вид списка"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2 text-sm text-gray-600">
        <input
          id="show-scheduled-products"
          v-model="showScheduled"
          type="checkbox"
          class="rounded border-gray-300 text-brand-dark focus:ring-brand-dark"
        >
        <label for="show-scheduled-products" class="select-none">
          Показывать отложенные товары
        </label>
      </div>
      
      <!-- Batch operations -->
      <div v-if="selectedIds.length" class="space-y-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-blue-800">Выбрано: {{ selectedIds.length }}</span>
          <button
            @click="clearSelection"
            class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            ✕ Отменить
          </button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            @click="batchChangeCategory"
            class="w-full px-3 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors flex items-center justify-center gap-1"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
            </svg>
            Сменить категорию
          </button>
          <button
            @click="batchDelete"
            class="w-full px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors flex items-center justify-center gap-1"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            Удалить
          </button>
        </div>
      </div>
    </div>

    <!-- Table View -->
    <div v-if="viewMode === 'table'" class="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="bg-gray-50 border-b">
          <tr class="text-gray-600">
            <th class="w-12 px-4 py-3">
              <input
                type="checkbox"
                :checked="isAllSelected"
                @change="toggleSelectAll"
                class="rounded border-gray-300 text-brand-dark focus:ring-brand-dark"
              >
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Товар</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Категория</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Размер</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Цена</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Создан</th>
            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Действия</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="isLoading">
            <td colspan="7" class="py-8 text-center text-gray-600">Загрузка...</td>
          </tr>
          <tr 
            v-for="p in paged" 
            :key="p.id" 
            class="hover:bg-gray-50 transition-colors"
            :class="{ 'bg-blue-50': selectedIds.includes(p.id) }"
          >
            <td class="px-4 py-4">
              <input
                type="checkbox"
                :checked="selectedIds.includes(p.id)"
                @change="toggleSelect(p.id)"
                class="rounded border-gray-300 text-brand-dark focus:ring-brand-dark"
              >
            </td>
            <td class="px-4 py-4 min-w-[220px]">
              <div class="flex items-center gap-3 min-w-0">
                <img :src="p.images?.[0] || placeholder" class="w-12 h-12 object-cover rounded border" />
                <div class="min-w-0">
                  <div class="font-medium text-gray-900 truncate">{{ p.title || p.id }}</div>
                  <div class="text-xs text-gray-500 truncate">ID: {{ p.id }}</div>
                  <div v-if="hasStatusBadge(p)" class="mt-1 flex flex-wrap items-center gap-2">
                    <span
                      :class="[
                        'inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide',
                        getStatusMeta(p)?.class
                      ]"
                    >
                      {{ getStatusMeta(p)?.label }}
                    </span>
                    <span
                      v-if="p.status === 'scheduled' && p.publishAt"
                      class="text-xs text-gray-500"
                    >
                      Публикация: {{ formatPublishAt(p.publishAt) }}
                    </span>
                  </div>
                </div>
              </div>
            </td>
            <td class="px-4 py-4 text-gray-700">{{ categoryName(p.categoryId) }}</td>
            <td class="px-4 py-4 text-gray-700">{{ formatSize(p.size) }}</td>
            <td class="px-4 py-4 text-gray-700">{{ p.priceRub }} ₽</td>
            <td class="px-4 py-4 text-gray-700">{{ formatDate(p.createdAt) }}</td>
            <td class="px-4 py-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <button 
                  @click="copyProductLink(p.id)"
                  class="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-all"
                  title="Копировать ссылку на товар"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v1h2V5a1 1 0 011-1h1a1 1 0 100-2H6zM6 17a2 2 0 01-2-2v-1h2v1a1 1 0 001 1h1a1 1 0 100 2H6zM14 3h-1a1 1 0 100 2h1a1 1 0 011 1v1h2V5a2 2 0 00-2-2zM15 12h-2v-1a1 1 0 00-1-1h-2a1 1 0 00-1 1v1H7a1 1 0 00-1 1v2a1 1 0 001 1h2v1a1 1 0 001 1h2a1 1 0 001-1v-1h2a1 1 0 001-1v-2a1 1 0 00-1-1z" />
                  </svg>
                </button>
                <button 
                  @click="$emit('edit', p)" 
                  class="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-all"
                  title="Редактировать"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button 
                  @click="$emit('delete', p)" 
                  class="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-all"
                  title="Удалить"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!isLoading && !paged.length">
            <td colspan="7" class="py-8 text-center text-gray-600">Ничего не найдено</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- List View -->
    <div v-else-if="viewMode === 'list'" class="bg-white rounded-xl shadow-sm border">
      <div class="p-4 bg-gray-50 border-b flex items-center justify-between">
        <div class="flex items-center gap-3">
          <input
            type="checkbox"
            :checked="isAllSelected"
            @change="toggleSelectAll"
            class="rounded border-gray-300 text-brand-dark focus:ring-brand-dark"
          >
          <span class="text-sm text-gray-600">Выбрать все</span>
        </div>
        <span class="text-xs text-gray-500">Найдено: {{ paged.length }}</span>
      </div>
      
      <div v-if="isLoading" class="py-12 text-center text-gray-600">
        Загрузка...
      </div>
      
      <div v-else-if="!paged.length" class="py-12 text-center text-gray-600">
        Ничего не найдено
      </div>
      
      <div v-else class="divide-y divide-gray-200">
        <div 
          v-for="p in paged" 
          :key="p.id" 
          class="p-2 sm:p-4 hover:bg-gray-50 transition-colors"
          :class="{ 'bg-blue-50': selectedIds.includes(p.id) }"
        >
          <!-- Мобильная версия - компактный лейаут -->
          <div class="block sm:hidden">
            <div class="flex gap-2">
              <input
                type="checkbox"
                :checked="selectedIds.includes(p.id)"
                @change="toggleSelect(p.id)"
                class="mt-1 rounded border-gray-300 text-brand-dark focus:ring-brand-dark w-4 h-4 touch-manipulation"
              >
              <img 
                :src="p.images?.[0] || placeholder" 
                class="w-12 h-12 object-cover rounded border flex-shrink-0" 
              />
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start gap-2">
                  <div class="flex-1 min-w-0">
                    <h3 class="text-sm font-medium text-gray-900 truncate leading-tight">
                      {{ p.title || p.id }}
                    </h3>
                    <div class="mt-0.5">
                      <p class="text-xs text-gray-500 leading-snug">
                        {{ categoryName(p.categoryId) }}<span v-if="p.size"> • {{ formatSize(p.size) }}</span> • {{ formatDate(p.createdAt) }}
                      </p>
                      <p class="text-base text-gray-900 mt-0.5">
                        {{ p.priceRub }} ₽
                      </p>
                      <div v-if="hasStatusBadge(p)" class="mt-1 flex items-center gap-2 flex-wrap">
                        <span
                          :class="[
                            'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide',
                            getStatusMeta(p)?.class
                          ]"
                        >
                          {{ getStatusMeta(p)?.label }}
                        </span>
                        <span
                          v-if="p.status === 'scheduled' && p.publishAt"
                          class="text-[11px] text-gray-500"
                        >
                          Публикация: {{ formatPublishAt(p.publishAt) }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <!-- Компактные кнопки действий в вертикальной группе -->
                  <div class="flex flex-col gap-0.5 flex-shrink-0">
                    <button 
                      @click="copyProductLink(p.id)"
                      class="flex items-center justify-center w-7 h-7 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors touch-manipulation"
                      title="Копировать ссылку"
                    >
                      <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v1h2V5a1 1 0 011-1h1a1 1 0 100-2H6zM6 17a2 2 0 01-2-2v-1h2v1a1 1 0 001 1h1a1 1 0 100 2H6zM14 3h-1a1 1 0 100 2h1a1 1 0 011 1v1h2V5a2 2 0 00-2-2zM15 12h-2v-1a1 1 0 00-1-1h-2a1 1 0 00-1 1v1H7a1 1 0 00-1 1v2a1 1 0 001 1h2v1a1 1 0 001 1h2a1 1 0 001-1v-1h2a1 1 0 001-1v-2a1 1 0 00-1-1z" />
                      </svg>
                    </button>
                    <button 
                      @click="$emit('edit', p)" 
                      class="flex items-center justify-center w-7 h-7 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors touch-manipulation"
                      title="Редактировать"
                    >
                      <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button 
                      @click="$emit('delete', p)" 
                      class="flex items-center justify-center w-7 h-7 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors touch-manipulation"
                      title="Удалить"
                    >
                      <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Десктопная версия - горизонтальный лейаут -->
          <div class="hidden sm:flex items-start gap-4">
            <input
              type="checkbox"
              :checked="selectedIds.includes(p.id)"
              @change="toggleSelect(p.id)"
              class="mt-1 rounded border-gray-300 text-brand-dark focus:ring-brand-dark"
            >
            <img 
              :src="p.images?.[0] || placeholder" 
              class="w-20 h-20 object-cover rounded-lg border flex-shrink-0" 
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0 flex-1">
                  <h3 class="text-lg font-medium text-gray-900 truncate">
                    {{ p.title || p.id }}
                  </h3>
                  <div class="mt-1 space-y-1">
                    <p class="text-sm text-gray-500">
                      ID: <span class="font-primary">{{ p.id }}</span>
                    </p>
                    <p class="text-sm text-gray-600">
                      Категория: <span class="font-medium">{{ categoryName(p.categoryId) }}</span>
                    </p>
                    <p class="text-sm text-gray-600">
                      Размер: <span class="font-medium">{{ formatSize(p.size) }}</span>
                    </p>
                    <p class="text-sm text-gray-600">
                      Создан: {{ formatDate(p.createdAt) }}
                    </p>
                    <div v-if="hasStatusBadge(p)" class="flex items-center gap-2 flex-wrap pt-1">
                      <span
                        :class="[
                          'inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide',
                          getStatusMeta(p)?.class
                        ]"
                      >
                        {{ getStatusMeta(p)?.label }}
                      </span>
                      <span
                        v-if="p.status === 'scheduled' && p.publishAt"
                        class="text-xs text-gray-500"
                      >
                        Публикация: {{ formatPublishAt(p.publishAt) }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="text-right">
                    <div class="text-xl text-gray-900">
                      {{ p.priceRub }} ₽
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button 
                      @click="copyProductLink(p.id)"
                      class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
                      title="Копировать ссылку на товар"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v1h2V5a1 1 0 011-1h1a1 1 0 100-2H6zM6 17a2 2 0 01-2-2v-1h2v1a1 1 0 001 1h1a1 1 0 100 2H6zM14 3h-1a1 1 0 100 2h1a1 1 0 011 1v1h2V5a2 2 0 00-2-2zM15 12h-2v-1a1 1 0 00-1-1h-2a1 1 0 00-1 1v1H7a1 1 0 00-1 1v2a1 1 0 001 1h2v1a1 1 0 001 1h2a1 1 0 001-1v-1h2a1 1 0 001-1v-2a1 1 0 00-1-1z" />
                      </svg>
                    </button>
                    <button 
                      @click="$emit('edit', p)" 
                      class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all"
                      title="Редактировать"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button 
                      @click="$emit('delete', p)" 
                      class="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all"
                      title="Удалить"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Help text -->
    <div class="px-6 py-3 bg-gray-50 border text-xs text-gray-500 text-center rounded-lg">
      Используйте чекбоксы для массовых операций с товарами.
    </div>

    <!-- Category Change Modal -->
    <div v-if="showCategoryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Сменить категорию</h3>
        <p class="text-sm text-gray-600 mb-4">Выбрано товаров: {{ selectedIds.length }}</p>
        
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Новая категория</label>
          <select 
            v-model="selectedCategoryId"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-dark focus:border-transparent"
          >
            <option value="">Выберите категорию</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        
        <div class="flex justify-end gap-3">
          <button 
            @click="cancelCategoryChange"
            class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
          <button 
            @click="confirmCategoryChange"
            :disabled="!selectedCategoryId"
            class="px-4 py-2 text-sm bg-brand-dark text-white rounded-lg hover:bg-brand-dark/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Применить
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between pt-2">
      <div class="text-sm text-gray-600">
        Показано {{ from }}–{{ to }} из {{ total }}
      </div>
      <div class="flex items-center gap-2">
        <button class="btn-ghost" :disabled="page <= 1" @click="go(page - 1)">Назад</button>
        <div class="text-sm text-gray-700">Стр. {{ page }} / {{ totalPages }}</div>
        <button class="btn-ghost" :disabled="page >= totalPages" @click="go(page + 1)">Вперёд</button>
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
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { formatProductSizeLabel } from '@/constants/productSizes'

interface Category { id: string; name: string }
interface Product {
  id: string;
  categoryId: string;
  title?: string;
  priceRub: number;
  createdAt?: string;
  size?: string | null;
  images?: string[];
  status?: 'draft' | 'scheduled' | 'published';
  publishAt?: string | null;
}
interface Pagination { page: number; limit: number; total: number; totalPages: number }

const props = withDefaults(defineProps<{
  products: Product[]
  categories: Category[]
  pagination?: Pagination
  isLoading?: boolean
}>(), { isLoading: false })

const emit = defineEmits<{
  (e: 'create'): void
  (e: 'edit', p: Product): void
  (e: 'delete', p: Product): void
  (e: 'changePage', page: number): void
  (e: 'changePageSize', limit: number): void
  (e: 'filters', v: { search: string; category: string }): void
  (e: 'batchDelete', ids: string[]): void
  (e: 'batchChangeCategory', ids: string[], categoryId: string): void
}>()

const search = ref('')
const category = ref('')
const showScheduled = ref(false)
const pageSize = ref(props.pagination?.limit || 10)
const page = ref(props.pagination?.page || 1)
const selectedIds = ref<string[]>([])
const showCategoryModal = ref(false)
const selectedCategoryId = ref('')
const isMobile = ref(false)
const viewMode = ref<'table' | 'list'>('table')
const isInitialized = ref(false)

// Media query для отслеживания мобильных устройств
const checkIsMobile = () => {
  isMobile.value = window.innerWidth < 768 // md breakpoint
  
  // При первой загрузке на мобильных сразу включаем список
  if (!isInitialized.value && isMobile.value) {
    viewMode.value = 'list'
  }
  isInitialized.value = true
}

onMounted(() => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile)
})

watch(() => props.pagination, (pg) => {
  if (pg) {
    page.value = pg.page
    pageSize.value = pg.limit
  }
})

watch(showScheduled, () => {
  selectedIds.value = selectedIds.value.filter(id =>
    filteredProducts.value.some(product => product.id === id)
  )
})

function onFiltersChanged() {
  emit('filters', { search: search.value.trim(), category: category.value })
  page.value = 1
  emit('changePage', 1)
}

function onPageSizeChange() {
  emit('changePageSize', pageSize.value)
}

const placeholder = 'https://placehold.co/64x64/f3f4f6/9ca3af?text=IMG'

// Computed для фильтрации (нужен для вычисления selectedIds)
const filteredProducts = computed(() => {
  const s = search.value.toLowerCase()
  const cid = category.value
  return (props.products || []).filter(p => {
    // Skip null/undefined products
    if (!p || !p.id) return false
    const bySearch = !s || (p.title || '').toLowerCase().includes(s)
    const byCat = !cid || p.categoryId === cid
    const byStatus = showScheduled.value || p.status !== 'scheduled'
    return bySearch && byCat && byStatus
  })
})

const filtered = computed(() => filteredProducts.value)

// Selection logic
const isAllSelected = computed(() => {
  return filteredProducts.value.length > 0 && 
         filteredProducts.value.every(product => selectedIds.value.includes(product.id))
})

const total = computed(() => props.pagination?.total ?? filtered.value.length)
const totalPages = computed(() => props.pagination?.totalPages ?? Math.max(1, Math.ceil(filtered.value.length / pageSize.value)))

const paged = computed(() => {
  if (props.pagination) {
    // Assume server-side pagination; show current list as-is
    // Filter out null/undefined products
    return filtered.value.filter(p => p && p.id)
  }
  const start = (page.value - 1) * pageSize.value
  return filtered.value.filter(p => p && p.id).slice(start, start + pageSize.value)
})

function go(p: number) {
  const newPage = Math.min(Math.max(1, p), totalPages.value)
  page.value = newPage
  emit('changePage', newPage)
}

const from = computed(() => (total.value === 0 ? 0 : ((page.value - 1) * pageSize.value) + 1))
const to = computed(() => Math.min(page.value * pageSize.value, total.value))

function categoryName(id: string) {
  return props.categories.find(c => c.id === id)?.name || '-'
}

function formatDate(d?: string) {
  if (!d) return '-'
  try { return new Date(d).toLocaleDateString() } catch { return d }
}

function formatSize(size?: string | null): string {
  return formatProductSizeLabel(size)
}

function getStatusMeta(product: Product) {
  const status = product.status || 'published'
  if (status === 'published') return null

  if (status === 'scheduled') {
    return {
      label: 'Отложен',
      class: 'bg-amber-100 text-amber-800 border border-amber-200'
    }
  }

  return {
    label: 'Черновик',
    class: 'bg-gray-200 text-gray-700 border border-gray-300'
  }
}

function hasStatusBadge(product: Product) {
  return !!product.status && product.status !== 'published'
}

function formatPublishAt(publishAt?: string | null) {
  if (!publishAt) return ''
  try {
    return new Date(publishAt).toLocaleString('ru-RU', {
      dateStyle: 'short',
      timeStyle: 'short'
    })
  } catch (error) {
    console.warn('Не удалось отформатировать дату публикации', error)
    return publishAt
  }
}

// Selection methods
function toggleSelect(id: string) {
  const index = selectedIds.value.indexOf(id)
  if (index === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(index, 1)
  }
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = [...filteredProducts.value.map(p => p.id)]
  }
}

function clearSelection() {
  selectedIds.value = []
}

// Batch operations
function batchDelete() {
  if (selectedIds.value.length === 0) return
  if (confirm(`Удалить ${selectedIds.value.length} товаров?`)) {
    emit('batchDelete', [...selectedIds.value])
    clearSelection()
  }
}

function batchChangeCategory() {
  if (selectedIds.value.length === 0) return
  
  // Показываем модальное окно для выбора категории
  showCategoryModal.value = true
}


// Modal handlers
function confirmCategoryChange() {
  if (selectedCategoryId.value && selectedIds.value.length > 0) {
    emit('batchChangeCategory', [...selectedIds.value], selectedCategoryId.value)
    clearSelection()
    cancelCategoryChange()
  }
}

function cancelCategoryChange() {
  showCategoryModal.value = false
  selectedCategoryId.value = ''
}

// Copy link functionality
const copiedToast = ref('')
const toastTimer = ref<number | null>(null)

function copyProductLink(productId: string) {
  // Создаём ссылку на товар в формате /p/{id}
  const productUrl = `/p/${productId}`
  
  // Копируем в буфер обмена
  if (navigator.clipboard) {
    navigator.clipboard.writeText(productUrl).then(() => {
      showCopiedToast('Внутренняя ссылка для вставки в баннер скопирована')
      console.log('Ссылка на товар скопирована:', productUrl)
    }).catch(err => {
      console.error('Ошибка копирования:', err)
      fallbackCopy(productUrl)
    })
  } else {
    fallbackCopy(productUrl)
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
    console.log('Ссылка на товар скопирована (fallback):', text)
  } catch (err) {
    console.error('Ошибка fallback копирования:', err)
    showCopiedToast('Ошибка копирования')
  }
  document.body.removeChild(textArea)
}

// Watch props - очищаем выбор при изменении товаров
watch(() => props.products, () => {
  selectedIds.value = []
}, { deep: true })
</script>