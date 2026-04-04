import { useState, useRef, useCallback, useEffect } from 'react'
import { Star, ChevronDown, Check } from 'lucide-react'
import Lightbox from './Lightbox'
import { api } from '../api'

export const TYPE_ORDER = ['background', 'poster', 'banner', 'clearlogo', 'clearart', 'disc', 'characterart', 'icon', 'other']

const PROVIDER_LABELS = { tvdb: 'TVDB', tmdb: 'TMDB', 'fanart.tv': 'FTV' }

function thumbUrl(art) {
  if (art.source === 'fanart.tv') {
    return `/api/proxy/thumb?url=${encodeURIComponent(art.url)}`
  }
  return art.thumbnail_url || art.url
}

function resLabel(width, height, type) {
  if (!width || !height) return null
  if (type === 'background' || type === 'banner') {
    if ((width === 3840 && height === 2160) || (width === 2160 && height === 3840)) return '4K'
    if ((width === 1920 && height === 1080) || (width === 1080 && height === 1920)) return 'FHD'
    if ((width === 1280 && height === 720)  || (width === 720  && height === 1280))  return 'HD'
  }
  return `${width}×${height}`
}

export function CollectionPicker({ artId, collections, activeCollectionId, activeFavId, onToggle, onClose }) {
  const [membership, setMembership] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getFanartCollections(artId).then(rows => {
      const map = {}
      for (const col of collections) map[col.id] = null
      for (const r of rows) map[r.collection_id] = r.id
      // Ensure active collection reflects live isFav state
      if (activeFavId) map[activeCollectionId] = activeFavId
      else map[activeCollectionId] = null
      setMembership(map)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [artId])

  const handleToggle = async (e, col) => {
    e.stopPropagation()
    const currentFavId = membership[col.id]
    // Optimistic update
    setMembership(prev => ({ ...prev, [col.id]: currentFavId ? null : 'pending' }))
    const result = await onToggle(col.id, currentFavId)
    setMembership(prev => ({
      ...prev,
      [col.id]: currentFavId ? null : (result?.id || 'temp'),
    }))
  }

  return (
    <div className="collection-picker-dropdown" onClick={e => e.stopPropagation()}>
      {loading ? (
        <div className="collection-picker-loading">Loading…</div>
      ) : collections.map(col => {
        const inCol = !!membership?.[col.id]
        return (
          <button
            key={col.id}
            className={`collection-picker-item ${inCol ? 'in-collection' : ''}`}
            onClick={(e) => handleToggle(e, col)}
          >
            <span className="collection-picker-check">{inCol && <Check size={11} />}</span>
            <span>{col.name}</span>
            {col.id === activeCollectionId && <span className="collection-picker-badge">active</span>}
          </button>
        )
      })}
    </div>
  )
}

function FanartItem({ art, onToggleFav, onToggleCollection, onOpen, collections, activeCollectionId }) {
  const [imgError, setImgError] = useState(false)
  const [liveDims, setLiveDims] = useState(
    (art.width && art.height) ? { w: art.width, h: art.height } : null
  )
  const [isFav, setIsFav] = useState(!!art.favourite_id)
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef(null)

  const prevFavRef = useRef(!!art.favourite_id)
  if (!!art.favourite_id !== prevFavRef.current) {
    prevFavRef.current = !!art.favourite_id
    setIsFav(!!art.favourite_id)
  }

  const showPicker = collections?.length > 1

  useEffect(() => {
    if (!pickerOpen) return
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickerOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [pickerOpen])

  const isBanner = art.type === 'banner'
  const isWide = art.type === 'background'
  const isSquare = ['clearlogo', 'clearart', 'disc', 'icon', 'characterart'].includes(art.type)
  const aspectRatio = isBanner ? '16/3' : isWide ? '16/9' : isSquare ? '1/1' : '2/3'

  const longPressTimer = useRef(null)
  const didLongPress = useRef(false)

  const startPress = useCallback(() => {
    didLongPress.current = false
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true
      handleFavClick()
    }, 600)
  }, [])

  const endPress = useCallback(() => clearTimeout(longPressTimer.current), [])

  const handleClick = useCallback(() => {
    if (!didLongPress.current) {
      const enriched = liveDims ? { ...art, width: liveDims.w, height: liveDims.h } : art
      onOpen(enriched)
    }
    didLongPress.current = false
  }, [art, liveDims, onOpen])

  const handleFavClick = useCallback((e) => {
    if (e) e.stopPropagation()
    const nowFav = !isFav
    setIsFav(nowFav)
    onToggleFav({ ...art, favourite_id: isFav ? (art.favourite_id || 'temp') : null })
  }, [art, isFav, onToggleFav])

  const handleChevronClick = useCallback((e) => {
    e.stopPropagation()
    setPickerOpen(o => !o)
  }, [])

  const handlePickerToggle = useCallback(async (collectionId, currentFavId) => {
    const result = await onToggleCollection(art, collectionId, currentFavId)
    if (collectionId === activeCollectionId) {
      setIsFav(!currentFavId)
    }
    return result
  }, [art, onToggleCollection, activeCollectionId])

  const handleImgLoad = useCallback((e) => {
    if (!art.width || !art.height) {
      const { naturalWidth: w, naturalHeight: h } = e.currentTarget
      if (w > 0 && h > 0) setLiveDims({ w, h })
    }
  }, [art.width, art.height])

  const srcLabel = PROVIDER_LABELS[art.source] || art.source.toUpperCase()
  const dims = liveDims || (art.width && art.height ? { w: art.width, h: art.height } : null)
  const res = dims ? resLabel(dims.w, dims.h, art.type) : null
  const langCode = (() => {
    const raw = art.language
    if (!raw || raw === '' || raw === '00') return null
    try { return new Intl.Locale(raw).language.toUpperCase() } catch { return raw.slice(0, 2).toUpperCase() }
  })()

  return (
    <div
      className={`fanart-item ${isWide ? '' : isSquare ? 'square-thumb' : 'portrait'} ${isFav ? 'is-favourite' : ''}`}
      onClick={handleClick}
      onTouchStart={startPress}
      onTouchEnd={endPress}
      onTouchMove={endPress}
      onMouseLeave={endPress}
    >
      {imgError ? (
        <div className="fanart-error-placeholder" style={{ aspectRatio }}>Image failed to load</div>
      ) : (
        <img
          src={thumbUrl(art)}
          alt={art.type}
          loading="lazy"
          onError={() => setImgError(true)}
          onLoad={handleImgLoad}
          style={{
            aspectRatio, width: '100%',
            objectFit: (isSquare || isBanner) ? 'contain' : 'cover',
            display: 'block',
            background: (isSquare || isBanner) ? 'var(--bg-4)' : undefined,
            padding: isSquare ? '8px' : undefined,
          }}
        />
      )}

      <div className="fanart-meta-strip">
        <span className={`fanart-source-chip source-${art.source.replace('.', '-')}`}>{srcLabel}</span>
        {langCode && <span className="fanart-lang-chip">{langCode}</span>}
        {res && <span className="fanart-res-chip fanart-res-right">{res}</span>}
      </div>

      {isFav && (
        <div className="fanart-fav-indicator">
          <Star size={11} fill="#fff" />
        </div>
      )}

      <div className="fanart-overlay">
        {showPicker ? (
          <div className="fav-split" ref={pickerRef}>
            <button
              className={`fanart-action-btn fav-chevron ${isFav ? 'active' : ''}`}
              onClick={handleChevronClick}
              title="Save to collections…"
            >
              <ChevronDown size={11} />
            </button>
            <button
              className={`fanart-action-btn fav-btn fav-split-star ${isFav ? 'active' : ''}`}
              onClick={handleFavClick}
              title={isFav ? 'Remove from collection' : 'Add to collection'}
            >
              <Star size={13} fill={isFav ? '#fff' : 'none'} />
            </button>
            {pickerOpen && (
              <CollectionPicker
                artId={art.id}
                collections={collections}
                activeCollectionId={activeCollectionId}
                activeFavId={art.favourite_id}
                onToggle={handlePickerToggle}
                onClose={() => setPickerOpen(false)}
              />
            )}
          </div>
        ) : (
          <button
            className={`fanart-action-btn fav-btn ${isFav ? 'active' : ''}`}
            onClick={handleFavClick}
            title={isFav ? 'Remove from collection' : 'Add to collection'}
          >
            <Star size={13} fill={isFav ? '#fff' : 'none'} />
          </button>
        )}
      </div>
    </div>
  )
}

