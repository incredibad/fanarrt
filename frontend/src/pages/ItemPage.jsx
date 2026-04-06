import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, ChevronDown, RefreshCw, Star, Film, Tv, Zap, AlertTriangle, Download } from 'lucide-react'
import { api } from '../api'
import FanartGrid, { TYPE_ORDER } from '../components/FanartGrid'
import DownloadMenu from '../components/DownloadMenu'
import { toast } from '../hooks/useToast'

const PROVIDER_LABELS = { tvdb: 'TVDB', tmdb: 'TMDB', 'fanart.tv': 'Fanart.tv', anilist: 'AniList' }

// Build external provider links shown in hero tags
function providerLinks(item, settings) {
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
  // AniList: only when enabled in settings and ID has been fetched
  if (item.anilist_id && settings.anilist_enabled !== false) links.push({
    label: 'AniList', source: 'anilist',
    url: `https://anilist.co/anime/${item.anilist_id}`,
    display: `AniList ${item.anilist_id}`,
  })
  return links
}

function sortTitle(title) {
  return title.replace(/^(the |a |an )/i, '').trimStart()
}

function typeFilterFromPath(path) {
  if (path === '/shows') return 'show'
  if (path === '/movies') return 'movie'
  if (path === '/anime') return 'anime'
  return undefined
}

const ART_TYPES = ['all', ...TYPE_ORDER]

const RES_TIERS = [
  { id: 'hd',  label: 'HD',  w: 1280, h: 720 },
  { id: 'fhd', label: 'FHD', w: 1920, h: 1080 },
  { id: '4k',  label: '4K',  w: 3840, h: 2160 },
]

function tierMatch(width, height, tier) {
  return (width === tier.w && height === tier.h) || (width === tier.h && height === tier.w)
}

