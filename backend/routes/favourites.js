const router = require('express').Router();
const db = require('../db/database');
const { downloadItemFavourites, downloadAllFavourites, downloadTypeFavourites, downloadFanartIds } = require('../services/download');

// GET /api/favourites - all favourites
router.get('/', (req, res) => {
  const { media_item_id } = req.query;
  let where = '1=1';
  const params = [];
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

// POST /api/favourites - add favourite
router.post('/', (req, res) => {
  const { fanart_id, media_item_id } = req.body;
  if (!fanart_id || !media_item_id) return res.status(400).json({ error: 'Missing fields' });

  try {
    const result = db.prepare(
      'INSERT OR IGNORE INTO favourites(fanart_id, media_item_id) VALUES(?,?)'
    ).run(fanart_id, media_item_id);
    res.json({ ok: true, created: result.changes > 0 });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE /api/favourites/:id - remove favourite
router.delete('/:id', (req, res) => {
  // id can be favourite id OR fanart_id
  const result = db.prepare('DELETE FROM favourites WHERE id=? OR fanart_id=?')
    .run(req.params.id, req.params.id);
  res.json({ ok: true, deleted: result.changes });
});

// GET /api/favourites/stats - counts per media item
router.get('/stats', (req, res) => {
  const stats = db.prepare(`
    SELECT mi.id, mi.title, mi.type, COUNT(fav.id) as count
    FROM media_items mi
    JOIN favourites fav ON fav.media_item_id = mi.id
    GROUP BY mi.id
    ORDER BY mi.title
  `).all();
  res.json(stats);
});

// POST /api/favourites/download/view - download current view (array of fanart IDs)
router.post('/download/view', async (req, res) => {
  const { fanart_ids, label } = req.body;
  if (!Array.isArray(fanart_ids) || fanart_ids.length === 0) {
    return res.status(400).json({ error: 'fanart_ids array required' });
  }
  await downloadFanartIds(fanart_ids, label, res);
});

// GET /api/favourites/download/all - zip all
router.get('/download/all', async (req, res) => {
  await downloadAllFavourites(res);
});

// GET /api/favourites/download/shows - zip shows only
router.get('/download/shows', async (req, res) => {
  await downloadTypeFavourites('show', res);
});

// GET /api/favourites/download/movies - zip movies only
router.get('/download/movies', async (req, res) => {
  await downloadTypeFavourites('movie', res);
});

// GET /api/favourites/download/:mediaItemId - zip one item
router.get('/download/:mediaItemId', async (req, res) => {
  await downloadItemFavourites(req.params.mediaItemId, res);
});

module.exports = router;