function groupBySource(arts) {
  const map = {}
  for (const art of arts) {
    if (!map[art.source]) map[art.source] = []
    map[art.source].push(art)
  }
  return map
}

export default function FanartGrid({ grouped, onToggleFav, onToggleCollection, activeType, collections, activeCollectionId, itemTitle, hasContent = false }) {
  const [lightboxImg, setLightboxImg] = useState(null)
  const [lightboxFav, setLightboxFav] = useState(false)

  const handleOpen = useCallback((art) => {
    setLightboxImg(art)
    setLightboxFav(!!art.favourite_id)
  }, [])

  const handleLightboxFav = useCallback(() => {
    if (!lightboxImg) return
    const nowFav = !lightboxFav
    setLightboxFav(nowFav)
    onToggleFav({ ...lightboxImg, favourite_id: lightboxFav ? (lightboxImg.favourite_id || 'temp') : null })
  }, [lightboxImg, lightboxFav, onToggleFav])

  const handleLightboxToggleCollection = useCallback(async (art, collectionId, currentFavId) => {
    const result = await onToggleCollection?.(art, collectionId, currentFavId)
    if (collectionId === activeCollectionId) {
      setLightboxFav(!currentFavId)
      setLightboxImg(prev => prev ? { ...prev, favourite_id: currentFavId ? null : (result?.id || 'temp') } : prev)
    }
    return result
  }, [onToggleCollection, activeCollectionId])

  const types = activeType
    ? [activeType]
    : TYPE_ORDER.filter(t => grouped[t]?.length > 0)

  if (types.length === 0) {
    return hasContent ? (
      <div className="empty-state">
        <Star size={40} />
        <h3>No results</h3>
        <p>No artwork matches the current filters. Try selecting a broader filter or "All".</p>
      </div>
    ) : (
      <div className="empty-state">
        <Star size={40} />
        <h3>No fanart found</h3>
        <p>Click "Fetch Fanart" to load artwork from TheTVDB, TMDB, and Fanart.tv.</p>
      </div>
    )
  }

  const isBannerType = t => t === 'banner'
  const isWideType = t => t === 'background'
  const isSquareType = t => ['clearlogo', 'clearart', 'disc', 'icon', 'characterart'].includes(t)

  return (
    <>
      {types.map(type => {
        const arts = grouped[type]
        if (!arts?.length) return null
        const bySource = groupBySource(arts)
        const sources = Object.keys(bySource)

        return (
          <div key={type}>
            <div className="fanart-section-title">
              {type.charAt(0).toUpperCase() + type.slice(1)}s
              <span>{arts.length}</span>
            </div>

            {sources.map(src => (
              <div key={src}>
                {sources.length > 1 && (
                  <div style={{ padding: '4px 32px 6px', fontSize: 11, color: 'var(--text-3)',
                    fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className={`fanart-source-chip source-${src.replace('.', '-')}`} style={{ fontSize: 10 }}>
                      {PROVIDER_LABELS[src] || src}
                    </span>
                    <span style={{ opacity: 0.5 }}>{bySource[src].length} items</span>
                  </div>
                )}
                <div className={`fanart-grid ${isBannerType(type) ? 'banner-grid' : isWideType(type) ? '' : isSquareType(type) ? 'square-grid' : 'portrait-grid'}`}>
                  {bySource[src].map(art => (
                    <FanartItem
                      key={art.id}
                      art={art}
                      onToggleFav={onToggleFav}
                      onToggleCollection={onToggleCollection}
                      onOpen={handleOpen}
                      collections={collections}
                      activeCollectionId={activeCollectionId}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      })}

      {lightboxImg && (
        <Lightbox
          image={lightboxImg}
          isFavourite={lightboxFav}
          onClose={() => setLightboxImg(null)}
          onToggleFav={handleLightboxFav}
          collections={collections}
          activeCollectionId={activeCollectionId}
          onToggleCollection={handleLightboxToggleCollection}
          itemTitle={itemTitle}
        />
      )}
    </>
  )
}
