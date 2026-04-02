import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Star, Film, Tv, Search, X, Download } from 'lucide-react'
import { api } from '../api'
import { toast } from '../hooks/useToast'
import DownloadMenu from '../components/DownloadMenu'
import Lightbox from '../components/Lightbox'

const PROVIDER_LABELS = { tvdb: 'TVDB', tmdb: 'TMDB', 'fanart.tv': 'FTV' }

export default function FavouritesPage() {
  const [allFavs, setAllFavs] = useState([])       // all favourites flat
  const [stats, setStats] = useState([])            // [{id, title, type, count}]
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null)
  const [downloadingView, setDownloadingView] = useState(false)

  // Filters
  const [selectedId, setSelectedId] = useState(null)  // null = All
  const [typeFilter, setTypeFilter] = useState('all')  // 'all' | 'show' | 'movie'
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([api.getFavouriteStats(), api.getFavourites()])
      .then(([s, favs]) => {
        setStats(s)
        setAllFavs(favs)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const totalCount = stats.reduce((a, b) => a + b.count, 0)

  // Filtered stats list (left panel)
  const filteredStats = useMemo(() => {
    return stats.filter(s => {
      if (typeFilter !== 'all' && s.type !== typeFilter) return false
      if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [stats, typeFilter, search])

  // Displayed favourites (right panel)
  const displayedFavs = useMemo(() => {
    return allFavs.filter(f => {
      if (selectedId && f.media_item_id !== selectedId) return false
      if (typeFilter !== 'all' && f.media_type !== typeFilter) return false
      if (search && !f.media_title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [allFavs, selectedId, typeFilter, search])

  const handleRemove = async (fav) => {
    try {
      await api.removeFavourite(fav.fanart_id)
      setAllFavs(prev => prev.filter(f => f.fanart_id !== fav.fanart_id))
      setStats(prev => prev
        .map(s => s.id === fav.media_item_id ? { ...s, count: s.count - 1 } : s)
        .filter(s => s.count > 0)
      )
      if (lightbox?.fanart_id === fav.fanart_id) setLightbox(null)
      toast('Removed from favourites', 'info')
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  const selectedItem = selectedId ? stats.find(s => s.id === selectedId) : null

  const handleDownloadView = async () => {
    if (displayedFavs.length === 0) return
    const label = selectedItem
      ? selectedItem.title
      : typeFilter !== 'all' ? (typeFilter === 'show' ? 'TV_Shows' : 'Movies') : 'All_Favourites'
    setDownloadingView(true)
    try {
      const res = await api.downloadView(displayedFavs.map(f => f.fanart_id), label)
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const href = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = href
      a.download = `${label.replace(/\s+/g, '_')}_favourites.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(href), 1000)
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setDownloadingView(false)
    }
  }

  return (
    <div className="scroll-area" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Favourites</h1>
          <p className="page-subtitle">
            {totalCount} saved artwork items across {stats.length} titles
          </p>
        </div>
        <div className="page-actions">
          {totalCount > 0 && <DownloadMenu label="Download All" />}
        </div>
      </div>

      {loading ? (
        <div className="loading-overlay"><div className="spinner" />Loading…</div>
      ) : stats.length === 0 ? (
        <div className="empty-state">
          <Star size={48} />
          <h3>No favourites yet</h3>
          <p>Browse your library and click the star icon on any artwork to save it here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>

          {/* ── Left panel: title list ─────────────────────────────────────── */}
          <div className="favs-sidebar">
            {/* Search + type filter */}
            <div style={{ padding: '12px 10px 8px', borderBottom: '1px solid var(--border-soft)' }}>
              <div className="search-input-wrap" style={{ maxWidth: '100%', marginBottom: 8 }}>
                <Search size={13} />
                <input
                  className="search-input"
                  placeholder="Search titles…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ fontSize: 13 }}
                />
                {search && (
                  <button onClick={() => setSearch('')} style={{
                    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 2
                  }}><X size={12} /></button>
                )}
              </div>
              <div className="filter-tabs" style={{ padding: 2 }}>
                {['all', 'show', 'movie'].map(t => (
                  <button key={t} className={`filter-tab ${typeFilter === t ? 'active' : ''}`}
                    onClick={() => { setTypeFilter(t); setSelectedId(null) }}
                    style={{ flex: 1, fontSize: 12, padding: '5px 4px' }}
                  >
                    {t === 'all' ? 'All' : t === 'show' ? 'TV' : 'Movies'}
                  </button>
                ))}
              </div>
            </div>

            {/* "All" option */}
            <button
              className={`nav-item ${!selectedId ? 'active' : ''}`}
              style={{ margin: '4px 8px 2px', width: 'calc(100% - 16px)' }}
              onClick={() => setSelectedId(null)}
            >
              <Star size={13} />
              <span style={{ flex: 1, textAlign: 'left', fontSize: 13 }}>All Favourites</span>
              <span className="nav-badge">{filteredStats.reduce((a,b) => a+b.count, 0)}</span>
            </button>

            {/* Per-title entries */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {filteredStats.length === 0 ? (
                <div style={{ padding: '16px 12px', fontSize: 12, color: 'var(--text-3)', textAlign: 'center' }}>
                  No titles match
                </div>
              ) : filteredStats.map(s => (
                <button
                  key={s.id}
                  className={`nav-item ${selectedId === s.id ? 'active' : ''}`}
                  style={{ margin: '1px 8px', width: 'calc(100% - 16px)' }}
                  onClick={() => setSelectedId(s.id === selectedId ? null : s.id)}
                >
                  {s.type === 'show' ? <Tv size={13} style={{ flexShrink: 0 }} /> : <Film size={13} style={{ flexShrink: 0 }} />}
                  <span style={{ flex: 1, textAlign: 'left', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.title}
                  </span>
                  <span className="nav-badge">{s.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Right panel: fanart grid ───────────────────────────────────── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Toolbar */}
            <div style={{
              padding: '12px 20px', borderBottom: '1px solid var(--border-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0
            }}>
              <span style={{ fontSize: 13.5, color: 'var(--text-2)', fontWeight: 500 }}>
                {selectedItem ? selectedItem.title : typeFilter === 'all' ? 'All Favourites' : typeFilter === 'show' ? 'TV Shows' : 'Movies'}
                <span style={{ color: 'var(--text-3)', fontWeight: 400, marginLeft: 8 }}>
                  {displayedFavs.length} items
                </span>
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                {selectedId && (
                  <Link to={`/item/${selectedId}`} className="btn btn-ghost btn-sm">
                    View All Fanart
                  </Link>
                )}
                {displayedFavs.length > 0 && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleDownloadView}
                    disabled={downloadingView}
                    title="Download everything currently visible"
                  >
                    <Download size={13} />
                    {downloadingView ? 'Zipping…' : 'Download View'}
                  </button>
                )}
              </div>
            </div>

            {/* Grid */}
            <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 24 }}>
              {displayedFavs.length === 0 ? (
                <div className="empty-state">
                  <Star size={36} />
                  <h3>No favourites here</h3>
                  <p>Select a title or adjust your filters.</p>
                </div>
              ) : (
                <GroupedFavGrid favs={displayedFavs} onRemove={handleRemove} onOpen={setLightbox} />
              )}
            </div>
          </div>
        </div>
      )}

      {lightbox && (
        <Lightbox
          image={{ ...lightbox, url: lightbox.url }}
          isFavourite={true}
          onClose={() => setLightbox(null)}
          onToggleFav={() => handleRemove(lightbox)}
        />
      )}
    </div>
  )
}

// Same type order as item page
const TYPE_ORDER = ['background', 'poster', 'banner', 'clearlogo', 'clearart', 'disc', 'characterart', 'icon', 'other']

function resLabel(w, h, type) {
  if (!w || !h) return null
  if (type === 'poster') return `${w}×${h}`
  const long = Math.max(w, h)
  if (long >= 3840) return '4K'
  if (long >= 1920) return 'FHD'
  if (long >= 1280) return 'HD'
  return `${w}×${h}`
}

function GroupedFavGrid({ favs, onRemove, onOpen }) {
  // Group by type in TYPE_ORDER
  const grouped = {}
  for (const fav of favs) {
    const t = fav.type || 'other'
    if (!grouped[t]) grouped[t] = []
    grouped[t].push(fav)
  }
  const types = TYPE_ORDER.filter(t => grouped[t]?.length)

  const isWideType   = t => ['background', 'banner'].includes(t)
  const isSquareType = t => ['clearlogo', 'clearart', 'disc', 'icon', 'characterart'].includes(t)

  return (
    <>
      {types.map(type => (
        <div key={type}>
          <div className="fanart-section-title" style={{ padding: '16px 20px 8px' }}>
            {type.charAt(0).toUpperCase() + type.slice(1)}s
            <span>{grouped[type].length}</span>
          </div>
          <div className={`fanart-grid ${isWideType(type) ? '' : isSquareType(type) ? 'square-grid' : 'portrait-grid'}`}
            style={{ padding: '0 20px 8px' }}>
            {grouped[type].map(fav => (
              <FavCard
                key={fav.id}
                fav={fav}
                onRemove={() => onRemove(fav)}
                onOpen={() => onOpen(fav)}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

function FavCard({ fav, onRemove, onOpen }) {
  const [imgError, setImgError] = useState(false)
  const isWide   = ['background', 'banner'].includes(fav.type)
  const isSquare = ['clearlogo', 'clearart', 'disc', 'icon', 'characterart'].includes(fav.type)
  const aspectRatio = isWide ? '16/9' : isSquare ? '1/1' : '2/3'

  const srcLabel = PROVIDER_LABELS[fav.source] || fav.source.toUpperCase()
  const res = resLabel(fav.width, fav.height, fav.type)

  // For FTV images without stored dimensions, read from the loaded img
  const [liveDims, setLiveDims] = useState(null)
  const liveRes = liveDims ? resLabel(liveDims.w, liveDims.h, fav.type) : null
  const displayRes = res || liveRes

  const src = fav.source === 'fanart.tv'
    ? `/api/proxy/thumb?url=${encodeURIComponent(fav.url)}`
    : (fav.thumbnail_url || fav.url)

  return (
    <div className="fanart-item is-favourite" style={{ cursor: 'pointer' }} onClick={onOpen}>
      {imgError ? (
        <div className="fanart-error-placeholder" style={{ aspectRatio }}>Failed to load</div>
      ) : (
        <img
          src={src}
          alt={fav.type}
          loading="lazy"
          onError={() => setImgError(true)}
          onLoad={e => {
            if (!fav.width || !fav.height) {
              const { naturalWidth: w, naturalHeight: h } = e.currentTarget
              if (w > 0 && h > 0) setLiveDims({ w, h })
            }
          }}
          style={{
            aspectRatio, width: '100%', display: 'block',
            objectFit: isSquare ? 'contain' : 'cover',
            background: isSquare ? 'var(--bg-4)' : undefined,
            padding: isSquare ? '8px' : undefined,
          }}
        />
      )}

      <div className="fanart-meta-strip">
        <span className={`fanart-source-chip source-${fav.source.replace('.', '-')}`}>{srcLabel}</span>
        {displayRes && <span className="fanart-res-chip">{displayRes}</span>}
      </div>

      <div className="fanart-fav-indicator"><Star size={11} fill="#fff" /></div>

      <div className="fanart-overlay">
        <button
          className="fanart-action-btn fav-btn active"
          onClick={e => { e.stopPropagation(); onRemove() }}
          title="Remove from favourites"
        >
          <Star size={13} fill="#fff" />
        </button>
      </div>
    </div>
  )
}
