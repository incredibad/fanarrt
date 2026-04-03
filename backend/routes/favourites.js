const router = require('express').Router();
const db = require('../db/database');
const { downloadItemFavourites, downloadAllFavourites, downloadTypeFavourites, downloadFanartIds } = require('../services/download');

// GET /api/favourites?collection_id=X
router.get('/', (req, res) => {
  const { media_item_id, collection_id } = req.query;
  let where = '1=1';
  const params = [];
  if (collection_id) { where += ' AND fav.collection_id=?'; params.push(collection_id); }
  if (media_item_id) { where += ' AND fav.media_item_id=?'; params.push(media_item_id); }

  const favs = db.prepare(`
    SELECT fav.*, f.url, f.thumbnail_url, f.type, f.source, f.width, f.height,
           mi.title as media_title, mi.type as media_type
    FROM favourites fav
    JOIN fanart f ON f.id = fav.fanart_id
    JOIN media_items mi ON mi.id = fav.media_item_id
    WHERE ${where}
    ORDER BY mi.title, f.type
  `).all(...params);

  res.json(favs);
});

// POST /api/favourites — add to collection
router.post('/', (req, res) => {
  const { fanart_id, media_item_id, collection_id } = req.body;
  if (!fanart_id || !media_item_id || !collection_id) return res.status(400).json({ error: 'Missing fields' });

  try {
    const result = db.prepare(
      'INSERT OR IGNORE INTO favourites(collection_id, fanart_id, media_item_id) VALUES(?,?,?)'
    ).run(collection_id, fanart_id, media_item_id);
    const id = result.lastInsertRowid || db.prepare(
      'SELECT id FROM favourites WHERE collection_id=? AND fanart_id=?'
    ).get(collection_id, fanart_id)?.id;
    res.json({ ok: true, created: result.changes > 0, id });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// GET /api/favourites/for-fanart/:fanartId — which collections contain this fanart item
router.get('/for-fanart/:fanartId', (req, res) => {
  const rows = db.prepare('SELECT id, collection_id FROM favourites WHERE fanart_id = ?').all(req.params.fanartId)
  res.json(rows)
})

// DELETE /api/favourites/:id — remove by row id (collection-scoped)
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM favourites WHERE id=?').run(req.params.id);
  res.json({ ok: true, deleted: result.changes });
});

// GET /api/favourites/stats?collection_id=X — counts per media item
router.get('/stats', (req, res) => {
  const { collection_id } = req.query;
  let where = '1=1';
  const params = [];
  if (collection_id) { where += ' AND fav.collection_id=?'; params.push(collection_id); }

  const stats = db.prepare(`
    SELECT mi.id, mi.title, mi.type, COUNT(fav.id) as count
    FROM media_items mi
    JOIN favourites fav ON fav.media_item_id = mi.id
    WHERE ${where}
    GROUP BY mi.id
    ORDER BY mi.title
  `).all(...params);
  res.json(stats);
});

// POST /api/favourites/download/view
router.post('/download/view', async (req, res) => {
  const { fanart_ids, label } = req.body;
  if (!Array.isArray(fanart_ids) || fanart_ids.length === 0) {
    return res.status(400).json({ error: 'fanart_ids array required' });
  }
  await downloadFanartIds(fanart_ids, label, res);
});

// GET /api/favourites/download/all
router.get('/download/all', async (req, res) => {
  await downloadAllFavourites(res);
});

// GET /api/favourites/download/shows
router.get('/download/shows', async (req, res) => {
  await downloadTypeFavourites('show', res);
});

// GET /api/favourites/download/movies
router.get('/download/movies', async (req, res) => {
  await downloadTypeFavourites('movie', res);
});

// GET /api/favourites/download/anime
router.get('/download/anime', async (req, res) => {
  await downloadTypeFavourites('anime', res);
});

// GET /api/favourites/download/:mediaItemId
router.get('/download/:mediaItemId', async (req, res) => {
  await downloadItemFavourites(req.params.mediaItemId, res);
});

module.exports = router;
