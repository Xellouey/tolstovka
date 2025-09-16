export default function ContactsPage() {
  const manager = process.env.NEXT_PUBLIC_TG_MANAGER_USERNAME || 'manager_username'
  return (
    <main className="min-h-screen p-4">
      <div className="bg-white rounded-xl p-4 border border-black/10">
        <h1 className="text-xl font-semibold mb-2">Обратная связь</h1>
        <p className="text-sm opacity-80">Напишите нам в Telegram: <a className="underline" href={`https://t.me/${manager}`} target="_blank" rel="noreferrer">@{manager}</a></p>
      </div>
    </main>
  )
}