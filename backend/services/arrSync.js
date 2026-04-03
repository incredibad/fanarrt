const fetch = require('node-fetch');
const db = require('../db/database');
const settings = require('./settings');

// ── Instance helpers ───────────────────────────────────────────────────────────

function getSonarrInstances() {
  const instances = settings.get('sonarr_instances');
  if (Array.isArray(instances) && instances.length) return instances;
  // Legacy single-instance fallback
  const url = settings.get('sonarr_url');
  const key = settings.get('sonarr_api_key');
  if (!url || !key) return [];
  return [{ id: '1', label: 'Sonarr', url, api_key: key, type_mode: 'auto' }];
}

function getRadarrInstances() {
  const instances = settings.get('radarr_instances');
  if (Array.isArray(instances) && instances.length) return instances;
  const url = settings.get('radarr_url');
  const key = settings.get('radarr_api_key');
  if (!url || !key) return [];
  return [{ id: '1', label: 'Radarr', url, api_key: key }];
}

async function fetchFromArr(url, apiKey, path) {
  const res = await fetch(`${url.replace(/\/$/, '')}/api/v3${path}`, {
    headers: { 'X-Api-Key': apiKey },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Prepared statements ────────────────────────────────────────────────────────

const findByTvdbId = db.prepare('SELECT * FROM media_items WHERE tvdb_id = ?');
const findByTmdbId = db.prepare("SELECT * FROM media_items WHERE tmdb_id = ? AND type = 'movie'");

const insertMedia = db.prepare(`
  INSERT INTO media_items
    (type, title, year, tvdb_id, tmdb_id, imdb_id, sonarr_id, radarr_id, poster_path, overview, last_synced)
  VALUES
    (@type, @title, @year, @tvdb_id, @tmdb_id, @imdb_id, @sonarr_id, @radarr_id, @poster_path, @overview, CURRENT_TIMESTAMP)
`);

const updateMediaSonarr = db.prepare(`
  UPDATE media_items
  SET type=@type, title=@title, year=@year, sonarr_id=@sonarr_id,
      poster_path=@poster_path, overview=@overview, last_synced=CURRENT_TIMESTAMP
  WHERE id=@id
`);

const updateMediaRadarr = db.prepare(`
  UPDATE media_items
  SET title=@title, year=@year, radarr_id=@radarr_id,
      poster_path=@poster_path, overview=@overview, last_synced=CURRENT_TIMESTAMP
  WHERE id=@id
`);

const upsertSource = db.prepare(`
  INSERT INTO media_item_sources
    (media_item_id, arr_type, instance_id, instance_label, external_id, assigned_type)
  VALUES
    (@media_item_id, @arr_type, @instance_id, @instance_label, @external_id, @assigned_type)
  ON CONFLICT(arr_type, instance_id, external_id) DO UPDATE SET
    instance_label = excluded.instance_label,
    media_item_id  = excluded.media_item_id,
    assigned_type  = excluded.assigned_type
`);

// ── Sync ───────────────────────────────────────────────────────────────────────

async function syncSonarr() {
  const instances = getSonarrInstances();
  if (!instances.length) throw new Error('Sonarr not configured');
  let count = 0;
  for (const inst of instances) {
    const series = await fetchFromArr(inst.url, inst.api_key, '/series');
    for (const s of series) {
      if (!s.tvdbId) continue; // skip unmatched items

      const type = inst.type_mode === 'anime' ? 'anime'
                 : inst.type_mode === 'show'  ? 'show'
                 : s.seriesType === 'anime'    ? 'anime' : 'show';

      const posterPath = s.images?.find(i => i.coverType === 'poster')?.remoteUrl || null;
      const tvdbId     = String(s.tvdbId);
      const externalId = String(s.id);

      let item = findByTvdbId.get(tvdbId);
      if (item) {
        updateMediaSonarr.run({
          id: item.id, type,
          title: s.title, year: s.year || null,
          sonarr_id: externalId,
          poster_path: posterPath, overview: s.overview || null,
        });
      } else {
        const result = insertMedia.run({
          type, title: s.title, year: s.year || null,
          tvdb_id: tvdbId,
          tmdb_id: s.tmdbId ? String(s.tmdbId) : null,
          imdb_id: s.imdbId || null,
          sonarr_id: externalId, radarr_id: null,
          poster_path: posterPath, overview: s.overview || null,
        });
        item = { id: result.lastInsertRowid };
      }

      upsertSource.run({
        media_item_id: item.id, arr_type: 'sonarr',
        instance_id: String(inst.id), instance_label: inst.label,
        external_id: externalId, assigned_type: type,
      });
      count++;
    }
  }
  return count;
}

async function syncRadarr() {
  const instances = getRadarrInstances();
  if (!instances.length) throw new Error('Radarr not configured');
  let count = 0;
  for (const inst of instances) {
    const movies = await fetchFromArr(inst.url, inst.api_key, '/movie');
    for (const m of movies) {
      if (!m.tmdbId) continue; // skip unmatched items

      const posterPath = m.images?.find(i => i.coverType === 'poster')?.remoteUrl || null;
      const tmdbId     = String(m.tmdbId);
      const externalId = String(m.id);

      let item = findByTmdbId.get(tmdbId);
      if (item) {
        updateMediaRadarr.run({
          id: item.id, title: m.title, year: m.year || null,
          radarr_id: externalId,
          poster_path: posterPath, overview: m.overview || null,
        });
      } else {
        const result = insertMedia.run({
          type: 'movie', title: m.title, year: m.year || null,
          tvdb_id: null, tmdb_id: tmdbId,
          imdb_id: m.imdbId || null,
          sonarr_id: null, radarr_id: externalId,
          poster_path: posterPath, overview: m.overview || null,
        });
        item = { id: result.lastInsertRowid };
      }

      upsertSource.run({
        media_item_id: item.id, arr_type: 'radarr',
        instance_id: String(inst.id), instance_label: inst.label,
        external_id: externalId, assigned_type: 'movie',
      });
      count++;
    }
  }
  return count;
}

async function testConnection(type) {
  try {
    const instances = type === 'sonarr' ? getSonarrInstances() : getRadarrInstances();
    if (!instances.length) throw new Error(`${type} not configured`);
    const inst = instances[0];
    const data = await fetchFromArr(inst.url, inst.api_key, '/system/status');
    return { ok: true, version: data.version };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

module.exports = { syncSonarr, syncRadarr, testConnection, getSonarrInstances, getRadarrInstances, fetchFromArr };
