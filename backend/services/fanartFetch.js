const fetch = require('node-fetch');
const db = require('../db/database');
const settings = require('./settings');

// ─── TVDB ────────────────────────────────────────────────────────────────────

let tvdbToken = null;
let tvdbTokenExpiry = 0;

async function getTvdbToken() {
  if (tvdbToken && Date.now() < tvdbTokenExpiry) return tvdbToken;
  const apiKey = settings.get('tvdb_api_key');
  const pin = settings.get('tvdb_pin') || '';
  if (!apiKey) throw new Error('TheTVDB API key not configured');
  const res = await fetch('https://api4.thetvdb.com/v4/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apikey: apiKey, pin }),
  });
  if (!res.ok) throw new Error(`TVDB login failed: ${res.status}`);
  const data = await res.json();
  tvdbToken = data.data?.token;
  tvdbTokenExpiry = Date.now() + 23 * 60 * 60 * 1000;
  return tvdbToken;
}

async function tvdbGet(path) {
  const token = await getTvdbToken();
  const res = await fetch(`https://api4.thetvdb.com/v4${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`TVDB ${path} failed: ${res.status}`);
  return res.json();
}

const TVDB_ART_TYPES = {
  1: 'banner', 2: 'poster', 3: 'background',
  22: 'background', 23: 'poster', 24: 'banner',
  25: 'icon', 26: 'clearart', 27: 'clearlogo',
};

async function fetchTvdbFanart(tvdbId, mediaItemId) {
  try {
    const data = await tvdbGet(`/series/${tvdbId}/artworks?includeLanguage=eng`);
    const artworks = data.data?.artworks || [];
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO fanart(media_item_id, source, source_id, type, url, thumbnail_url, width, height, language, likes)
      VALUES(?,?,?,?,?,?,?,?,?,?)
    `);
    let count = 0;
    for (const art of artworks) {
      const type = TVDB_ART_TYPES[art.type] || 'other';
      if (!art.image) continue;
      stmt.run(mediaItemId, 'tvdb', String(art.id), type,
        art.image, art.thumbnail || art.image,
        art.width || null, art.height || null,
        art.language || null, art.score || 0);
      count++;
    }
    return count;
  } catch (e) {
    console.error(`TVDB fanart error for ${tvdbId}:`, e.message);
    return 0;
  }
}

// ─── TMDB ────────────────────────────────────────────────────────────────────

async function tmdbGet(path) {
  const apiKey = settings.get('tmdb_api_key');
  if (!apiKey) throw new Error('TMDB API key not configured');
  const sep = path.includes('?') ? '&' : '?';
  const res = await fetch(`https://api.themoviedb.org/3${path}${sep}api_key=${apiKey}`);
  if (!res.ok) throw new Error(`TMDB ${path} failed: ${res.status}`);
  return res.json();
}

const TMDB_BASE = 'https://image.tmdb.org/t/p';

