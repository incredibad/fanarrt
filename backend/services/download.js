const fetch = require('node-fetch');
const archiver = require('archiver');
const path = require('path');
const fs = require('fs');
const db = require('../db/database');

const DOWNLOADS_DIR = process.env.DOWNLOADS_DIR || path.join(__dirname, '../../downloads');
if (!fs.existsSync(DOWNLOADS_DIR)) fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });

function sanitize(name) {
  return (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '_') || 'unknown';
}

function normLang(code) {
  if (!code || code === '' || code === '00') return null;
  try {
    const tag = new Intl.Locale(code).language;
    return tag ? tag.toLowerCase() : null;
  } catch {
    return code.slice(0, 2).toLowerCase();
  }
}

function buildFilename(row, itemTitle, counter) {
  const title = sanitize(itemTitle || row.media_title || '');
  const provider = (row.source || '').replace(/[^a-z0-9]/gi, '').toLowerCase();
  const res = (row.width && row.height) ? `${row.width}x${row.height}` : null;
  const lang = normLang(row.language);
  const n = String(counter).padStart(3, '0');
  const segments = [row.type, provider, res, lang, n].filter(Boolean);
  return `${title}-${segments.join('-')}`;
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

  const zipName = `${sanitize(item.title)}.zip`;
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);

  const archive = archiver('zip', { zlib: { level: 5 } });
  archive.pipe(res);

  let counter = 0;
  for (const fav of favs) {
    const filePath = buildFilename(fav, item.title, ++counter);
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
  res.setHeader('Content-Disposition', 'attachment; filename="favourites-download.zip"');

  const archive = archiver('zip', { zlib: { level: 5 } });
  archive.pipe(res);

  for (const item of items) {
    const favs = db.prepare(`
      SELECT f.* FROM fanart f
      JOIN favourites fav ON fav.fanart_id = f.id
      WHERE fav.media_item_id = ?
    `).all(item.id);

    let counter = 0;
    for (const fav of favs) {
      const filePath = buildFilename(fav, item.title, ++counter);
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

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="favourites-download.zip"');

  const archive = archiver('zip', { zlib: { level: 5 } });
  archive.pipe(res);

  for (const item of items) {
    const favs = db.prepare(`
      SELECT f.* FROM fanart f
      JOIN favourites fav ON fav.fanart_id = f.id
      WHERE fav.media_item_id = ?
    `).all(item.id);

    let counter = 0;
    for (const fav of favs) {
      const filePath = buildFilename(fav, item.title, ++counter);
      await streamImageToArchive(archive, fav.url, filePath);
    }
  }

  await archive.finalize();
}

// Stream a zip of specific fanart IDs (current-view download from Favourites page)
async function downloadFanartIds(fanartIds, label, res) {
  const rows = fanartIds.map(id => db.prepare(`
    SELECT f.*, mi.title as media_title, mi.type as media_type
    FROM fanart f
    JOIN media_items mi ON mi.id = f.media_item_id
    WHERE f.id = ?
  `).get(id)).filter(Boolean);

  const uniqueTitles = [...new Set(rows.map(r => r.media_title))];
  const zipName = uniqueTitles.length === 1
    ? `${sanitize(uniqueTitles[0])}.zip`
    : 'favourites-download.zip';

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);

  const archive = archiver('zip', { zlib: { level: 5 } });
  archive.pipe(res);

  let counter = 0;
  for (const row of rows) {
    const filePath = buildFilename(row, row.media_title, ++counter);
    await streamImageToArchive(archive, row.url, filePath);
  }

  await archive.finalize();
}

module.exports = { downloadItemFavourites, downloadAllFavourites, downloadTypeFavourites, downloadFanartIds };
