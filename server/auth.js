import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADMIN_CONFIG = process.env.ADMIN_CONFIG || path.resolve(__dirname, './data/admin.json');
const SESSION_SECRET = process.env.SESSION_SECRET || 'change_me_secret';

function readAdminConfig() {
  const p = ADMIN_CONFIG.startsWith('.') ? path.resolve(__dirname, ADMIN_CONFIG) : ADMIN_CONFIG;
  if (!fs.existsSync(p)) {
    return { username: 'admin', passwordHash: 'PLAIN:admin', updatedAt: new Date().toISOString() };
  }
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function writeAdminConfig(cfg) {
  const p = ADMIN_CONFIG.startsWith('.') ? path.resolve(__dirname, ADMIN_CONFIG) : ADMIN_CONFIG;
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(p, JSON.stringify({ ...cfg, updatedAt: new Date().toISOString() }, null, 2), 'utf8');
}

export async function verifyPassword(inputPassword) {
  const cfg = readAdminConfig();
  const ph = cfg.passwordHash || '';
  if (ph.startsWith('PLAIN:')) {
    const plain = ph.slice('PLAIN:'.length);
    return inputPassword === plain;
  }
  if (ph.startsWith('$2')) { // bcrypt
    return await bcrypt.compare(inputPassword, ph);
  }
  return false;
}

export function issueToken(username) {
  const payload = { u: username, r: 'admin' };
  return jwt.sign(payload, SESSION_SECRET, { expiresIn: '7d' });
}

export function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    let token = null;
    if (header.startsWith('Bearer ')) token = header.slice(7);
    if (!token && req.cookies && req.cookies.tolsovka) token = req.cookies.tolsovka;
    if (!token) return res.status(401).json({ error: 'unauthorized' });
    const decoded = jwt.verify(token, SESSION_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'unauthorized' });
  }
}

export async function changePassword(currentPassword, newPassword) {
  const cfg = readAdminConfig();
  const ok = await verifyPassword(currentPassword);
  if (!ok) return false;
  const hash = await bcrypt.hash(newPassword, 10);
  writeAdminConfig({ ...cfg, passwordHash: hash });
  return true;
}

export function getAdminUsername() {
  const cfg = readAdminConfig();
  return cfg.username || 'admin';
}