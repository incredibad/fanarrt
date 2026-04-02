require('dotenv').config();
require('express-async-errors');

const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');

const { requireAuth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3579;

// Generate a stable session secret persisted to disk
const SESSION_SECRET = process.env.SESSION_SECRET || (() => {
  const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
  const secretFile = path.join(DATA_DIR, '.session_secret');
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(secretFile)) return fs.readFileSync(secretFile, 'utf8').trim();
  const secret = crypto.randomBytes(48).toString('hex');
  fs.writeFileSync(secretFile, secret, { mode: 0o600 });
  return secret;
})();

app.use(cors({ credentials: true }));
app.use(express.json());

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // set true if terminating HTTPS at a reverse proxy
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax',
  },
}));

// Public routes — no auth required
app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/proxy', require('./routes/proxy')); // image proxy — auth not required (URLs are opaque)

// Protected routes
app.use('/api/settings', requireAuth, require('./routes/settings'));
app.use('/api/library', requireAuth, require('./routes/library'));
app.use('/api/favourites', requireAuth, require('./routes/favourites'));
app.use('/api/collections', requireAuth, require('./routes/collections'));

// Serve frontend (SPA)
const PUBLIC = path.join(__dirname, 'public');
app.use(express.static(PUBLIC));
app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Fanarrt running on http://0.0.0.0:${PORT}`);
});
