<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div>
        <h2 class="text-xl font-semibold text-brand-dark font-primary">Промокоды</h2>
        <p class="text-sm text-gray-500 font-primary">Управляйте скидками и отслеживайте использование</p>
      </div>
      <button
        class="px-4 py-2 bg-brand-primary text-brand-dark rounded-xl font-semibold text-sm uppercase tracking-wide shadow-md hover:shadow-lg transition-all duration-200"
        type="button"
        @click="openCreate"
      >
        Создать промокод
      </button>
    </div>

    <div v-if="isLoading && !promoCodes.length" class="card-base p-6 flex flex-col gap-4">
      <div class="h-10 bg-gray-200 animate-pulse rounded"></div>
      <div class="h-10 bg-gray-200 animate-pulse rounded"></div>
      <div class="h-10 bg-gray-200 animate-pulse rounded"></div>
    </div>

    <div v-else-if="promoCodes.length" class="card-base overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Код</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Скидка</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Мин. сумма</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Использовано</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Статус</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Действует до</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Действия</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="promo in promoCodes" :key="promo.code" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3 font-semibold text-brand-dark">{{ promo.code }}</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ formatDiscount(promo) }}</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ formatCurrency(promo.minSubtotal) }}</td>
              <td class="px-4 py-3 text-sm text-gray-700">
                <span>{{ promo.usageCount }}</span>
                <span v-if="promo.remainingUses !== null" class="text-gray-400 text-xs">/ {{ promo.remainingUses + promo.usageCount }}</span>
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                  :class="promo.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'"
                >
                  {{ promo.isActive ? 'Активен' : 'Выключен' }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ formatDate(promo.expiresAt) }}</td>
              <td class="px-4 py-3 text-right">
                <div class="flex justify-end gap-2">
                  <button
                    class="px-3 py-1.5 text-xs font-semibold text-brand-dark border border-brand-dark rounded-lg hover:bg-brand-dark hover:text-white transition-colors"
                    type="button"
                    @click="openEdit(promo)"
                  >
                    Изменить
                  </button>
                  <button
                    class="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                    type="button"
                    @click="confirmDelete(promo)"
                  >
                    Удалить
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else class="card-base p-8 text-center text-sm text-gray-500 font-primary">
      Промокоды пока не созданы. Нажмите «Создать промокод», чтобы добавить первый.
    </div>

    <AdminModal
      v-if="showForm"
      :is-open="showForm"
      :title="isEditing ? 'Редактировать промокод' : 'Создать промокод'"
      :show-actions="false"
      size="lg"
      @close="closeForm"
    >
      <form class="space-y-6 pr-2" @submit.prevent="submitForm">
        <!-- Основная информация -->
        <div class="space-y-4">
          <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Основная информация</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1.5">
                Код промокода <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.code"
                :disabled="isEditing"
                type="text"
                required
                placeholder="SUMMER2024"
                class="w-full max-w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all disabled:bg-gray-100 disabled:text-gray-500 uppercase"
                style="box-sizing: border-box;"
              />
              <p class="text-xs text-gray-500 mt-1">Латиница и цифры, без пробелов</p>
            </div>

            <div class="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <input 
                v-model="form.isActive" 
                type="checkbox" 
                id="promo-active"
                class="w-4 h-4 mt-0.5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary focus:ring-2"
              />
              <div class="flex-1">
                <label for="promo-active" class="block text-sm font-medium text-gray-700 cursor-pointer">
                  Активен
                </label>
                <p class="text-xs text-gray-500 mt-0.5">Клиенты смогут использовать промокод</p>
              </div>
            </div>
          </div>

        </div>

        <!-- Настройки скидки -->
        <div class="space-y-4 pt-4 border-t border-gray-200">
          <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Настройки скидки</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1.5">
                Тип скидки <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.discountType"
                class="w-full max-w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                style="box-sizing: border-box;"
              >
                <option value="percent">Процент от суммы</option>
                <option value="fixed">Фиксированная сумма (₽)</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1.5">
                Значение <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  v-model.number="form.discountValue"
                  type="number"
                  min="0"
                  :step="form.discountType === 'percent' ? '1' : '10'"
                  :max="form.discountType === 'percent' ? '100' : undefined"
                  required
                  :placeholder="form.discountType === 'percent' ? '10' : '500'"
                  class="w-full max-w-full border border-gray-300 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                  style="box-sizing: border-box;"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  {{ form.discountType === 'percent' ? '%' : '₽' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Условия использования -->
        <div class="space-y-4 pt-4 border-t border-gray-200">
          <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Условия использования</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1.5">Минимальная сумма заказа</label>
              <div class="relative">
                <input
                  v-model.number="form.minSubtotal"
                  type="number"
                  min="0"
                  step="100"
                  placeholder="0"
                  class="w-full max-w-full border border-gray-300 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                  style="box-sizing: border-box;"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">₽</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">Оставьте 0 для любой суммы</p>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1.5">Максимум использований</label>
              <input
                v-model.number="form.maxUses"
                type="number"
                min="0"
                step="1"
                placeholder="Не ограничено"
                class="w-full max-w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                style="box-sizing: border-box;"
              />
              <p class="text-xs text-gray-500 mt-1">Пусто = неограниченно</p>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1.5">Дата истечения</label>
              <input
                v-model="form.expiresAt"
                type="date"
                class="w-full max-w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                style="box-sizing: border-box;"
              />
              <p class="text-xs text-gray-500 mt-1">Пусто = бессрочно</p>
            </div>
          </div>
        </div>

        <!-- Ошибка -->
        <div v-if="formError" class="rounded-lg bg-red-50 border border-red-200 px-4 py-3 flex items-start gap-2">
          <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <p class="text-sm text-red-700 font-medium">{{ formError }}</p>
        </div>

        <!-- Кнопки действий -->
        <div class="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            @click="closeForm"
            class="w-full sm:w-auto px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold uppercase tracking-wide hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            class="w-full sm:flex-1 px-6 py-2.5 bg-brand-dark text-white rounded-lg text-sm font-semibold uppercase tracking-wide hover:bg-brand-dark/90 transition-colors shadow-sm hover:shadow-md"
          >
            {{ isEditing ? 'Сохранить изменения' : 'Создать промокод' }}
          </button>
        </div>
      </form>
    </AdminModal>

  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import AdminModal from '@/components/AdminModal.vue'
