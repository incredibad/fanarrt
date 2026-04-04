const router = require('express').Router();
const db = require('../db/database');
const settings = require('../services/settings');
const { fetchFromArr, getSonarrInstances, getRadarrInstances } = require('../services/arrSync');

const maskKey = (k) => k ? k.replace(/./g, '*').slice(0, -4) + k.slice(-4) : '';

router.get('/', (req, res) => {
  const all = settings.getAll();
  const safe = { ...all };

  // Mask top-level legacy keys
  for (const k of ['sonarr_api_key', 'radarr_api_key', 'tvdb_api_key', 'tmdb_api_key', 'fanart_api_key']) {
    if (safe[k]) safe[k] = maskKey(safe[k]);
  }

  // sonarr_instances: migrate from legacy if not yet set
  if (!Array.isArray(safe.sonarr_instances) || !safe.sonarr_instances.length) {
    const url = settings.get('sonarr_url');
    const key = settings.get('sonarr_api_key');
    safe.sonarr_instances = url ? [{ id: '1', label: 'Sonarr', url, api_key: key ? maskKey(key) : '', type_mode: 'auto' }] : [];
  } else {
    safe.sonarr_instances = safe.sonarr_instances.map(inst => ({ ...inst, api_key: maskKey(inst.api_key || '') }));
  }

  // radarr_instances: migrate from legacy if not yet set
  if (!Array.isArray(safe.radarr_instances) || !safe.radarr_instances.length) {
    const url = settings.get('radarr_url');
    const key = settings.get('radarr_api_key');
    safe.radarr_instances = url ? [{ id: '1', label: 'Radarr', url, api_key: key ? maskKey(key) : '' }] : [];
  } else {
    safe.radarr_instances = safe.radarr_instances.map(inst => ({ ...inst, api_key: maskKey(inst.api_key || '') }));
  }

  res.json(safe);
});

router.post('/', (req, res) => {
  const allowed = [
    'sonarr_url', 'sonarr_api_key',
    'radarr_url', 'radarr_api_key',
    'tvdb_api_key', 'tvdb_pin',
    'tmdb_api_key', 'fanart_api_key',
    'provider_order', 'anilist_enabled', 'anilist_fuzzy_search',
    'sonarr_instances', 'radarr_instances',
  ];

  for (const [k, v] of Object.entries(req.body)) {
    if (!allowed.includes(k) || v === undefined) continue;

    if (k === 'sonarr_instances' || k === 'radarr_instances') {
      if (!Array.isArray(v)) continue;
      // Preserve stored (unmasked) api_key for instances where the client sent a masked/blank value
      const existing = settings.get(k) || [];
      const merged = v.map(inst => {
        if (!inst.api_key || inst.api_key.includes('*')) {
          const stored = existing.find(e => e.id === inst.id);
          return { ...inst, api_key: stored?.api_key || '' };
        }
        return inst;
      });
      settings.set(k, merged);
      continue;
    }

    if (typeof v === 'string' && v.includes('*')) continue;
    settings.set(k, v);
  }

  res.json({ ok: true });
});

// Test an arbitrary connection with explicit credentials
router.post('/test-connection', async (req, res) => {
  const { url, api_key } = req.body;
  if (!url || !api_key) return res.json({ ok: false, error: 'URL and API key are required' });
  try {
    const data = await fetchFromArr(url, api_key, '/system/status');
    res.json({ ok: true, version: data.version });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// Test a saved instance using its stored credentials
router.post('/test-instance/:arrType/:instanceId', async (req, res) => {
  const { arrType, instanceId } = req.params;
  const instances = arrType === 'sonarr' ? getSonarrInstances() : getRadarrInstances();
  const inst = instances.find(i => String(i.id) === instanceId);
  if (!inst) return res.json({ ok: false, error: 'Instance not found' });
  try {
    const data = await fetchFromArr(inst.url, inst.api_key, '/system/status');
    res.json({ ok: true, version: data.version });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// POST /api/settings/purge/favourites — wipe all favourites and collections, recreate default
router.post('/purge/favourites', (req, res) => {
  try {
    db.exec('DELETE FROM favourites; DELETE FROM collections;');
    db.prepare("INSERT INTO collections(name) VALUES('My Favourites')").run();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/settings/purge/library — wipe all media items, fanart, and sources (cascades to favourites)
router.post('/purge/library', (req, res) => {
  try {
    db.exec('DELETE FROM media_items;');
    const colCount = db.prepare('SELECT COUNT(*) as c FROM collections').get().c;
    if (colCount === 0) db.prepare("INSERT INTO collections(name) VALUES('My Favourites')").run();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Legacy single-service test (kept for backward compat)
router.post('/test/:service', async (req, res) => {
  const { testConnection } = require('../services/arrSync');
  const result = await testConnection(req.params.service);
  res.json(result);
});

module.exports = router;
