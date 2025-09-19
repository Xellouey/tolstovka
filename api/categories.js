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
      const stmt = db.prepare('SELECT id, slug, name, [order] FROM categories ORDER BY [order] ASC, name ASC');
      const categories = stmt.all();
      
      res.status(200).json(categories);
    } catch (error) {
      console.error('Database error in /api/categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}