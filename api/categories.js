import { initDb } from '../server/db.js';

// Initialize database
const db = initDb();

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      // Получаем все категории с информацией о количестве товаров
      const stmt = db.prepare(`
        SELECT c.id, c.slug, c.name, c.[order], c.hide_empty, COUNT(p.id) as productCount
        FROM categories c
        LEFT JOIN products p ON c.id = p.categoryId
        GROUP BY c.id, c.slug, c.name, c.[order], c.hide_empty
        ORDER BY c.[order] ASC, c.name ASC
      `);
      const allCategories = stmt.all();
      
      // Фильтруем категории: исключаем те, у которых hide_empty=1 и нет товаров
      const categories = allCategories.filter(cat => {
        if (cat.hide_empty === 1 && cat.productCount === 0) {
          return false; // Скрываем пустые категории если включена настройка
        }
        return true;
      });
      
      // Убираем служебные поля перед отправкой
      const publicCategories = categories.map(({ hide_empty, productCount, ...cat }) => cat);
      
      res.status(200).json(publicCategories);
    } catch (error) {
      console.error('Database error in /api/categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}