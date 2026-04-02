const fetch = require('node-fetch');
const archiver = require('archiver');
const path = require('path');
const fs = require('fs');
const db = require('../db/database');

const DOWNLOADS_DIR = process.env.DOWNLOADS_DIR || path.join(__dirname, '../../downloads');
if (!fs.existsSync(DOWNLOADS_DIR)) fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });

function sanitize(name) {
  return name.replace(/[^a-z0-9_\-. ]/gi, '_').replace(/\s+/g, '_').substring(0, 80);
}

async function streamImageToArchive(archive, url, filePath) {
  try {
    const res = await fetch(url, { timeout: 15000 });
    if (!res.ok) return false;
    const ext = url.split('?')[0].split('.').pop().toLowerCase() || 'jpg';
    const fullPath = filePath.endsWith(`.${ext}`) ? filePath : `${filePath}.${ext}`;
    archive.append(res.body, { name: fullPath });
    return true;
  } catch {
    return false;
  }
}

// Stream a zip of all favourites for a single media item to res
async function downloadItemFavourites(mediaItemId, res) {
  const item = db.prepare('SELECT * FROM media_items WHERE id=?').get(mediaItemId);
  if (!item) throw new Error('Media item not found');

  const favs = db.prepare(`
    SELECT f.*, fav.id as fav_id FROM fanart f
    JOIN favourites fav ON fav.fanart_id = f.id
    WHERE fav.media_item_id = ?
  `).all(mediaItemId);

  const zipName = `${sanitize(item.title)}_fanart.zip`;
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);

  const archive = archiver('zip', { zlib: { level: 5 } });
  archive.pipe(res);

  const counts = {};
  for (const fav of favs) {
    counts[fav.type] = (counts[fav.type] || 0) + 1;
    const n = String(counts[fav.type]).padStart(3, '0');
    const filePath = `${sanitize(item.title)}_${fav.type}_${n}`;
    await streamImageToArchive(archive, fav.url, filePath);
  }

  await archive.finalize();
}

// Stream a zip of ALL library favourites grouped by media item
async function downloadAllFavourites(res) {
  const items = db.prepare(`
    SELECT DISTINCT mi.* FROM media_items mi
    JOIN favourites fav ON fav.media_item_id = mi.id
    ORDER BY mi.type, mi.title
  `).all();

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="fanart_library.zip"');

  const archive = archiver('zip', { zlib: { level: 5 } });
  archive.pipe(res);

  for (const item of items) {
    const favs = db.prepare(`
      SELECT f.* FROM fanart f
      JOIN favourites fav ON fav.fanart_id = f.id
      WHERE fav.media_item_id = ?
    `).all(item.id);

    const counts = {};
    for (const fav of favs) {
      counts[fav.type] = (counts[fav.type] || 0) + 1;
      const n = String(counts[fav.type]).padStart(3, '0');
      const filePath = `${sanitize(item.title)}_${fav.type}_${n}`;
      await streamImageToArchive(archive, fav.url, filePath);
    }
  }

  await archive.finalize();
}

// Stream a zip of favourites for all items of a given type
async function downloadTypeFavourites(type, res) {
  const items = db.prepare(`
    SELECT DISTINCT mi.* FROM media_items mi
    JOIN favourites fav ON fav.media_item_id = mi.id
    WHERE mi.type = ?
    ORDER BY mi.title
  `).all(type);

  const zipName = type === 'show' ? 'tv_shows_fanart.zip' : 'movies_fanart.zip';
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);

  const archive = archiver('zip', { zlib: { level: 5 } });
  archive.pipe(res);

  for (const item of items) {
    const favs = db.prepare(`
      SELECT f.* FROM fanart f
      JOIN favourites fav ON fav.fanart_id = f.id
      WHERE fav.media_item_id = ?
    `).all(item.id);

    const counts = {};
    for (const fav of favs) {
      counts[fav.type] = (counts[fav.type] || 0) + 1;
      const n = String(counts[fav.type]).padStart(3, '0');
      const filePath = `${sanitize(item.title)}_${fav.type}_${n}`;
      await streamImageToArchive(archive, fav.url, filePath);
    }
  }

  await archive.finalize();
}

// Stream a zip of specific fanart IDs (current-view download from Favourites page)
async function downloadFanartIds(fanartIds, label, res) {
  const zipName = `${sanitize(label || 'favourites')}.zip`;
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);

  const archive = archiver('zip', { zlib: { level: 5 } });
  archive.pipe(res);

  const counts = {};
  for (const fanartId of fanartIds) {
    const row = db.prepare(`
      SELECT f.*, mi.title as media_title, mi.type as media_type
      FROM fanart f
      JOIN media_items mi ON mi.id = f.media_item_id
      WHERE f.id = ?
    `).get(fanartId);
    if (!row) continue;
    const key = `${sanitize(row.media_title)}/${row.type}`;
    counts[key] = (counts[key] || 0) + 1;
    const n = String(counts[key]).padStart(3, '0');
    const filePath = `${sanitize(row.media_title)}_${row.type}_${n}`;
    await streamImageToArchive(archive, row.url, filePath);
  }

  await archive.finalize();
}

module.exports = { downloadItemFavourites, downloadAllFavourites, downloadTypeFavourites, downloadFanartIds };
