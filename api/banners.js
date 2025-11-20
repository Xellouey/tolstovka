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
  } else if (req.method === 'PATCH' && req.url?.includes('/reorder')) {
    // Handle banners reordering
    try {
      console.log('🔥 [api/banners] Reorder endpoint called');
      console.log('🔥 [api/banners] request.body:', JSON.stringify(req.body, null, 2));
      
      const { banners } = req.body || {};
      console.log('🔥 [api/banners] Extracted banners:', banners);
      
      if (!Array.isArray(banners)) {
        console.log('🔥 [api/banners] ERROR: banners is not array:', banners);
        return res.status(400).json({ error: 'banners_required' });
      }
      
      // Validate each banner
      for (const banner of banners) {
        if (!banner.id || !Number.isFinite(banner.order)) {
          console.log('🔥 [api/banners] ERROR: invalid banner:', banner);
          return res.status(400).json({ error: 'invalid_banner_data' });
        }
      }
      
      // Update banner orders in database
      const stmt = db.prepare('UPDATE banners SET [order] = ? WHERE id = ?');
      const transaction = db.transaction((bannersToReorder) => {
        for (const banner of bannersToReorder) {
          const result = stmt.run(banner.order, banner.id);
          if (result.changes === 0) {
            throw new Error(`Banner not found: ${banner.id}`);
          }
        }
      });
      
      transaction(banners);
      console.log('🔥 [api/banners] Banners reordered successfully!');
      res.status(200).json({ success: true, message: 'Banners reordered' });
    } catch (error) {
      console.error('🔥 [api/banners] Reorder error:', error);
      res.status(500).json({ error: 'reorder_failed', message: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}