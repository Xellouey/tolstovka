// Получение одного товара по id
const allProducts = [
  { id: "p_001", categoryId: "c_jackets", title: "Классический пиджак", priceRub: 5900, description: "Элегантный пиджак из качественной шерсти", images: ["/uploads/demo/jacket1.jpg"], createdAt: "2024-01-01T12:00:00Z" },
  { id: "p_002", categoryId: "c_jeans", title: "Джинсы прямые", priceRub: 3500, description: "Классические джинсы прямого кроя", images: ["/uploads/demo/jeans1.jpg"], createdAt: "2024-01-02T12:00:00Z" },
  { id: "p_003", categoryId: "c_coats", title: "Куртка демисезонная", priceRub: 7800, description: "Легкая куртка для весны и осени", images: ["/uploads/demo/coat1.jpg"], createdAt: "2024-01-03T12:00:00Z" }
];

export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;
  if (!id) {
    res.status(400).json({ error: 'id_required' });
    return;
  }

  const product = allProducts.find(p => p.id === id);
  if (!product) {
    res.status(404).json({ error: 'not_found' });
    return;
  }

  res.status(200).json(product);
}