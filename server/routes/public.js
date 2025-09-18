import express from 'express';
import { db } from '../db.js';

export const publicRouter = express.Router();

publicRouter.get('/api/categories', (req, res) => {
  const rows = db.prepare('SELECT id, slug, name, [order] FROM categories ORDER BY [order] ASC, name ASC').all();
  res.json(rows);
});

publicRouter.get('/api/banners', (req, res) => {
  const rows = db.prepare('SELECT id, image, href, active, [order] FROM banners WHERE active = 1 ORDER BY [order] ASC').all();
  res.json(rows);
});

publicRouter.get('/api/products', (req, res) => {
  const { category, sort } = req.query;
  let where = '';
  let params = {};

  if (category) {
    const cat = db.prepare('SELECT id FROM categories WHERE slug = @slug').get({ slug: String(category) });
    if (!cat) return res.json([]);
    where = 'WHERE p.categoryId = @categoryId';
    params.categoryId = cat.id;
  }

  let orderBy = 'ORDER BY p.priceRub ASC';
  if (sort === 'price_desc') orderBy = 'ORDER BY p.priceRub DESC';
  if (sort === 'price_asc') orderBy = 'ORDER BY p.priceRub ASC';

  const sql = `
    SELECT p.id, p.categoryId, p.title, p.priceRub, p.description, p.createdAt
    FROM products p
    ${where}
    ${orderBy}
  `;
  const products = db.prepare(sql).all(params);

  const stmtImgs = db.prepare('SELECT url FROM product_images WHERE productId = @id ORDER BY position ASC');
  const enriched = products.map(p => ({ ...p, images: stmtImgs.all({ id: p.id }).map(r => r.url) }));
  res.json(enriched);
});

publicRouter.get('/api/product/:id', (req, res) => {
  const id = req.params.id;
  const p = db.prepare('SELECT id, categoryId, title, priceRub, description, createdAt FROM products WHERE id = ?').get(id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  const images = db.prepare('SELECT url FROM product_images WHERE productId = ? ORDER BY position ASC').all(id).map(r => r.url);
  res.json({ ...p, images });
});