export default function ItemPage({ onFavCountChange, activeCollectionId, collections = [] }) {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const backTo = location.state?.from || null
  const [item, setItem] = useState(null)
  const [siblings, setSiblings] = useState([])
  const [fanartData, setFanartData] = useState({ grouped: {}, total: 0, fanart: [] })
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [autoFetching, setAutoFetching] = useState(false)
  const [activeType, setActiveType] = useState('all')
  const [activeSource, setActiveSource] = useState('all') // provider filter
  const [resFilter, setResFilter] = useState('all')
  const [imgError, setImgError] = useState(false)
  const [favCount, setFavCount] = useState(0)
  const didAutoFetch = useRef(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Fetch sibling items for prev/next navigation — scoped to the library the user came from
  useEffect(() => {
    const params = { limit: 10000 }
    const typeFilter = typeFilterFromPath(backTo)
    if (typeFilter) params.type = typeFilter
    if (activeCollectionId) params.collection_id = activeCollectionId
    api.getLibrary(params)
      .then(data => {
        const sorted = data.items.slice().sort((a, b) =>
          sortTitle(a.title).localeCompare(sortTitle(b.title))
        )
        setSiblings(sorted)
      })
      .catch(() => {})
  }, [backTo, activeCollectionId])

  const loadFanart = useCallback(async () => {
    const fanart = await api.getItemFanart(id, { collection_id: activeCollectionId })
    setFanartData(fanart)
    setFavCount(fanart.fanart.filter(f => f.favourite_id).length)
    return fanart
  }, [id, activeCollectionId])

  const loadItem = useCallback(async () => {
    try {
      const [itemData, fanart, loadedSettings] = await Promise.all([
        api.getItem(id),
        api.getItemFanart(id, { collection_id: activeCollectionId }),
        api.getSettings(),
      ])
      setItem(itemData)
      setFanartData(fanart)
      setSettings(loadedSettings)
      setFavCount(fanart.fanart.filter(f => f.favourite_id).length)
      const defaults = loadedSettings[`default_filters_${itemData.type}`]
      if (defaults) {
        setActiveType(defaults.artType || 'all')
        setActiveSource(defaults.source || 'all')
        setResFilter(defaults.res || 'all')
      } else {
        setActiveType('all')
        setActiveSource('all')
        setResFilter('all')
      }
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [id, activeCollectionId])

  // Reset auto-fetch guard whenever the item changes
  useEffect(() => {
    didAutoFetch.current = false
  }, [id])

  // Auto-refresh: on first visit to an item, or after 48 hours
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
            }
            await loadFanart()
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
    const wasFav = !!art.favourite_id
    try {
      if (wasFav) {
        await api.removeFavourite(art.favourite_id)
        setFavCount(c => Math.max(0, c - 1))
        onFavCountChange?.(-1)
        setFanartData(prev => ({
          ...prev,
          fanart: prev.fanart.map(f => f.id === art.id ? { ...f, favourite_id: null } : f),
        }))
      } else {
        const result = await api.addFavourite(art.id, item?.id, activeCollectionId)
        setFavCount(c => c + 1)
        onFavCountChange?.(+1)
        setFanartData(prev => ({
          ...prev,
          fanart: prev.fanart.map(f => f.id === art.id ? { ...f, favourite_id: result?.id || 'temp' } : f),
        }))
      }
    } catch (e) {
      toast(e.message, 'error')
    }
  }, [item, activeCollectionId, onFavCountChange])

  // Toggle membership in any specific collection (used by the collection picker)
  const handleToggleCollection = useCallback(async (art, collectionId, currentFavId) => {
    try {
      if (currentFavId) {
        await api.removeFavourite(currentFavId)
        onFavCountChange?.(-1, collectionId)
        if (collectionId === activeCollectionId) {
          setFavCount(c => Math.max(0, c - 1))
          setFanartData(prev => ({
            ...prev,
            fanart: prev.fanart.map(f => f.id === art.id ? { ...f, favourite_id: null } : f),
          }))
        }
        return null
      } else {
        const result = await api.addFavourite(art.id, item?.id, collectionId)
        onFavCountChange?.(+1, collectionId)
        if (collectionId === activeCollectionId) {
          setFavCount(c => c + 1)
          setFanartData(prev => ({
            ...prev,
            fanart: prev.fanart.map(f => f.id === art.id ? { ...f, favourite_id: result?.id || 'temp' } : f),
          }))
        }
        return result
      }
    } catch (e) {
      toast(e.message, 'error')
      return null
    }
  }, [item, activeCollectionId, onFavCountChange])

  if (loading) return <div className="loading-overlay" style={{ flex: 1 }}><div className="spinner" />Loading…</div>
  if (!item) return <div className="empty-state" style={{ flex: 1 }}><h3>Item not found</h3></div>

  // Derive available types from current data
  const availableTypes = ART_TYPES

  // Sources enabled in settings (API key configured / toggle on)
  const ALL_SOURCES_BY_TYPE = {
    show:  ['fanart.tv', 'tvdb', 'tmdb'],
    movie: ['fanart.tv', 'tmdb'],
    anime: ['fanart.tv', 'tvdb', 'tmdb', 'anilist'],
  }
  const enabledSources = (ALL_SOURCES_BY_TYPE[item.type] || []).filter(src => {
    if (src === 'tvdb')      return !!settings.tvdb_api_key
    if (src === 'tmdb')      return !!settings.tmdb_api_key
    if (src === 'fanart.tv') return !!settings.fanart_api_key
    if (src === 'anilist')   return !!settings.anilist_enabled
    return true
  })

  // Apply source + resolution filter to grouped data
  const filteredGrouped = {}
  const baseGrouped = activeType === 'all'
    ? fanartData.grouped
    : { [activeType]: fanartData.grouped[activeType] || [] }

  for (const [type, arts] of Object.entries(baseGrouped)) {
    let filtered = activeSource === 'all' ? arts : arts.filter(a => a.source === activeSource)
    if (resFilter !== 'all') {
      const tier = RES_TIERS.find(t => t.id === resFilter)
      filtered = filtered.filter(a => tierMatch(a.width, a.height, tier))
    }
    if (filtered.length > 0) filteredGrouped[type] = filtered
  }

  const idLinks = providerLinks(item, settings)

  const currentSiblingIdx = siblings.findIndex(s => String(s.id) === String(id))
  const prevSibling = currentSiblingIdx > 0 ? siblings[currentSiblingIdx - 1] : null
  const nextSibling = currentSiblingIdx >= 0 && currentSiblingIdx < siblings.length - 1
    ? siblings[currentSiblingIdx + 1] : null

  function navigateSibling(sibling) {
    navigate(`/item/${sibling.id}`, { state: { from: backTo } })
  }

  const backdropArt = fanartData.grouped?.background?.[0]
  const backdropSrc = backdropArt
    ? (backdropArt.source === 'fanart.tv'
        ? `/api/proxy/poster?url=${encodeURIComponent(backdropArt.url)}`
        : backdropArt.url)
    : null

  return (
    <div className="scroll-area">
      {/* Hero */}
      <div className="item-hero">
        {siblings.length > 1 && (
          <div className="item-hero-nav">
            <button
              className="item-hero-nav-btn"
              onClick={() => prevSibling && navigateSibling(prevSibling)}
              disabled={!prevSibling}
              title={prevSibling ? prevSibling.title : undefined}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="item-hero-nav-btn"
              onClick={() => nextSibling && navigateSibling(nextSibling)}
              disabled={!nextSibling}
              title={nextSibling ? nextSibling.title : undefined}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
        {backdropSrc && (
          <div className="item-hero-backdrop" style={{ backgroundImage: `url(${backdropSrc})` }} aria-hidden="true" />
        )}
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
          <Link to={backTo || (item.type === 'anime' ? '/anime' : item.type === 'show' ? '/shows' : '/movies')} className="back-btn"
            style={{ marginBottom: 8, display: 'inline-flex' }}>
            <ArrowLeft size={12} />
            {backTo === '/' ? 'All Media'
              : backTo === '/shows' ? 'TV Shows'
              : backTo === '/anime' || (!backTo && item.type === 'anime') ? 'Anime'
              : backTo === '/movies' || (!backTo && item.type === 'movie') ? 'Movies'
              : !backTo && item.type === 'show' ? 'TV Shows'
              : 'All Media'}
          </Link>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
            <h1 className="item-hero-title">{item.title}</h1>
            {item.year && <span className="item-hero-year" style={{ marginTop: 0 }}>{item.year}</span>}
            <span className={`media-card-type-badge badge-${item.type}`} style={{ position: 'static', flexShrink: 0 }}>
              {item.type === 'show' ? 'TV Show' : item.type === 'anime' ? 'Anime' : 'Movie'}
            </span>
          </div>

          <div className="item-hero-tags">
            {idLinks.map(link => (
              <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                className={`tag tag-link ${link.source ? `tag-${link.source.replace('.', '-')}` : ''}`}
                title={`Open on ${link.label}`}>
                {link.display}
              </a>
            ))}
            {favCount > 0 && (
              <span className="tag tag-fav">
                <Star size={10} style={{ display:'inline', marginRight:3 }} />
                {favCount} in collection
              </span>
            )}
            {item.type_conflict && (
              <span className="source-conflict-icon"
                title="This item's type classification differs between instances — the most recently synced value is shown.">
                <AlertTriangle size={13} />
              </span>
            )}
          </div>

          <div className="item-hero-actions">
            <button className="btn btn-primary btn-sm item-refresh-btn" onClick={handleFetchFanart}
              disabled={fetching || autoFetching}>
              <RefreshCw size={13} style={{ animation: (fetching||autoFetching) ? 'spin 0.7s linear infinite' : 'none' }} />
              {fetching ? 'Fetching…' : autoFetching ? 'Auto-fetching…' : fanartData.total > 0 ? 'Refresh Fanart' : 'Fetch Fanart'}
            </button>
            {(fanartData.total > 0 || favCount > 0) && (
              <div className="item-download-row">
                {fanartData.total > 0 && (
                  <a className="btn btn-secondary btn-sm" href={api.downloadUrl.itemAll(item.id)} download>
                    <Download size={13} />
                    Download All
                  </a>
                )}
                {favCount > 0 && <DownloadMenu mediaItemId={item.id} />}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Type + provider + resolution filter bar */}
      {fanartData.total > 0 && (
        <div className="type-filter-bar">
          {/* Mobile accordion header */}
          <button className="fav-accordion-header" onClick={() => setFiltersOpen(o => !o)}>
            <span>Filters</span>
            <span className={`fav-accordion-chevron${filtersOpen ? ' open' : ''}`}><ChevronDown size={14} /></span>
          </button>

          {/* Filter content */}
          <div className={`fav-accordion-body filters-accordion-body${filtersOpen ? ' open' : ''}`}>
            {/* Row 1: Art type tabs */}
            <div className="type-filter-tabs">
              {availableTypes.map(t => (
                <button key={t} className={`filter-tab ${activeType === t ? 'active' : ''}`}
                  onClick={() => setActiveType(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                  {t !== 'all' && fanartData.grouped[t] && (
                    <span style={{ marginLeft:4, opacity:0.6 }}>
                      ({fanartData.grouped[t].length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Row 2: Provider + resolution filter chips */}
            <div className="type-right-chips">
              {enabledSources.length > 1 && (
                <div className="type-provider-chips">
                  <button
                    className={`fanart-source-chip source-all ${activeSource === 'all' ? 'source-active' : ''}`}
                    onClick={() => setActiveSource('all')}
                    style={{ cursor:'pointer', border:'none', fontSize:10 }}
                  >
                    All
                  </button>
                  {enabledSources.map(src => (
                    <button key={src}
                      className={`fanart-source-chip source-${src.replace('.', '-')} ${activeSource === src ? 'source-active' : ''}`}
                      onClick={() => setActiveSource(activeSource === src ? 'all' : src)}
                      style={{ cursor:'pointer', border:'none', fontSize:10 }}
                      title={`Show only ${PROVIDER_LABELS[src] || src}`}
                    >
                      {PROVIDER_LABELS[src] || src} ({fanartData.fanart?.filter(f => f.source === src).length})
                    </button>
                  ))}
                </div>
              )}

              {enabledSources.length > 1 && (
                <div className="filter-chip-divider" />
              )}

              <div className="type-res-chips">
                <button className={`res-chip ${resFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setResFilter('all')}>All</button>
                {RES_TIERS.map(tier => (
                  <button key={tier.id}
                    className={`res-chip ${resFilter === tier.id ? 'active' : ''}`}
                    onClick={() => setResFilter(resFilter === tier.id ? 'all' : tier.id)}
                    title={`${tier.w}×${tier.h} only`}
                  >{tier.label}</button>
                ))}
              </div>
            </div>
          </div>
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
        onToggleCollection={handleToggleCollection}
        activeType={activeType === 'all' ? null : activeType}
        collections={collections}
        activeCollectionId={activeCollectionId}
        itemTitle={item.title}
        hasContent={fanartData.total > 0}
      />

      {/* Mobile-only floating refresh FAB — portalled to body to escape overflow:hidden */}
      {createPortal(
        <button
          className="item-refresh-fab"
          onClick={handleFetchFanart}
          disabled={fetching || autoFetching}
          title={fetching || autoFetching ? 'Fetching…' : 'Refresh Fanart'}
          aria-label="Refresh Fanart"
        >
          <RefreshCw size={20} style={{ animation: (fetching || autoFetching) ? 'spin 0.7s linear infinite' : 'none' }} />
        </button>,
        document.body
      )}
    </div>
  )
}
