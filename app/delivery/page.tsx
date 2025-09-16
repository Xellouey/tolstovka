export default function DeliveryPage() {
  return (
    <main className="min-h-screen p-4">
      <div className="bg-white rounded-xl p-4 border border-black/10">
        <h1 className="text-xl font-semibold mb-2">Доставка</h1>
        <ul className="list-disc list-inside text-sm opacity-80 space-y-1">
          <li>Условия доставки и самовывоза будут добавлены админом.</li>
          <li>Сроки, стоимость, транспортные компании.</li>
          <li>Возвраты и обмены — при наличии политики.</li>
        </ul>
      </div>
    </main>
  )
}