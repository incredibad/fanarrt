import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Star, Film, Tv, Search, X, Download, FolderOpen, MoreVertical, Pencil, Trash2, Check, ChevronDown, ExternalLink } from 'lucide-react'
import { api } from '../api'
import { toast } from '../hooks/useToast'
import Lightbox from '../components/Lightbox'
import { CollectionPicker, TYPE_ORDER } from '../components/FanartGrid'

const PROVIDER_LABELS = { tvdb: 'TVDB', tmdb: 'TMDB', 'fanart.tv': 'FTV' }

const RES_TIERS = [
  { id: 'hd',  label: 'HD',  w: 1280, h: 720 },
  { id: 'fhd', label: 'FHD', w: 1920, h: 1080 },
  { id: '4k',  label: '4K',  w: 3840, h: 2160 },
]

function tierMatch(width, height, tier) {
  return (width === tier.w && height === tier.h) || (width === tier.h && height === tier.w)
}

export default function FavouritesPage({ onFavCountChange, activeCollection, activeCollectionId, collections = [], onCollectionRename, onCollectionDelete }) {
  const navigate = useNavigate()

  const [allFavs, setAllFavs] = useState([])
  const [stats, setStats] = useState([])
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null)
  const [downloadingView, setDownloadingView] = useState(false)

  const [selectedId, setSelectedId] = useState(null)
  const [typeFilter, setTypeFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [artTypeFilter, setArtTypeFilter] = useState('all')
  const [artSourceFilter, setArtSourceFilter] = useState('all')
  const [resFilter, setResFilter] = useState('all')

  // ⋮ menu state
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  // Rename state
  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState('')
  const renameInputRef = useRef(null)
  // Delete confirmation
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  // Focus rename input when it appears
  useEffect(() => {
    if (renaming) {
      setRenameValue(activeCollection?.name ?? '')
      setTimeout(() => renameInputRef.current?.select(), 0)
    }
  }, [renaming])

  useEffect(() => {
    if (!activeCollectionId) return
    setLoading(true)
    setSelectedId(null)
    setResFilter('all')
    Promise.all([
      api.getFavouriteStats(activeCollectionId),
      api.getFavourites({ collection_id: activeCollectionId }),
      api.getSettings(),
    ])
      .then(([s, favs, loadedSettings]) => {
        setStats(s)
        setAllFavs(favs)
        setSettings(loadedSettings)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [activeCollectionId])

  const totalCount = stats.reduce((a, b) => a + b.count, 0)

  const filteredStats = useMemo(() => {
    return stats.filter(s => {
      if (typeFilter !== 'all' && s.type !== typeFilter) return false
      if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [stats, typeFilter, search])

  const displayedFavs = useMemo(() => {
    return allFavs.filter(f => {
      if (selectedId && f.media_item_id !== selectedId) return false
      if (typeFilter !== 'all' && f.media_type !== typeFilter) return false
      if (search && !f.media_title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [allFavs, selectedId, typeFilter, search])

  // Reset art-level filters when the base view changes
  useEffect(() => {
    setArtTypeFilter('all')
    setArtSourceFilter('all')
    setResFilter('all')
  }, [selectedId, typeFilter, search])

  const availableArtTypes = useMemo(() =>
    ['all', ...TYPE_ORDER.filter(t => displayedFavs.some(f => f.type === t))]
  , [displayedFavs])

  const enabledSources = useMemo(() => {
    const all = ['fanart.tv', 'tvdb', 'tmdb', 'anilist']
    return all.filter(src => {
      if (src === 'tvdb')      return !!settings.tvdb_api_key
      if (src === 'tmdb')      return !!settings.tmdb_api_key
      if (src === 'fanart.tv') return !!settings.fanart_api_key
      if (src === 'anilist')   return !!settings.anilist_enabled
      return true
    })
  }, [settings])

  const gridFavs = useMemo(() => {
    return displayedFavs.filter(f => {
      if (artTypeFilter !== 'all' && f.type !== artTypeFilter) return false
      if (artSourceFilter !== 'all' && f.source !== artSourceFilter) return false
      if (resFilter !== 'all') {
        const tier = RES_TIERS.find(t => t.id === resFilter)
        if (!tierMatch(f.width, f.height, tier)) return false
      }
      return true
    })
  }, [displayedFavs, artTypeFilter, artSourceFilter, resFilter])

  const handleRemove = async (fav) => {
    try {
      await api.removeFavourite(fav.id)
      setAllFavs(prev => prev.filter(f => f.id !== fav.id))
      setStats(prev => prev
        .map(s => s.id === fav.media_item_id ? { ...s, count: s.count - 1 } : s)
        .filter(s => s.count > 0)
      )
      if (lightbox?.id === fav.id) setLightbox(null)
      toast('Removed from collection', 'info')
      onFavCountChange?.(-1)
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  const handleToggleCollection = async (fav, collectionId, currentFavId) => {
    try {
      if (currentFavId) {
        await api.removeFavourite(currentFavId)
        onFavCountChange?.(-1, collectionId)
        if (collectionId === activeCollectionId) {
          setAllFavs(prev => prev.filter(f => f.id !== fav.id))
          setStats(prev =>
            prev.map(s => s.id === fav.media_item_id ? { ...s, count: s.count - 1 } : s)
                .filter(s => s.count > 0)
          )
          if (lightbox?.id === fav.id) setLightbox(null)
          toast('Removed from collection', 'info')
        }
        return null
      } else {
        const result = await api.addFavourite(fav.fanart_id, fav.media_item_id, collectionId)
        onFavCountChange?.(+1, collectionId)
        return result
      }
    } catch (e) {
      toast(e.message, 'error')
      return null
    }
  }

  const selectedItem = selectedId ? stats.find(s => s.id === selectedId) : null

  const handleRenameSubmit = async () => {
    const name = renameValue.trim()
    if (!name || name === activeCollection?.name) { setRenaming(false); return }
    setRenaming(false)
    await onCollectionRename(activeCollectionId, name)
  }

  const handleDeleteConfirm = async () => {
    setConfirmingDelete(false)
    await onCollectionDelete(activeCollectionId)
    navigate('/favourites')
  }

  const handleDownloadView = async () => {
    if (gridFavs.length === 0) return
    const label = selectedItem
      ? selectedItem.title
      : typeFilter !== 'all' ? (typeFilter === 'show' ? 'TV_Shows' : 'Movies') : (activeCollection?.name || 'Collection')
    setDownloadingView(true)
    try {
      const res = await api.downloadView(gridFavs.map(f => f.fanart_id), label)
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const href = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = href
      a.download = selectedItem
        ? `${selectedItem.title.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim().replace(/\s+/g, '_')}.zip`
        : 'favourites-download.zip'
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

  const collectionLabel = activeCollection?.name ?? 'Collection'

  return (
    <div className="scroll-area" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {loading ? (
        <div className="loading-overlay"><div className="spinner" />Loading…</div>
      ) : (
        <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>

          {/* ── Left panel: title list ─────────────────────────────────────── */}
          <div className="favs-sidebar">
            <div style={{ padding: '10px 10px 8px', borderBottom: '1px solid var(--border-soft)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                {renaming ? (
                  <input
                    ref={renameInputRef}
                    className="collection-rename-input"
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleRenameSubmit()
                      if (e.key === 'Escape') setRenaming(false)
                    }}
                    onBlur={handleRenameSubmit}
                    style={{ flex: 1, fontSize: 14 }}
                  />
                ) : (
                  <span style={{ flex: 1, fontWeight: 600, fontSize: 14, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {collectionLabel}
                  </span>
                )}
                <div className="dropdown" ref={menuRef}>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '4px 6px' }}
                    onClick={() => setMenuOpen(o => !o)}
                    title="Collection options"
                  >
                    <MoreVertical size={14} />
                  </button>
                  {menuOpen && (
                    <div className="dropdown-menu" style={{ minWidth: 150 }}>
                      <button
                        className="dropdown-item"
                        onClick={() => { setMenuOpen(false); setRenaming(true) }}
                      >
                        <Pencil size={13} />
                        Rename
                      </button>
                      <div className="dropdown-sep" />
                      <button
                        className="dropdown-item"
                        style={{ color: 'var(--red)' }}
                        onClick={() => { setMenuOpen(false); setConfirmingDelete(true) }}
                      >
                        <Trash2 size={13} />
                        Delete collection
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {stats.length > 0 && (
                <>
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
                </>
              )}
            </div>

            {stats.length > 0 && (
              <>
                <button
                  className={`nav-item ${!selectedId ? 'active' : ''}`}
                  style={{ margin: '4px 8px 2px', width: 'calc(100% - 16px)' }}
                  onClick={() => setSelectedId(null)}
                >
                  <Star size={13} />
                  <span style={{ flex: 1, textAlign: 'left', fontSize: 13 }}>All</span>
                  <span className="nav-badge">{filteredStats.reduce((a,b) => a+b.count, 0)}</span>
                </button>

                <div style={{ overflowY: 'auto', flex: 1 }}>
                  {filteredStats.length === 0 ? (
                    <div style={{ padding: '16px 12px', fontSize: 12, color: 'var(--text-3)', textAlign: 'center' }}>
                      No titles match
                    </div>
                  ) : filteredStats.map(s => (
                    <div
                      key={s.id}
                      className={`nav-item ${selectedId === s.id ? 'active' : ''}`}
                      style={{ margin: '1px 8px', width: 'calc(100% - 16px)', cursor: 'pointer' }}
                      onClick={() => setSelectedId(s.id === selectedId ? null : s.id)}
                    >
                      {s.type === 'show' ? <Tv size={13} style={{ flexShrink: 0 }} /> : <Film size={13} style={{ flexShrink: 0 }} />}
                      <span style={{ flex: 1, textAlign: 'left', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.title}
                      </span>
                      <span className="nav-badge">{s.count}</span>
                      <Link
                        to={`/item/${s.id}`}
                        state={{ from: s.type === 'movie' ? '/movies' : s.type === 'anime' ? '/anime' : '/shows' }}
                        onClick={e => e.stopPropagation()}
                        title={`Go to ${s.title}`}
                        style={{ flexShrink: 0, marginLeft: 4, color: 'var(--text-3)', display: 'flex', alignItems: 'center', padding: '2px 4px', borderRadius: 4 }}
                        className="favs-item-link"
                      >
                        <ExternalLink size={13} />
                      </Link>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ── Right panel: fanart grid ───────────────────────────────────── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {stats.length === 0 ? (
              <div className="empty-state">
                <FolderOpen size={48} />
                <h3>Nothing in {collectionLabel} yet</h3>
                <p>Browse your library and star any artwork to save it here.</p>
              </div>
            ) : (
              <>
                <div className="type-filter-bar">
                  <div className="type-filter-row" style={{ alignItems: 'center' }}>
                    <div className="type-filter-tabs">
                      {availableArtTypes.map(t => (
                        <button key={t} className={`filter-tab ${artTypeFilter === t ? 'active' : ''}`}
                          onClick={() => setArtTypeFilter(t)}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                          {t !== 'all' && (
                            <span style={{ marginLeft: 5, fontSize: 11, opacity: 0.6 }}>
                              {displayedFavs.filter(f => f.type === t).length}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="type-right-chips">
                      {enabledSources.length > 1 && (
                        <div className="type-provider-chips">
                          <button
                            className={`fanart-source-chip source-all ${artSourceFilter === 'all' ? 'source-active' : ''}`}
                            onClick={() => setArtSourceFilter('all')}
                            style={{ cursor: 'pointer', border: 'none', fontSize: 10 }}
                          >All</button>
                          {enabledSources.map(src => (
                            <button key={src}
                              className={`fanart-source-chip source-${src.replace('.', '-')} ${artSourceFilter === src ? 'source-active' : ''}`}
                              onClick={() => setArtSourceFilter(artSourceFilter === src ? 'all' : src)}
                              style={{ cursor: 'pointer', border: 'none', fontSize: 10 }}
                              title={`Show only ${PROVIDER_LABELS[src] || src}`}
                            >
                              {PROVIDER_LABELS[src] || src} {displayedFavs.filter(f => f.source === src).length}
                            </button>
                          ))}
                        </div>
                      )}

                      {enabledSources.length > 1 && (
                        <div className="filter-chip-divider" />
                      )}

                      {/* Resolution filter chips — always shown (static tiers) */}
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

                      {displayedFavs.length > 0 && (
                        <>
                          <div className="filter-chip-divider" />
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ flexShrink: 0 }}
                            onClick={handleDownloadView}
                            disabled={downloadingView}
                            title="Download everything currently visible"
                          >
                            <Download size={13} />
                            {downloadingView ? 'Zipping…' : 'Download View'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 24 }}>
                  {gridFavs.length === 0 ? (
                    <div className="empty-state">
                      <Star size={36} />
                      {displayedFavs.length > 0 ? (
                        <>
                          <h3>No results</h3>
                          <p>No artwork matches the current filters. Try selecting a broader filter or "All".</p>
                        </>
                      ) : (
                        <>
                          <h3>Nothing here</h3>
                          <p>Select a title from the list to view its artwork.</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <GroupedFavGrid
                      favs={gridFavs}
                      onRemove={handleRemove}
                      onOpen={setLightbox}
                      collections={collections}
                      activeCollectionId={activeCollectionId}
                      onToggleCollection={handleToggleCollection}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {lightbox && (
        <Lightbox
          image={{ ...lightbox, id: lightbox.fanart_id }}
          isFavourite={true}
          onClose={() => setLightbox(null)}
          onToggleFav={() => handleRemove(lightbox)}
          collections={collections}
          activeCollectionId={activeCollectionId}
          onToggleCollection={(art, collectionId, currentFavId) =>
            handleToggleCollection(lightbox, collectionId, currentFavId)
          }
          itemTitle={lightbox.media_title}
        />
      )}

      {/* Delete confirmation modal */}
      {confirmingDelete && (
        <div className="modal-overlay" onClick={() => setConfirmingDelete(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Delete collection?</h3>
            <p className="modal-body">
              Deleting <strong>{collectionLabel}</strong> will remove{' '}
              <strong>{activeCollection?.count ?? totalCount} item{(activeCollection?.count ?? totalCount) !== 1 ? 's' : ''}</strong>.
              This cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirmingDelete(false)}>Cancel</button>
              <button className="btn btn-danger btn-sm" onClick={handleDeleteConfirm}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


function resLabel(w, h, type) {
  if (!w || !h) return null
  if (type === 'background' || type === 'banner') {
    if ((w === 3840 && h === 2160) || (w === 2160 && h === 3840)) return '4K'
    if ((w === 1920 && h === 1080) || (w === 1080 && h === 1920)) return 'FHD'
    if ((w === 1280 && h === 720)  || (w === 720  && h === 1280))  return 'HD'
  }
  return `${w}×${h}`
}

function GroupedFavGrid({ favs, onRemove, onOpen, collections, activeCollectionId, onToggleCollection }) {
  const grouped = {}
  for (const fav of favs) {
    const t = fav.type || 'other'
    if (!grouped[t]) grouped[t] = []
    grouped[t].push(fav)
  }
  const types = TYPE_ORDER.filter(t => grouped[t]?.length)

  const isBannerType  = t => t === 'banner'
  const isWideType    = t => t === 'background'
  const isSquareType  = t => ['clearlogo', 'clearart', 'disc', 'icon', 'characterart'].includes(t)

  return (
    <>
      {types.map(type => (
        <div key={type}>
          <div className="fanart-section-title" style={{ padding: '16px 20px 8px' }}>
            {type.charAt(0).toUpperCase() + type.slice(1)}s
            <span>{grouped[type].length}</span>
          </div>
          <div className={`fanart-grid ${isBannerType(type) ? 'banner-grid' : isWideType(type) ? '' : isSquareType(type) ? 'square-grid' : 'portrait-grid'}`}
            style={{ padding: '0 20px 8px' }}>
            {grouped[type].map(fav => (
              <FavCard
                key={fav.id}
                fav={fav}
                onRemove={() => onRemove(fav)}
                onOpen={() => onOpen(fav)}
                collections={collections}
                activeCollectionId={activeCollectionId}
                onToggleCollection={onToggleCollection}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

function FavCard({ fav, onRemove, onOpen, collections, activeCollectionId, onToggleCollection }) {
  const [imgError, setImgError] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef(null)
  const showPicker = collections?.length > 1

  useEffect(() => {
    if (!pickerOpen) return
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickerOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [pickerOpen])
  const isBanner = fav.type === 'banner'
  const isWide   = fav.type === 'background'
  const isSquare = ['clearlogo', 'clearart', 'disc', 'icon', 'characterart'].includes(fav.type)
  const aspectRatio = isBanner ? '16/3' : isWide ? '16/9' : isSquare ? '1/1' : '2/3'

  const srcLabel = PROVIDER_LABELS[fav.source] || fav.source.toUpperCase()
  const res = resLabel(fav.width, fav.height, fav.type)

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
            objectFit: (isSquare || isBanner) ? 'contain' : 'cover',
            background: (isSquare || isBanner) ? 'var(--bg-4)' : undefined,
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
        {showPicker ? (
          <div className="fav-split" ref={pickerRef}>
            <button
              className="fanart-action-btn fav-chevron active"
              onClick={e => { e.stopPropagation(); setPickerOpen(o => !o) }}
              title="Save to collections…"
            >
              <ChevronDown size={11} />
            </button>
            <button
              className="fanart-action-btn fav-btn fav-split-star active"
              onClick={e => { e.stopPropagation(); onRemove() }}
              title="Remove from collection"
            >
              <Star size={13} fill="#fff" />
            </button>
            {pickerOpen && (
              <CollectionPicker
                artId={fav.fanart_id}
                collections={collections}
                activeCollectionId={activeCollectionId}
                activeFavId={fav.id}
                onToggle={(collectionId, currentFavId) => onToggleCollection(fav, collectionId, currentFavId)}
                onClose={() => setPickerOpen(false)}
              />
            )}
          </div>
        ) : (
          <button
            className="fanart-action-btn fav-btn active"
            onClick={e => { e.stopPropagation(); onRemove() }}
            title="Remove from collection"
          >
            <Star size={13} fill="#fff" />
          </button>
        )}
      </div>
    </div>
  )
}
