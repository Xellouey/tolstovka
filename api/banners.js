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
      const stmt = db.prepare('SELECT id, image, href, active, [order] FROM banners WHERE active = 1 ORDER BY [order] ASC');
      const banners = stmt.all();
      
      res.status(200).json(banners);
    } catch (error) {
      console.error('Database error in /api/banners:', error);
      res.status(500).json({ error: 'Failed to fetch banners' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}