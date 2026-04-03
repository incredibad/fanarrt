const fetch = require('node-fetch');
const db = require('../db/database');
const settings = require('./settings');

async function fetchSonarr(path) {
  const url = settings.get('sonarr_url');
  const key = settings.get('sonarr_api_key');
  if (!url || !key) throw new Error('Sonarr not configured');
  const res = await fetch(`${url.replace(/\/$/, '')}/api/v3${path}`, {
    headers: { 'X-Api-Key': key },
  });
  if (!res.ok) throw new Error(`Sonarr error: ${res.status}`);
  return res.json();
}

async function fetchRadarr(path) {
  const url = settings.get('radarr_url');
  const key = settings.get('radarr_api_key');
  if (!url || !key) throw new Error('Radarr not configured');
  const res = await fetch(`${url.replace(/\/$/, '')}/api/v3${path}`, {
    headers: { 'X-Api-Key': key },
  });
  if (!res.ok) throw new Error(`Radarr error: ${res.status}`);
  return res.json();
}

const upsertMedia = db.prepare(`
  INSERT INTO media_items (type, title, year, tvdb_id, tmdb_id, imdb_id, sonarr_id, radarr_id, poster_path, overview, last_synced)
  VALUES (@type, @title, @year, @tvdb_id, @tmdb_id, @imdb_id, @sonarr_id, @radarr_id, @poster_path, @overview, CURRENT_TIMESTAMP)
  ON CONFLICT(type, sonarr_id) DO UPDATE SET
    title=excluded.title, year=excluded.year, tvdb_id=excluded.tvdb_id,
    tmdb_id=excluded.tmdb_id, imdb_id=excluded.imdb_id, poster_path=excluded.poster_path,
    overview=excluded.overview, last_synced=CURRENT_TIMESTAMP
  RETURNING id
`);

// Reclassify a sonarr item if its type has changed (e.g. show -> anime)
const reclassifySonarrItem = db.prepare(`
  UPDATE media_items SET type=? WHERE sonarr_id=? AND type!=?
`);

const upsertMediaRadarr = db.prepare(`
  INSERT INTO media_items (type, title, year, tvdb_id, tmdb_id, imdb_id, sonarr_id, radarr_id, poster_path, overview, last_synced)
  VALUES (@type, @title, @year, @tvdb_id, @tmdb_id, @imdb_id, @sonarr_id, @radarr_id, @poster_path, @overview, CURRENT_TIMESTAMP)
  ON CONFLICT(type, radarr_id) DO UPDATE SET
    title=excluded.title, year=excluded.year, tvdb_id=excluded.tvdb_id,
    tmdb_id=excluded.tmdb_id, imdb_id=excluded.imdb_id, poster_path=excluded.poster_path,
    overview=excluded.overview, last_synced=CURRENT_TIMESTAMP
  RETURNING id
`);

async function syncSonarr() {
  const series = await fetchSonarr('/series');
  let count = 0;
  for (const s of series) {
    const type = s.seriesType === 'anime' ? 'anime' : 'show';
    const posterPath = s.images?.find(i => i.coverType === 'poster')?.remoteUrl || null;
    reclassifySonarrItem.run(type, String(s.id), type);
    upsertMedia.run({
      type,
      title: s.title,
      year: s.year || null,
      tvdb_id: s.tvdbId ? String(s.tvdbId) : null,
      tmdb_id: s.tmdbId ? String(s.tmdbId) : null,
      imdb_id: s.imdbId || null,
      sonarr_id: String(s.id),
      radarr_id: null,
      poster_path: posterPath,
      overview: s.overview || null,
    });
    count++;
  }
  return count;
}

async function syncRadarr() {
  const movies = await fetchRadarr('/movie');
  let count = 0;
  for (const m of movies) {
    const posterPath = m.images?.find(i => i.coverType === 'poster')?.remoteUrl || null;
    upsertMediaRadarr.run({
      type: 'movie',
      title: m.title,
      year: m.year || null,
      tvdb_id: null,
      tmdb_id: m.tmdbId ? String(m.tmdbId) : null,
      imdb_id: m.imdbId || null,
      sonarr_id: null,
      radarr_id: String(m.id),
      poster_path: posterPath,
      overview: m.overview || null,
    });
    count++;
  }
  return count;
}

async function testConnection(type) {
  try {
    if (type === 'sonarr') {
      const data = await fetchSonarr('/system/status');
      return { ok: true, version: data.version };
    } else {
      const data = await fetchRadarr('/system/status');
      return { ok: true, version: data.version };
    }
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

module.exports = { syncSonarr, syncRadarr, testConnection };