function insertTmdb(images, type, mediaItemId) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO fanart(media_item_id, source, source_id, type, url, thumbnail_url, width, height, language, likes)
    VALUES(?,?,?,?,?,?,?,?,?,?)
  `);
  for (const img of (images || [])) {
    stmt.run(mediaItemId, 'tmdb', img.file_path, type,
      `${TMDB_BASE}/original${img.file_path}`, `${TMDB_BASE}/w500${img.file_path}`,
      img.width || null, img.height || null, img.iso_639_1 || null, img.vote_count || 0);
  }
}

async function fetchTmdbFanartMovie(tmdbId, mediaItemId) {
  try {
    const data = await tmdbGet(`/movie/${tmdbId}/images`);
    insertTmdb(data.backdrops, 'background', mediaItemId);
    insertTmdb(data.posters,   'poster',     mediaItemId);
    insertTmdb(data.logos,     'clearlogo',  mediaItemId);
    return (data.backdrops?.length||0)+(data.posters?.length||0)+(data.logos?.length||0);
  } catch (e) {
    console.error(`TMDB movie fanart error for ${tmdbId}:`, e.message);
    return 0;
  }
}

async function fetchTmdbFanartShow(tmdbId, mediaItemId) {
  try {
    const data = await tmdbGet(`/tv/${tmdbId}/images`);
    insertTmdb(data.backdrops, 'background', mediaItemId);
    insertTmdb(data.posters,   'poster',     mediaItemId);
    insertTmdb(data.logos,     'clearlogo',  mediaItemId);
    return (data.backdrops?.length||0)+(data.posters?.length||0)+(data.logos?.length||0);
  } catch (e) {
    console.error(`TMDB show fanart error for ${tmdbId}:`, e.message);
    return 0;
  }
}

// ─── Fanart.tv ───────────────────────────────────────────────────────────────
// TV types:   showbackground→background, tvposter→poster, tvbanner→banner,
//             hdtvlogo/clearlogo→clearlogo, hdclearart/clearart→clearart,
//             tvthumb/seasonthumb→background, seasonposter→poster,
//             seasonbanner→banner, characterart→characterart
// Movie types: moviebackground→background, movieposter→poster, moviebanner→banner,
//              hdmovielogo/movielogo→clearlogo, hdmovieclearart/movieart→clearart,
//              moviethumb→background, moviedisc→disc

const FANARTV_TV_MAP = {
  showbackground: 'background', tvthumb: 'background', seasonthumb: 'background',
  tvposter: 'poster', seasonposter: 'poster',
  tvbanner: 'banner', seasonbanner: 'banner',
  hdtvlogo: 'clearlogo', clearlogo: 'clearlogo',
  hdclearart: 'clearart', clearart: 'clearart',
  characterart: 'characterart',
};

const FANARTV_MOVIE_MAP = {
  moviebackground: 'background', moviethumb: 'background',
  movieposter: 'poster',
  moviebanner: 'banner',
  hdmovielogo: 'clearlogo', movielogo: 'clearlogo',
  hdmovieclearart: 'clearart', movieart: 'clearart',
  moviedisc: 'disc',
};

async function fanartTvGet(path) {
  const apiKey = settings.get('fanart_api_key');
  if (!apiKey) throw new Error('Fanart.tv API key not configured');
  const sep = path.includes('?') ? '&' : '?';
  const res = await fetch(`https://webservice.fanart.tv/v3${path}${sep}api_key=${apiKey}`, {
    headers: { 'Accept': 'application/json' },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Fanart.tv ${path} failed: ${res.status}`);
  return res.json();
}

function insertFanartTv(images, type, mediaItemId, sourceKey) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO fanart(media_item_id, source, source_id, type, url, thumbnail_url, width, height, language, likes)
    VALUES(?,?,?,?,?,?,?,?,?,?)
  `);
  for (const img of (images || [])) {
    if (!img.url) continue;
    stmt.run(mediaItemId, 'fanart.tv', `${sourceKey}_${img.id}`, type,
      img.url, img.url, null, null, img.lang || null, parseInt(img.likes)||0);
  }
}

async function fetchFanartTvShow(tvdbId, mediaItemId) {
  try {
    const data = await fanartTvGet(`/tv/${tvdbId}`);
    if (!data) return 0;
    let count = 0;
    for (const [key, norm] of Object.entries(FANARTV_TV_MAP)) {
      if (data[key]?.length) { insertFanartTv(data[key], norm, mediaItemId, key); count += data[key].length; }
    }
    return count;
  } catch (e) {
    console.error(`Fanart.tv show error for tvdb ${tvdbId}:`, e.message);
    return 0;
  }
}

async function fetchFanartTvMovie(tmdbId, mediaItemId) {
  try {
    const data = await fanartTvGet(`/movies/${tmdbId}`);
    if (!data) return 0;
    let count = 0;
    for (const [key, norm] of Object.entries(FANARTV_MOVIE_MAP)) {
      if (data[key]?.length) { insertFanartTv(data[key], norm, mediaItemId, key); count += data[key].length; }
    }
    return count;
  } catch (e) {
    console.error(`Fanart.tv movie error for tmdb ${tmdbId}:`, e.message);
    return 0;
  }
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

async function fetchFanartForItem(item) {
  let total = 0;
  if (item.type === 'show' || item.type === 'anime') {
    if (item.tvdb_id) {
      total += await fetchTvdbFanart(item.tvdb_id, item.id);
      total += await fetchFanartTvShow(item.tvdb_id, item.id);
    }
    let tmdbId = item.tmdb_id;
    if (item.tvdb_id && !tmdbId) {
      try {
        const ext = await tvdbGet(`/series/${item.tvdb_id}/extended`);
        const remote = ext.data?.remoteIds?.find(r => r.sourceName === 'TheMovieDB.com');
        if (remote) {
          tmdbId = String(remote.id);
          db.prepare('UPDATE media_items SET tmdb_id=? WHERE id=?').run(tmdbId, item.id);
        }
      } catch {}
    }
    if (tmdbId) total += await fetchTmdbFanartShow(tmdbId, item.id);
  } else {
    if (item.tmdb_id) {
      total += await fetchTmdbFanartMovie(item.tmdb_id, item.id);
      total += await fetchFanartTvMovie(item.tmdb_id, item.id);
    }
  }
  return total;
}

module.exports = { fetchFanartForItem, fetchTvdbFanart, fetchTmdbFanartMovie, fetchTmdbFanartShow, fetchFanartTvShow, fetchFanartTvMovie };
