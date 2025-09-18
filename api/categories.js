import fs from 'fs';
import path from 'path';

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

  try {
    const categoriesPath = path.join(process.cwd(), 'server', 'seed', 'categories.json');
    const raw = fs.readFileSync(categoriesPath, 'utf8');
    const cats = JSON.parse(raw);
    cats.sort((a,b) => (a.order||0) - (b.order||0) || a.name.localeCompare(b.name));
    res.status(200).json(cats);
  } catch (e) {
    res.status(200).json([]);
  }
}
