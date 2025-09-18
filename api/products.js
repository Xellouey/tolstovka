// Mock data for products - в production можно использовать внешнюю БД
const products = [
  {
    id: "p_001",
    categoryId: "c_jackets",
    title: "Классический пиджак",
    priceRub: 5900,
    description: "Элегантный пиджак из качественной шерсти",
    images: ["/uploads/demo/jacket1.jpg"],
    createdAt: "2024-01-01T12:00:00Z"
  },
  {
    id: "p_002",
    categoryId: "c_jeans",
    title: "Джинсы прямые",
    priceRub: 3500,
    description: "Классические джинсы прямого кроя",
    images: ["/uploads/demo/jeans1.jpg"],
    createdAt: "2024-01-02T12:00:00Z"
  },
  {
    id: "p_003",
    categoryId: "c_coats",
    title: "Куртка демисезонная",
    priceRub: 7800,
    description: "Легкая куртка для весны и осени",
    images: ["/uploads/demo/coat1.jpg"],
    createdAt: "2024-01-03T12:00:00Z"
  }
];

const categories = {
  "pidzhaki": "c_jackets",
  "dzhinsy": "c_jeans",
  "kurtki": "c_coats"
};

export default function handler(req, res) {
  // CORS headers
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

  let filteredProducts = [...products];

  // Filter by category
  const { category, sort } = req.query;
  if (category) {
    const categoryId = categories[category];
    if (categoryId) {
      filteredProducts = filteredProducts.filter(p => p.categoryId === categoryId);
    } else {
      res.status(200).json([]);
      return;
    }
  }

  // Sort products
  if (sort === 'price_desc') {
    filteredProducts.sort((a, b) => b.priceRub - a.priceRub);
  } else {
    filteredProducts.sort((a, b) => a.priceRub - b.priceRub);
  }

  res.status(200).json(filteredProducts);
}