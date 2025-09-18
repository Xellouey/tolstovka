import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { initDb } from './db.js';
import { publicRouter } from './routes/public.js';
import { adminRouter } from './routes/admin.js';
import { uploadRouter } from './upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Init DB (tables + seed)
initDb();

// Middlewares
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static
const webDir = path.resolve(__dirname, '../web');
const uploadsDir = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir, { maxAge: '7d' }));
app.use('/', express.static(webDir, { index: false }));

// Health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// Public API
app.use(publicRouter);
// Admin API
app.use(adminRouter);
// Upload API
app.use(uploadRouter);

// Mini App routes (placeholder: serve static pages)
app.get('/', (req, res) => {
  res.sendFile(path.join(webDir, 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(webDir, 'admin', 'index.html'));
});

// 404 fallback for frontend routes (basic)
app.get(['/p/:id', '/category/:slug'], (req, res) => {
  res.sendFile(path.join(webDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[tolsovka] server listening on :${PORT}`);
});
