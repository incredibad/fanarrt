import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Star, Film, Tv, Zap } from 'lucide-react'
import { api } from '../api'
import FanartGrid, { TYPE_ORDER } from '../components/FanartGrid'
import DownloadMenu from '../components/DownloadMenu'
import { toast } from '../hooks/useToast'

const PROVIDER_LABELS = { tvdb: 'TVDB', tmdb: 'TMDB', 'fanart.tv': 'Fanart.tv' }

// Build external provider links shown in hero tags
function providerLinks(item) {
  const links = []
  // TVDB: dereferrer URL uses numeric ID and works for both shows and movies
  if (item.tvdb_id) links.push({
    label: 'TVDB', source: 'tvdb',
    url: item.type === 'show'
      ? `https://www.thetvdb.com/dereferrer/series/${item.tvdb_id}`
      : `https://www.thetvdb.com/dereferrer/movie/${item.tvdb_id}`,
    display: `TVDB ${item.tvdb_id}`,
  })
  // TMDB: always include when tmdb_id is present
  if (item.tmdb_id) links.push({
    label: 'TMDB', source: 'tmdb',
    url: item.type === 'show'
      ? `https://www.themoviedb.org/tv/${item.tmdb_id}`
      : `https://www.themoviedb.org/movie/${item.tmdb_id}`,
    display: `TMDB ${item.tmdb_id}`,
  })
  // IMDb
  if (item.imdb_id) links.push({
    label: 'IMDb', source: null,
    url: `https://www.imdb.com/title/${item.imdb_id}`,
    display: `IMDb ${item.imdb_id}`,
  })
  // Fanart.tv
  if (item.tvdb_id && item.type === 'show') links.push({
    label: 'Fanart.tv', source: 'fanart.tv',
    url: `https://fanart.tv/series/${item.tvdb_id}/`,
    display: 'Fanart.tv',
  })
  if (item.tmdb_id && item.type === 'movie') links.push({
    label: 'Fanart.tv', source: 'fanart.tv',
    url: `https://fanart.tv/movie/${item.tmdb_id}/`,
    display: 'Fanart.tv',
  })
  return links
}

const ART_TYPES = ['all', ...TYPE_ORDER]

