const router = require('express').Router();
const bcrypt = require('bcrypt');
const db = require('../db/database');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again later.' },
});

const SALT_ROUNDS = 12;

// GET /api/auth/status — check if setup is needed and if logged in
router.get('/status', (req, res) => {
  const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  res.json({
    needsSetup: userCount === 0,
    loggedIn: !!req.session?.userId,
    username: req.session?.username || null,
  });
});

// POST /api/auth/setup — create the first admin account
router.post('/setup', authLimiter, async (req, res) => {
  const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  if (userCount > 0) {
    return res.status(400).json({ error: 'Setup already complete. Use login instead.' });
  }

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }
  if (username.trim().length < 2) {
    return res.status(400).json({ error: 'Username must be at least 2 characters.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = db.prepare(
    'INSERT INTO users (username, password_hash) VALUES (?, ?)'
  ).run(username.trim(), hash);

  const userId = result.lastInsertRowid;
  const trimmedUsername = username.trim();
  await new Promise((resolve, reject) => req.session.regenerate(e => e ? reject(e) : resolve()));
  req.session.userId = userId;
  req.session.username = trimmedUsername;

  res.json({ ok: true, username: trimmedUsername });
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ? COLLATE NOCASE').get(username.trim());
  if (!user) {
    // Consistent timing to prevent user enumeration
    await bcrypt.hash('dummy', SALT_ROUNDS);
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
  await new Promise((resolve, reject) => req.session.regenerate(e => e ? reject(e) : resolve()));
  req.session.userId = user.id;
  req.session.username = user.username;

  res.json({ ok: true, username: user.username });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

// POST /api/auth/change-password
router.post('/change-password', async (req, res) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Both current and new password are required.' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Current password is incorrect.' });
  }

  const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, user.id);
  res.json({ ok: true });
});

module.exports = router;
