const router = require('express').Router();
const db = require('../db/database');
const { syncSonarr, syncRadarr } = require('../services/arrSync');
const { fetchFanartForItem, fetchAniListFanart } = require('../services/fanartFetch');

// GET /api/library - list all media items
router.get('/', (req, res) => {
  const { type, search, page = 1, limit = 10000, collection_id } = req.query;
  let where = '1=1';
  const params = [];

  if (type && ['show', 'movie', 'anime'].includes(type)) {
    where += ' AND mi.type = ?';
    params.push(type);
  }
  if (search) {
    where += ' AND mi.title LIKE ?';
    params.push(`%${search}%`);
  }

  const collId = parseInt(collection_id) || null;
  const favJoin = collId
    ? `LEFT JOIN favourites fav ON fav.media_item_id = mi.id AND fav.collection_id = ${collId}`
    : `LEFT JOIN favourites fav ON fav.media_item_id = mi.id`;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const total = db.prepare(`SELECT COUNT(*) as c FROM media_items mi WHERE ${where}`).get(...params).c;

  const items = db.prepare(`
    SELECT mi.*,
      COUNT(DISTINCT f.id) as fanart_count,
      COUNT(DISTINCT fav.id) as favourite_count
    FROM media_items mi
    LEFT JOIN fanart f ON f.media_item_id = mi.id
    ${favJoin}
    WHERE ${where}
    GROUP BY mi.id
    ORDER BY mi.title ASC
    LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), offset);

  res.json({ items, total, page: parseInt(page), limit: parseInt(limit) });
});

// GET /api/library/:id - single item with fanart
router.get('/:id', (req, res) => {
  const item = db.prepare(`
    SELECT mi.*,
      COUNT(DISTINCT f.id) as fanart_count,
      COUNT(DISTINCT fav.id) as favourite_count
    FROM media_items mi
    LEFT JOIN fanart f ON f.media_item_id = mi.id
    LEFT JOIN favourites fav ON fav.media_item_id = mi.id
    WHERE mi.id = ?
    GROUP BY mi.id
  `).get(req.params.id);

  if (!item) return res.status(404).json({ error: 'Not found' });

  const sources = db.prepare(`
    SELECT instance_label, arr_type, instance_id, assigned_type
    FROM media_item_sources WHERE media_item_id = ?
    ORDER BY arr_type, instance_label
  `).all(req.params.id);

  const assignedTypes = [...new Set(sources.map(s => s.assigned_type))];
  const type_conflict = assignedTypes.length > 1;

  res.json({ ...item, sources, type_conflict });
});

// GET /api/library/:id/fanart
router.get('/:id/fanart', (req, res) => {
  const { type, source, collection_id } = req.query;
  const collId = parseInt(collection_id) || 0;
  let where = 'f.media_item_id = ?';
  const params = [req.params.id];

  if (type) { where += ' AND f.type = ?'; params.push(type); }
  if (source) { where += ' AND f.source = ?'; params.push(source); }

  // Get provider order from settings (default order if not set)
  const settings = require('../services/settings');
  let providerOrder = ['fanart.tv', 'tvdb', 'tmdb'];
  const savedOrder = settings.get('provider_order');
  if (Array.isArray(savedOrder) && savedOrder.length) providerOrder = savedOrder;

  const fanart = db.prepare(`
    SELECT f.*,
      fav_active.id as favourite_id,
      (SELECT COUNT(*) FROM favourites fo WHERE fo.fanart_id = f.id AND fo.collection_id != ?) as other_collection_count
    FROM fanart f
    LEFT JOIN favourites fav_active ON fav_active.fanart_id = f.id AND fav_active.collection_id = ?
    WHERE ${where}
    ORDER BY f.likes DESC, f.id ASC
  `).all(collId, collId, ...params);

  // Sort within each type group by provider order, then by likes
  const providerRank = Object.fromEntries(providerOrder.map((p, i) => [p, i]));
  fanart.sort((a, b) => {
    if (a.type !== b.type) return 0; // type grouping handled by TYPE_ORDER in frontend
    const ra = providerRank[a.source] ?? 99;
    const rb = providerRank[b.source] ?? 99;
    if (ra !== rb) return ra - rb;
    return (b.likes || 0) - (a.likes || 0);
  });

  // Group by type
  const grouped = {};
  for (const art of fanart) {
    if (!grouped[art.type]) grouped[art.type] = [];
    grouped[art.type].push(art);
  }

  // Within each type group, sort by provider order then likes
  for (const type of Object.keys(grouped)) {
    grouped[type].sort((a, b) => {
      const ra = providerRank[a.source] ?? 99;
      const rb = providerRank[b.source] ?? 99;
      if (ra !== rb) return ra - rb;
      return (b.likes || 0) - (a.likes || 0);
    });
  }

  res.json({ fanart, grouped, total: fanart.length });
});

// POST /api/library/sync - sync from Sonarr/Radarr
router.post('/sync', async (req, res) => {
  const results = { sonarr: null, radarr: null, errors: [] };

  try { results.sonarr = await syncSonarr(); }
  catch (e) { results.errors.push(`Sonarr: ${e.message}`); }

  try { results.radarr = await syncRadarr(); }
  catch (e) { results.errors.push(`Radarr: ${e.message}`); }

  res.json(results);
});

// POST /api/library/:id/fetch-fanart - fetch fanart for one item
router.post('/:id/fetch-fanart', async (req, res) => {
  const item = db.prepare('SELECT * FROM media_items WHERE id=?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });

  const count = await fetchFanartForItem(item);
  db.prepare('UPDATE media_items SET fanart_fetched_at=CURRENT_TIMESTAMP WHERE id=?').run(item.id);
  res.json({ fetched: count });
});

// GET /api/library/:id/needs-refresh - returns whether auto-fetch should run (48h window)
router.get('/:id/needs-refresh', (req, res) => {
  const item = db.prepare('SELECT fanart_fetched_at FROM media_items WHERE id=?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });

  let needsRefresh = true;
  if (item.fanart_fetched_at) {
    const fetchedAt = new Date(item.fanart_fetched_at + 'Z').getTime();
    const hoursSince = (Date.now() - fetchedAt) / (1000 * 60 * 60);
    needsRefresh = hoursSince >= 48;
  }
  res.json({ needsRefresh, fanart_fetched_at: item.fanart_fetched_at });
});

// POST /api/library/fetch-all-fanart - fetch fanart for all items
router.post('/fetch-all-fanart', async (req, res) => {
  const items = db.prepare('SELECT * FROM media_items WHERE status=?').all('active');
  let total = 0;
  const errors = [];

  for (const item of items) {
    try {
      const count = await fetchFanartForItem(item);
      total += count;
    } catch (e) {
      errors.push(`${item.title}: ${e.message}`);
    }
  }

  res.json({ total, errors });
});

// GET /api/library/:id/debug-anilist — temporary diagnostic endpoint
router.get('/:id/debug-anilist', async (req, res) => {
  const item = db.prepare('SELECT * FROM media_items WHERE id=?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });

  const result = { item: { id: item.id, title: item.title, type: item.type, tvdb_id: item.tvdb_id, tmdb_id: item.tmdb_id } };

  if (!item.tvdb_id) return res.json({ ...result, error: 'No tvdb_id — cannot look up remoteIds' });

  try {
    const { tvdbGet } = require('../services/fanartFetch').__test || {};
    // Use the internal tvdbGet via a small inline fetch to avoid re-exporting internals
    const settings = require('../services/settings');
    const fetch = require('node-fetch');

    // Get TVDB token
    const apiKey = settings.get('tvdb_api_key');
    if (!apiKey) return res.json({ ...result, error: 'No tvdb_api_key configured' });

    const loginRes = await fetch('https://api4.thetvdb.com/v4/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apikey: apiKey, pin: settings.get('tvdb_pin') || '' }),
    });
    if (!loginRes.ok) return res.json({ ...result, error: `TVDB login failed: ${loginRes.status}` });
    const { data: { token } } = await loginRes.json();

    const extRes = await fetch(`https://api4.thetvdb.com/v4/series/${item.tvdb_id}/extended`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!extRes.ok) return res.json({ ...result, error: `TVDB extended failed: ${extRes.status}` });
    const ext = await extRes.json();
    const remoteIds = ext.data?.remoteIds || [];
    result.remoteIds = remoteIds.map(r => ({ sourceName: r.sourceName, id: r.id }));

    const malRemote = remoteIds.find(r => r.sourceName === 'MyAnimeList');
    result.malId = malRemote ? String(malRemote.id) : null;

    if (malRemote) {
      const alRes = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          query: `query($idMal:Int){Media(idMal:$idMal,type:ANIME){id coverImage{extraLarge} bannerImage}}`,
          variables: { idMal: parseInt(malRemote.id) },
        }),
      });
      const alJson = await alRes.json();
      result.anilist = alJson.data?.Media || alJson;
    }
  } catch (e) {
    result.error = e.message;
  }

  res.json(result);
});

module.exports = router;
