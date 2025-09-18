import express from 'express';
import slugify from 'slugify';
import { db } from '../db.js';
import { authMiddleware, issueToken, verifyPassword, changePassword, getAdminUsername } from '../auth.js';

export const adminRouter = express.Router();

// Login
adminRouter.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'missing' });
  const expectedUser = getAdminUsername();
  if (username !== expectedUser) return res.status(401).json({ error: 'unauthorized' });
  const ok = await verifyPassword(password);
  if (!ok) return res.status(401).json({ error: 'unauthorized' });
  const token = issueToken(username);
  res.cookie('tolsovka', token, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 7*24*3600*1000 });
  res.json({ ok: true, token });
});

// Change password
adminRouter.post('/api/admin/password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'missing' });
  const ok = await changePassword(currentPassword, newPassword);
  if (!ok) return res.status(400).json({ error: 'invalid_current_password' });
res.json({ ok: true });
});

// Products CRUD
adminRouter.post('/api/admin/products', authMiddleware, (req, res) => {
  const { categoryId, title, priceRub, description } = req.body || {};
  if (!categoryId || !Number.isFinite(Number(priceRub))) return res.status(400).json({ error: 'missing_fields' });
  const id = 'p_' + Math.random().toString(36).slice(2, 8);
  const createdAt = new Date().toISOString();
  db.prepare('INSERT INTO products (id, categoryId, title, priceRub, description, createdAt) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, categoryId, title || null, Number(priceRub), description || null, createdAt);
  res.json({ ok: true, id });
});

adminRouter.patch('/api/admin/products/:id', authMiddleware, (req, res) => {
  const id = req.params.id;
  const cur = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!cur) return res.status(404).json({ error: 'not_found' });
  const { categoryId, title, priceRub, description } = req.body || {};
  db.prepare('UPDATE products SET categoryId = ?, title = ?, priceRub = ?, description = ? WHERE id = ?')
    .run(categoryId || cur.categoryId, (title !== undefined ? title : cur.title), (Number.isFinite(Number(priceRub)) ? Number(priceRub) : cur.priceRub), (description !== undefined ? description : cur.description), id);
  res.json({ ok: true });
});

adminRouter.delete('/api/admin/products/:id', authMiddleware, (req, res) => {
  const id = req.params.id;
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  res.json({ ok: true });
});

adminRouter.post('/api/admin/products/:id/images/attach', authMiddleware, (req, res) => {
  const id = req.params.id;
  const { urls } = req.body || {};
  if (!Array.isArray(urls) || urls.length === 0) return res.status(400).json({ error: 'urls_required' });
  const cur = db.prepare('SELECT COUNT(*) as c FROM product_images WHERE productId = ?').get(id).c;
  const stmt = db.prepare('INSERT INTO product_images (productId, url, position) VALUES (?, ?, ?)');
  const tx = db.transaction((rows, start) => {
    let pos = start;
    for (const u of rows) { stmt.run(id, u, pos++); }
  });
  tx(urls, cur);
  res.json({ ok: true });
});

adminRouter.patch('/api/admin/products/:id/images/reorder', authMiddleware, (req, res) => {
  const id = req.params.id;
  const { urls } = req.body || {};
  if (!Array.isArray(urls)) return res.status(400).json({ error: 'urls_required' });
  const tx = db.transaction((arr) => {
    db.prepare('DELETE FROM product_images WHERE productId = ?').run(id);
    const stmt = db.prepare('INSERT INTO product_images (productId, url, position) VALUES (?, ?, ?)');
    arr.forEach((u, i) => stmt.run(id, u, i));
  });
  tx(urls);
  res.json({ ok: true });
});

