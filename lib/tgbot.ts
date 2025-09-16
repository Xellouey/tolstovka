const API_HOST = 'https://api.telegram.org'

function getToken() {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set')
  return token
}

export async function tgSendMessage(chatId: number | string, text: string, replyMarkup?: any) {
  const token = getToken()
  const url = `${API_HOST}/bot${token}/sendMessage`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', reply_markup: replyMarkup })
  })
  if (!res.ok) {
    const body = await res.text().catch(()=> '')
    throw new Error(`Telegram sendMessage failed: ${res.status} ${body}`)
  }
  return res.json()
}