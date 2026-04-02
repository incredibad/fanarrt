/**
 * Image proxy + disk cache.
 * GET /api/proxy/thumb?url=<encoded>   — fanart.tv images (with dimension detection)
 * GET /api/proxy/poster?url=<encoded>  — any image (poster cache)
 */

const router = require('express').Router();
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const db = require('../db/database');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../data');
const THUMB_CACHE  = path.join(DATA_DIR, 'thumb_cache');
const POSTER_CACHE = path.join(DATA_DIR, 'poster_cache');
for (const d of [THUMB_CACHE, POSTER_CACHE]) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function cacheFilePath(dir, url) {
  const hash = crypto.createHash('sha1').update(url).digest('hex');
  const rawExt = url.split('?')[0].split('.').pop().toLowerCase().replace(/[^a-z]/g, '');
  const ext = ['jpg','jpeg','png','gif','webp'].includes(rawExt) ? rawExt : 'jpg';
  return path.join(dir, `${hash}.${ext}`);
}

function mimeFor(ext) {
  if (ext === 'png')  return 'image/png';
  if (ext === 'gif')  return 'image/gif';
  if (ext === 'webp') return 'image/webp';
  return 'image/jpeg';
}

// Walk JPEG segments correctly to find the real image SOF, skipping embedded thumbnails
function jpegDimensions(buf) {
  if (buf.length < 4 || buf[0] !== 0xFF || buf[1] !== 0xD8) return null;
  let i = 2;
  while (i < buf.length - 4) {
    if (buf[i] !== 0xFF) break;
    const marker = buf[i + 1];
    // SOF markers (exclude DHT=C4, DAC=CC, JPG=C8)
    const isSOF = (marker >= 0xC0 && marker <= 0xC3) ||
                  (marker >= 0xC5 && marker <= 0xC7) ||
                  (marker >= 0xC9 && marker <= 0xCB) ||
                  (marker >= 0xCD && marker <= 0xCF);
    if (isSOF && i + 8 < buf.length) {
      const h = buf.readUInt16BE(i + 5);
      const w = buf.readUInt16BE(i + 7);
      // Skip tiny embedded EXIF thumbnails (always ≤160×120)
      if (w > 200 && h > 100) return { w, h };
    }
    // Standalone markers (no length field)
    if (marker === 0xD8 || marker === 0xD9 || (marker >= 0xD0 && marker <= 0xD7)) {
      i += 2;
    } else {
      if (i + 3 >= buf.length) break;
      const segLen = buf.readUInt16BE(i + 2);
      if (segLen < 2) break; // corrupt
      i += 2 + segLen;
    }
  }
  return null;
}

function pngDimensions(buf) {
  if (buf.length < 24) return null;
  // PNG magic: 89 50 4E 47 0D 0A 1A 0A
  if (buf[0] !== 0x89 || buf[1] !== 0x50) return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

function readDimensions(buf, contentType) {
  try {
    if (contentType && contentType.includes('png')) return pngDimensions(buf);
    return jpegDimensions(buf);
  } catch { return null; }
}

function storeDimensions(originalUrl, w, h) {
  try {
    db.prepare(
      'UPDATE fanart SET width=?, height=? WHERE url=? AND (width IS NULL OR width=0 OR height IS NULL OR height=0)'
    ).run(w, h, originalUrl);
  } catch {}
}

// Check DB for already-stored dimensions for a given URL
function getStoredDimensions(originalUrl) {
  try {
    const row = db.prepare('SELECT width, height FROM fanart WHERE url=? LIMIT 1').get(originalUrl);
    if (row && row.width > 0 && row.height > 0) return { w: row.width, h: row.height };
  } catch {}
  return null;
}

async function serveProxied(req, res, cacheDir, detectDimensions) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url param' });

  // Non-fanart.tv images that aren't in thumb cache: for poster route just proxy anything
  const cachePath = cacheFilePath(cacheDir, url);
  const ext = path.extname(cachePath).slice(1);
  const mime = mimeFor(ext);

  const sendFile = (filePath, dims) => {
    res.setHeader('Content-Type', mime);
    res.setHeader('Cache-Control', 'public, max-age=2592000');
    if (dims) {
      res.setHeader('X-Image-Width', String(dims.w));
      res.setHeader('X-Image-Height', String(dims.h));
    }
    fs.createReadStream(filePath).pipe(res);
  };

  // Serve from cache if fresh
  if (fs.existsSync(cachePath)) {
    const stat = fs.statSync(cachePath);
    if (Date.now() - stat.mtimeMs < MAX_AGE_MS) {
      if (detectDimensions) {
        // Check if dimensions already in DB
        let dims = getStoredDimensions(url);
        if (!dims) {
          // Read from cached file and store
          try {
            const buf = fs.readFileSync(cachePath);
            const ct = mime;
            dims = readDimensions(buf, ct);
            if (dims) storeDimensions(url, dims.w, dims.h);
          } catch {}
        }
        return sendFile(cachePath, dims);
      }
      return sendFile(cachePath, null);
    }
  }

  // Fetch from upstream
  try {
    const upstream = await fetch(url, {
      headers: { 'User-Agent': 'Fanarrt/1.0' },
      timeout: 20000,
    });
    if (!upstream.ok) {
      // If the upstream 404s, try to redirect directly
      return res.redirect(302, url);
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    const buf = await upstream.buffer();

    let dims = null;
    if (detectDimensions) {
      dims = readDimensions(buf, contentType);
      if (dims) storeDimensions(url, dims.w, dims.h);
    }

    fs.writeFile(cachePath, buf, () => {});

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=2592000');
    if (dims) {
      res.setHeader('X-Image-Width', String(dims.w));
      res.setHeader('X-Image-Height', String(dims.h));
    }
    res.send(buf);
  } catch {
    res.redirect(302, url);
  }
}

// Fanart.tv thumb route — with dimension detection
router.get('/thumb', (req, res) => serveProxied(req, res, THUMB_CACHE, true));

// Generic poster proxy — no dimension detection needed
router.get('/poster', (req, res) => serveProxied(req, res, POSTER_CACHE, false));

module.exports = router;
