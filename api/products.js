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

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const catsPath = path.join(process.cwd(), 'server', 'seed', 'categories.json');
    const prodsPath = path.join(process.cwd(), 'server', 'seed', 'products.json');
    const cats = JSON.parse(fs.readFileSync(catsPath, 'utf8'));
    const prods = JSON.parse(fs.readFileSync(prodsPath, 'utf8'));

    const slugToId = Object.fromEntries(cats.map(c => [String(c.slug), String(c.id)]));

    const { category, sort } = req.query;
    let list = Array.isArray(prods) ? [...prods] : [];

    if (category) {
      const categoryId = slugToId[String(category)] || null;
      if (categoryId) list = list.filter(p => String(p.categoryId) === categoryId);
      else list = [];
    }

    // Images -> placeholders
    list = list.map(p => {
      const imgs = Array.isArray(p.images) && p.images.length
        ? p.images.map((_, i) => toPlaceholderUrl(p.title, i))
        : [toPlaceholderUrl(p.title)];
      return { ...p, images: imgs };
    });

    if (sort === 'price_desc') list.sort((a,b) => Number(b.priceRub)-Number(a.priceRub));
    else list.sort((a,b) => Number(a.priceRub)-Number(b.priceRub));

    res.status(200).json(list);
  } catch (e) {
    res.status(200).json([]);
  }
}