import { useAdminStore, type PromoCode } from '@/stores/admin'
import { useTelegramStore } from '@/stores/telegram'

const props = defineProps<{
  promoCodes: PromoCode[]
  isLoading: boolean
}>()

const adminStore = useAdminStore()
const telegramStore = useTelegramStore()

const showForm = ref(false)
const isEditing = ref(false)
const formError = ref<string | null>(null)
const form = ref({
  code: '',
  description: '',
  discountType: 'percent' as 'percent' | 'fixed',
  discountValue: 10,
  minSubtotal: 0,
  maxUses: null as number | null,
  isActive: true,
  expiresAt: ''
})


function resetForm() {
  form.value = {
    code: '',
    description: '',
    discountType: 'percent',
    discountValue: 10,
    minSubtotal: 0,
    maxUses: null,
    isActive: true,
    expiresAt: ''
  }
  formError.value = null
}

function openCreate() {
  resetForm()
  isEditing.value = false
  showForm.value = true
}

function openEdit(promo: PromoCode) {
  isEditing.value = true
  form.value = {
    code: promo.code,
    description: promo.description || '',
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    minSubtotal: promo.minSubtotal,
    maxUses: promo.maxUses,
    isActive: promo.isActive,
    expiresAt: promo.expiresAt ? promo.expiresAt.slice(0, 10) : ''
  }
  formError.value = null
  showForm.value = true
}

function closeForm() {
  showForm.value = false
}

async function submitForm() {
  if (!form.value.code.trim()) {
    formError.value = 'Укажите код промокода'
    return
  }
  if (form.value.discountValue <= 0) {
    formError.value = 'Значение скидки должно быть больше нуля'
    return
  }
  try {
    formError.value = null
    if (isEditing.value) {
      await adminStore.updatePromoCode(form.value.code, {
        description: form.value.description || null,
        discountType: form.value.discountType,
        discountValue: form.value.discountValue,
        minSubtotal: form.value.minSubtotal,
        maxUses: form.value.maxUses === null || form.value.maxUses === undefined ? null : form.value.maxUses,
        isActive: form.value.isActive,
        expiresAt: form.value.expiresAt || null
      })
    } else {
      await adminStore.createPromoCode({
        code: form.value.code.trim().toUpperCase(),
        description: form.value.description || undefined,
        discountType: form.value.discountType,
        discountValue: form.value.discountValue,
        minSubtotal: form.value.minSubtotal,
        maxUses: form.value.maxUses === null || form.value.maxUses === undefined ? null : form.value.maxUses,
        isActive: form.value.isActive,
        expiresAt: form.value.expiresAt || null
      })
    }
    showForm.value = false
  } catch (err: any) {
    formError.value = err?.data?.message || err?.message || 'Не удалось сохранить промокод'
  }
}

async function confirmDelete(promo: PromoCode) {
  if (typeof window !== 'undefined' && !window.confirm(`Удалить промокод ${promo.code}?`)) {
    return
  }
  try {
    await adminStore.deletePromoCode(promo.code)
  } catch (err) {
    // Ошибка уже обработана в сторе
  }
}


function formatDiscount(promo: PromoCode) {
  return promo.discountType === 'percent'
    ? `${promo.discountValue}%`
    : `${formatCurrency(promo.discountValue)}`
}

function formatCurrency(value: number) {
  return `${value.toLocaleString('ru-RU')} ₽`
}

function formatDate(value: string | null) {
  if (!value) return 'Без ограничений'
  const date = new Date(value)
  return isNaN(date.getTime()) ? '—' : date.toLocaleDateString('ru-RU')
}

</script>