adminRouter.delete('/api/admin/products/:id/images', authMiddleware, (req, res) => {
  const id = req.params.id;
  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: 'url_required' });
  const rows = db.prepare('SELECT url FROM product_images WHERE productId = ? ORDER BY position ASC').all(id).map(r => r.url);
  const next = rows.filter(u => u !== url);
  const tx = db.transaction((arr) => {
    db.prepare('DELETE FROM product_images WHERE productId = ?').run(id);
    const stmt = db.prepare('INSERT INTO product_images (productId, url, position) VALUES (?, ?, ?)');
    arr.forEach((u, i) => stmt.run(id, u, i));
  });
  tx(next);
  res.json({ ok: true });
});

// Categories CRUD
// Banners CRUD
adminRouter.get('/api/admin/banners', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT id, image, href, active, [order] FROM banners ORDER BY [order] ASC').all();
  res.json(rows);
});

adminRouter.post('/api/admin/banners', authMiddleware, (req, res) => {
  const { image, href, active, order } = req.body || {};
  if (!image) return res.status(400).json({ error: 'image_required' });
  const id = 'b_' + Math.random().toString(36).slice(2, 8);
  db.prepare('INSERT INTO banners (id, image, href, active, [order]) VALUES (?, ?, ?, ?, ?)')
    .run(id, image, href || null, active ? 1 : 1, Number.isFinite(order) ? order : 0);
  res.json({ ok: true, id });
});

adminRouter.patch('/api/admin/banners/:id', authMiddleware, (req, res) => {
  const id = req.params.id;
  const { image, href, active, order } = req.body || {};
  const cur = db.prepare('SELECT * FROM banners WHERE id = ?').get(id);
  if (!cur) return res.status(404).json({ error: 'not_found' });
  db.prepare('UPDATE banners SET image = ?, href = ?, active = ?, [order] = ? WHERE id = ?')
    .run(image || cur.image, (href !== undefined ? href : cur.href), (active !== undefined ? (active ? 1 : 0) : cur.active), (Number.isFinite(order) ? order : cur.order), id);
  res.json({ ok: true });
});

adminRouter.patch('/api/admin/banners/reorder', authMiddleware, (req, res) => {
  const { items } = req.body || {};
  if (!Array.isArray(items)) return res.status(400).json({ error: 'items_required' });
  const stmt = db.prepare('UPDATE banners SET [order] = @order WHERE id = @id');
  const tx = db.transaction((rows) => { for (const r of rows) stmt.run(r); });
  tx(items.map(x => ({ id: x.id, order: Number(x.order) || 0 })));
  res.json({ ok: true });
});

adminRouter.delete('/api/admin/banners/:id', authMiddleware, (req, res) => {
  const id = req.params.id;
  db.prepare('DELETE FROM banners WHERE id = ?').run(id);
  res.json({ ok: true });
});

// Categories CRUD
adminRouter.post('/api/admin/categories', authMiddleware, (req, res) => {
  const { name, order } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name_required' });
  const slug = slugify(name, { lower: true, strict: true, locale: 'ru' });
  const id = 'c_' + Math.random().toString(36).slice(2, 8);
  try {
    db.prepare('INSERT INTO categories (id, slug, name, [order]) VALUES (?, ?, ?, ?)').run(id, slug, name, Number.isFinite(order) ? order : 0);
    res.json({ ok: true, id, slug, name, order: Number.isFinite(order) ? order : 0 });
  } catch (e) {
    res.status(400).json({ error: 'insert_failed', details: String(e) });
  }
});

adminRouter.patch('/api/admin/categories/reorder', authMiddleware, (req, res) => {
  const { items } = req.body || {};
  if (!Array.isArray(items)) return res.status(400).json({ error: 'items_required' });
  const stmt = db.prepare('UPDATE categories SET [order] = @order WHERE id = @id');
  const tx = db.transaction((rows) => { for (const r of rows) stmt.run(r); });
  tx(items.map(x => ({ id: x.id, order: Number(x.order) || 0 })));
  res.json({ ok: true });
});

adminRouter.delete('/api/admin/categories/:id', authMiddleware, (req, res) => {
  const id = req.params.id;
  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  res.json({ ok: true });
});