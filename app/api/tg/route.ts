import { NextResponse } from 'next/server'
import { tgSendMessage } from '@/lib/tgbot'

export const dynamic = 'force-dynamic'

function baseUrl() {
  return process.env.NEXT_PUBLIC_WEBAPP_URL || 'http://localhost:3000'
}

function managerUsername() {
  return process.env.NEXT_PUBLIC_TG_MANAGER_USERNAME || 'manager_username'
}

export async function GET() {
  // Пинг-роут для проверки развертывания
  return NextResponse.json({ ok: true })
}

export async function POST(req: Request) {
  const update = await req.json().catch(() => null)
  if (!update) return NextResponse.json({ ok: true })

  try {
    if (update.message) {
      const msg = update.message
      const chatId = msg.chat?.id
      const text: string = msg.text || ''

      if (typeof chatId !== 'number' && typeof chatId !== 'string') {
        return NextResponse.json({ ok: true })
      }

      if (text.startsWith('/start')) {
        const welcome = 'Добро пожаловать! Откройте витрину или выберите раздел:'
        const app = baseUrl()
        const manager = managerUsername()
        const reply_markup = {
          inline_keyboard: [
            [ { text: 'Смотреть товар', web_app: { url: `${app}` } } ],
            [ { text: 'Новый дроп', web_app: { url: `${app}/c/new-drop` } } ],
            [ { text: 'О нас', web_app: { url: `${app}/about` } }, { text: 'Доставка', web_app: { url: `${app}/delivery` } } ],
            [ { text: 'Обратная связь', url: `https://t.me/${manager}` } ],
          ]
        }
        await tgSendMessage(chatId, welcome, reply_markup)
      } else {
        // На любые другие сообщения — подсказка
        await tgSendMessage(chatId, 'Напишите /start, чтобы открыть меню с витриной и разделами.')
      }
    }
  } catch (e) {
    // Не падаем для Telegram — просто отвечаем 200
  }

  return NextResponse.json({ ok: true })
}