const router = require('express').Router();
const settings = require('../services/settings');
const { testConnection } = require('../services/arrSync');

router.get('/', (req, res) => {
  const all = settings.getAll();
  // Mask API keys in response
  const safe = { ...all };
  for (const k of ['sonarr_api_key', 'radarr_api_key', 'tvdb_api_key', 'tmdb_api_key']) {
    if (safe[k]) safe[k] = safe[k].replace(/./g, '*').slice(0, -4) + safe[k].slice(-4);
  }
  res.json(safe);
});

router.post('/', (req, res) => {
  const allowed = [
    'sonarr_url', 'sonarr_api_key',
    'radarr_url', 'radarr_api_key',
    'tvdb_api_key', 'tvdb_pin',
    'tmdb_api_key',
    'fanart_api_key',
    'provider_order',
  ];
  for (const [k, v] of Object.entries(req.body)) {
    if (allowed.includes(k) && v !== undefined) {
      // Don't overwrite with masked value
      if (typeof v === 'string' && v.includes('*')) continue;
      settings.set(k, v);
    }
  }
  res.json({ ok: true });
});

router.post('/test/:service', async (req, res) => {
  const result = await testConnection(req.params.service);
  res.json(result);
});

module.exports = router;
