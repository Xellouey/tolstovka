// Небольшой хелпер для работы с Telegram WebApp SDK, с безопасным фоллбеком в браузере
export function openTelegramLink(url: string) {
  const anyWin = globalThis as any
  if (anyWin?.Telegram?.WebApp?.openTelegramLink) {
    try {
      anyWin.Telegram.WebApp.openTelegramLink(url)
      return
    } catch {}
  }
  // Фоллбек: открыть в новой вкладке (в браузере)
  window.open(url, '_blank')
}

export function readyExpand() {
  const anyWin = globalThis as any
  if (anyWin?.Telegram?.WebApp) {
    try {
      anyWin.Telegram.WebApp.ready()
      anyWin.Telegram.WebApp.expand()
    } catch {}
  }
}