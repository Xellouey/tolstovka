// Mock data for categories - в production можно использовать внешнюю БД
const categories = [
  { id: "c_jackets", slug: "pidzhaki", name: "Пиджаки", order: 10 },
  { id: "c_jeans", slug: "dzhinsy", name: "Джинсы", order: 20 },
  { id: "c_coats", slug: "kurtki", name: "Куртки", order: 30 }
];

export default function handler(req, res) {
  // CORS headers для Telegram Mini App
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  res.status(200).json(categories);
}