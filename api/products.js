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
      const { category, sort = 'name', limit = 50, offset = 0 } = req.query;
      
      let whereClause = '';
      let params = [];
      
      if (category && category !== 'all') {
        // Get category by slug
        const catStmt = db.prepare('SELECT id FROM categories WHERE slug = ?');
        const cat = catStmt.get(category);
        if (cat) {
          whereClause = 'WHERE p.categoryId = ?';
          params.push(cat.id);
        }
      }
      
      // Order clause
      let orderBy = 'ORDER BY p.title ASC';
      switch (sort) {
        case 'price_asc':
          orderBy = 'ORDER BY p.priceRub ASC';
          break;
        case 'price_desc':
          orderBy = 'ORDER BY p.priceRub DESC';
          break;
        case 'newest':
          orderBy = 'ORDER BY p.createdAt DESC';
          break;
        case 'oldest':
          orderBy = 'ORDER BY p.createdAt ASC';
          break;
      }
      
      // Get products
      const sql = `
        SELECT p.id, p.categoryId, p.title, p.priceRub, p.description, p.createdAt
        FROM products p
        ${whereClause}
        ${orderBy}
        LIMIT ? OFFSET ?
      `;
      
      const queryParams = [...params, parseInt(limit), parseInt(offset)];
      const stmt = db.prepare(sql);
      const products = stmt.all(...queryParams);
      
      // Get images for each product
      const imgStmt = db.prepare('SELECT url FROM product_images WHERE productId = ? ORDER BY position ASC');
      const enriched = products.map(product => ({
        ...product,
        images: imgStmt.all(product.id).map(img => img.url),
        is_available: true, // For compatibility
        name: product.title, // For compatibility
        price: product.priceRub, // For compatibility
        category_id: product.categoryId // For compatibility
      }));
      
      res.status(200).json(enriched);
    } catch (error) {
      console.error('Database error in /api/products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}