export default function ItemPage() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [fanartData, setFanartData] = useState({ grouped: {}, total: 0, fanart: [] })
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [autoFetching, setAutoFetching] = useState(false)
  const [activeType, setActiveType] = useState('all')
  const [activeSource, setActiveSource] = useState('all') // provider filter
  const [imgError, setImgError] = useState(false)
  const [favCount, setFavCount] = useState(0)
  const didAutoFetch = useRef(false)

  const loadFanart = useCallback(async () => {
    const fanart = await api.getItemFanart(id)
    setFanartData(fanart)
    return fanart
  }, [id])

  const loadItem = useCallback(async () => {
    try {
      const [itemData, fanart] = await Promise.all([api.getItem(id), api.getItemFanart(id)])
      setItem(itemData)
      setFanartData(fanart)
      setFavCount(itemData.favourite_count || 0)
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [id])

  // Auto-refresh: check if fanart needs fetching on first load
  useEffect(() => {
    loadItem().then(async () => {
      if (didAutoFetch.current) return
      didAutoFetch.current = true
      try {
        const { needsRefresh } = await api.needsRefresh(id)
        if (needsRefresh) {
          setAutoFetching(true)
          try {
            const res = await api.fetchItemFanart(id)
            if (res.fetched > 0) {
              toast(`Auto-fetched ${res.fetched} new artwork items`, 'info')
              await loadFanart()
            }
          } catch {}
          setAutoFetching(false)
        }
      } catch {}
    })
  }, [id, loadItem, loadFanart])

  const handleFetchFanart = async () => {
    setFetching(true)
    try {
      const res = await api.fetchItemFanart(id)
      toast(`Fetched ${res.fetched} new artwork items`, 'success')
      await loadFanart()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setFetching(false)
    }
  }

  const handleToggleFav = useCallback(async (art) => {
    // art.favourite_id being set means "was a fav before this click"
    const wasFav = !!art.favourite_id
    try {
      if (wasFav) {
        await api.removeFavourite(art.favourite_id)
        setFavCount(c => Math.max(0, c - 1))
      } else {
        const result = await api.addFavourite(art.id, item?.id)
        setFavCount(c => c + 1)
        // Persist the real favourite_id back into the fanart array
        setFanartData(prev => ({
          ...prev,
          fanart: prev.fanart.map(f => f.id === art.id ? { ...f, favourite_id: result?.id || 'temp' } : f),
        }))
      }
      if (wasFav) {
        // Clear favourite_id from fanart array
        setFanartData(prev => ({
          ...prev,
          fanart: prev.fanart.map(f => f.id === art.id ? { ...f, favourite_id: null } : f),
        }))
      }
    } catch (e) {
      toast(e.message, 'error')
    }
  }, [item])

  if (loading) return <div className="loading-overlay" style={{ flex: 1 }}><div className="spinner" />Loading…</div>
  if (!item) return <div className="empty-state" style={{ flex: 1 }}><h3>Item not found</h3></div>

  // Derive available types and sources from current data
  const allSources = [...new Set(fanartData.fanart?.map(f => f.source) || [])]
  const availableTypes = ART_TYPES.filter(t =>
    t === 'all' || fanartData.grouped[t]?.length > 0
  )

  // Apply source filter to grouped data
  const filteredGrouped = {}
  const baseGrouped = activeType === 'all'
    ? fanartData.grouped
    : { [activeType]: fanartData.grouped[activeType] || [] }

  for (const [type, arts] of Object.entries(baseGrouped)) {
    const filtered = activeSource === 'all' ? arts : arts.filter(a => a.source === activeSource)
    if (filtered.length > 0) filteredGrouped[type] = filtered
  }

  const idLinks = providerLinks(item)

  return (
    <div className="scroll-area">
      {/* Hero */}
      <div className="item-hero">
        <Link to={item.type === 'show' ? '/shows' : '/movies'} className="back-btn"
          style={{ marginBottom: 14, display: 'inline-flex' }}>
          <ArrowLeft size={13} />
          {item.type === 'show' ? 'TV Shows' : 'Movies'}
        </Link>

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <div className="item-hero-poster">
            {item.poster_path && !imgError ? (
              <img src={item.poster_path} alt={item.title} onError={() => setImgError(true)} />
            ) : (
              <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center',
                justifyContent:'center', background:'var(--bg-3)', color:'var(--text-3)' }}>
                {item.type === 'show' ? <Tv size={28} /> : <Film size={28} />}
              </div>
            )}
          </div>

          <div className="item-hero-info">
            <h1 className="item-hero-title">{item.title}</h1>
            <div className="item-hero-year">{item.year || 'Unknown year'}</div>
            {item.overview && <p className="item-hero-overview">{item.overview}</p>}

            <div className="item-hero-tags">
              <span className={`media-card-type-badge badge-${item.type}`} style={{ position: 'static' }}>
                {item.type === 'show' ? 'TV Show' : 'Movie'}
              </span>

              {/* Clickable provider ID tags */}
              {idLinks.map(link => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                  className={`tag tag-link ${link.source ? `tag-${link.source.replace('.', '-')}` : ''}`}
                  title={`Open on ${link.label}`}>
                  {link.display}
                </a>
              ))}

              <span className="tag">{fanartData.total} artwork</span>
              <span className="tag tag-fav">
                <Star size={10} style={{ display:'inline', marginRight:3 }} />
                {favCount} favourites
              </span>
            </div>

            <div className="item-hero-actions">
              <button className="btn btn-primary btn-sm" onClick={handleFetchFanart}
                disabled={fetching || autoFetching}>
                <RefreshCw size={13} style={{ animation: (fetching||autoFetching) ? 'spin 0.7s linear infinite' : 'none' }} />
                {fetching ? 'Fetching…' : autoFetching ? 'Auto-fetching…' : fanartData.total > 0 ? 'Refresh Fanart' : 'Fetch Fanart'}
              </button>

              {favCount > 0 && <DownloadMenu mediaItemId={item.id} />}
            </div>
          </div>
        </div>
      </div>

      {/* Type + provider filter bar */}
      {fanartData.total > 0 && (
        <div className="type-filter-bar">
          {/* Art type tabs */}
          <div style={{ display:'flex', gap:2, flexWrap:'wrap', flex:1 }}>
            {availableTypes.map(t => (
              <button key={t} className={`filter-tab ${activeType === t ? 'active' : ''}`}
                onClick={() => setActiveType(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
                {t !== 'all' && fanartData.grouped[t] && (
                  <span style={{ marginLeft:5, fontSize:11, opacity:0.6 }}>
                    {fanartData.grouped[t].length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Provider filter chips — clickable to filter */}
          {allSources.length > 1 && (
            <div style={{ display:'flex', gap:4, alignItems:'center', marginLeft:'auto', flexShrink:0 }}>
              <button
                className={`fanart-source-chip source-all ${activeSource === 'all' ? 'source-active' : ''}`}
                onClick={() => setActiveSource('all')}
                style={{ cursor:'pointer', border:'none', fontSize:10 }}
              >
                All
              </button>
              {allSources.map(src => (
                <button key={src}
                  className={`fanart-source-chip source-${src.replace('.', '-')} ${activeSource === src ? 'source-active' : ''}`}
                  onClick={() => setActiveSource(activeSource === src ? 'all' : src)}
                  style={{ cursor:'pointer', border:'none', fontSize:10 }}
                  title={`Show only ${PROVIDER_LABELS[src] || src}`}
                >
                  {PROVIDER_LABELS[src] || src} {fanartData.fanart?.filter(f => f.source === src).length}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Auto-fetch status banner */}
      {autoFetching && (
        <div style={{ padding:'8px 32px', background:'var(--bg-3)', borderBottom:'1px solid var(--border-soft)',
          display:'flex', alignItems:'center', gap:8, fontSize:13, color:'var(--text-3)' }}>
          <Zap size={13} style={{ color:'var(--accent-2)' }} />
          Automatically refreshing fanart (last fetch was over 48 hours ago)…
        </div>
      )}

      {/* Fanart grid */}
      <FanartGrid
        grouped={filteredGrouped}
        onToggleFav={handleToggleFav}
        activeType={activeType === 'all' ? null : activeType}
      />
    </div>
  )
}
