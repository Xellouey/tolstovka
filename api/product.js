import fs from 'fs';
import path from 'path';

function toPlaceholderUrl(title, i = 0) {
  const text = encodeURIComponent((title || 'TOLSOVKA') + (i ? ` #${i+1}` : ''));
  return `https://placehold.co/600x800/png?text=${text}`;
}

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

  try {
    const prodsPath = path.join(process.cwd(), 'server', 'seed', 'products.json');
    const prods = JSON.parse(fs.readFileSync(prodsPath, 'utf8'));
    const p = Array.isArray(prods) ? prods.find(x => String(x.id) === String(id)) : null;
    if (!p) {
      res.status(404).json({ error: 'not_found' });
      return;
    }
    const imgs = Array.isArray(p.images) && p.images.length
      ? p.images.map((_, i) => toPlaceholderUrl(p.title, i))
      : [toPlaceholderUrl(p.title)];
    res.status(200).json({ ...p, images: imgs });
  } catch (e) {
    res.status(404).json({ error: 'not_found' });
  }
}
