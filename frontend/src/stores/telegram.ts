import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface TelegramUserInfo {
  id: string
  username: string | null
  firstName?: string
  lastName?: string
}

const FALLBACK_STORAGE_KEY = 'tolstovka-telegram-fallback'

function readFallbackUser(): TelegramUserInfo | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(FALLBACK_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed.id !== 'string') return null
    return {
      id: parsed.id,
      username: typeof parsed.username === 'string' ? parsed.username : null,
      firstName: typeof parsed.firstName === 'string' ? parsed.firstName : undefined,
      lastName: typeof parsed.lastName === 'string' ? parsed.lastName : undefined
    }
  } catch (error) {
    console.warn('[telegramStore] Failed to read fallback user', error)
    return null
  }
}

function persistFallbackUser(user: TelegramUserInfo) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      FALLBACK_STORAGE_KEY,
      JSON.stringify({ id: user.id, username: user.username, firstName: user.firstName, lastName: user.lastName })
    )
  } catch (error) {
    console.warn('[telegramStore] Failed to persist fallback user', error)
  }
}

function createFallbackUser(): TelegramUserInfo | null {
  if (typeof window === 'undefined') return null
  const id = `web_${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`
  const fallback: TelegramUserInfo = {
    id,
    username: null
  }
  persistFallbackUser(fallback)
  return fallback
}

export const useTelegramStore = defineStore('telegram', () => {
  const telegramUser = ref<TelegramUserInfo | null>(null)
  const fallbackUser = ref<TelegramUserInfo | null>(null)

  function syncFromWebApp() {
    if (typeof window === 'undefined') return
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
    if (tgUser && typeof tgUser.id !== 'undefined') {
      telegramUser.value = {
        id: String(tgUser.id),
        username: typeof tgUser.username === 'string' ? tgUser.username : null,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name
      }
      return
    }
    telegramUser.value = null
  }

  function ensureFallback() {
    if (typeof window === 'undefined') return
    const existing = readFallbackUser()
    if (existing) {
      fallbackUser.value = existing
      return
    }
    const created = createFallbackUser()
    if (created) {
      fallbackUser.value = created
    }
  }

  function initFromEnvironment() {
    syncFromWebApp()
    if (!telegramUser.value) {
      ensureFallback()
    }
  }

  const currentUser = computed(() => telegramUser.value ?? fallbackUser.value)

  function getRequestPayload() {
    const user = currentUser.value
    if (!user) return null
    return {
      id: user.id,
      username: user.username
    }
  }

  return {
    telegramUser,
    fallbackUser,
    currentUser,
    initFromEnvironment,
    syncFromWebApp,
    getRequestPayload
  }
})
