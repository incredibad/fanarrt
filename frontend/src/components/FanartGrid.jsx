import { useState, useRef, useCallback } from 'react'
import { Star } from 'lucide-react'
import MultiStarIcon from './MultiStarIcon'
import Lightbox from './Lightbox'

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
  if (type === 'poster') {
    if (height >= 2160) return '4K'
    return `${width}×${height}`
  }
  const long = Math.max(width, height)
  if (long >= 3840) return '4K'
  if (long >= 1920) return 'FHD'
  if (long >= 1280) return 'HD'
  return `${width}×${height}`
}

function FanartItem({ art, onToggleFav, onOpen }) {
  const [imgError, setImgError] = useState(false)
  const [liveDims, setLiveDims] = useState(
    (art.width && art.height) ? { w: art.width, h: art.height } : null
  )
  // isFav: in the active collection
  const [isFav, setIsFav] = useState(!!art.favourite_id)
  // otherCount: how many other collections this art is in (independent of active)
  const [otherCount, setOtherCount] = useState(art.other_collection_count || 0)

  const prevFavRef = useRef(!!art.favourite_id)
  if (!!art.favourite_id !== prevFavRef.current) {
    prevFavRef.current = !!art.favourite_id
    setIsFav(!!art.favourite_id)
  }

  const isBanner = art.type === 'banner'
  const isWide = art.type === 'background'
  const isSquare = ['clearlogo', 'clearart', 'disc', 'icon', 'characterart'].includes(art.type)
  const aspectRatio = isBanner ? '16/3' : isWide ? '16/9' : isSquare ? '1/1' : '2/3'

  const isMulti = isFav && otherCount > 0

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

  const handleImgLoad = useCallback((e) => {
    if (!art.width || !art.height) {
      const { naturalWidth: w, naturalHeight: h } = e.currentTarget
      if (w > 0 && h > 0) setLiveDims({ w, h })
    }
  }, [art.width, art.height])

  const srcLabel = PROVIDER_LABELS[art.source] || art.source.toUpperCase()
  const dims = liveDims || (art.width && art.height ? { w: art.width, h: art.height } : null)
  const res = dims ? resLabel(dims.w, dims.h, art.type) : null

  const favTitle = isFav
    ? (isMulti ? 'Remove from active collection (also in others)' : 'Remove from collection')
    : 'Add to collection'

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
        {res && <span className="fanart-res-chip">{res}</span>}
      </div>

      {isFav && (
        <div className="fanart-fav-indicator">
          {isMulti
            ? <MultiStarIcon size={11} fill="#fff" />
            : <Star size={11} fill="#fff" />}
        </div>
      )}

      <div className="fanart-overlay">
        <button
          className={`fanart-action-btn fav-btn ${isFav ? 'active' : ''}`}
          onClick={handleFavClick}
          title={favTitle}
        >
          {isMulti
            ? <MultiStarIcon size={13} fill="#fff" />
            : <Star size={13} fill={isFav ? '#fff' : 'none'} />}
        </button>
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

export default function FanartGrid({ grouped, onToggleFav, activeType }) {
  const [lightboxImg, setLightboxImg] = useState(null)
  const [lightboxFav, setLightboxFav] = useState(false)
  const [lightboxOtherCount, setLightboxOtherCount] = useState(0)

  const handleOpen = useCallback((art) => {
    setLightboxImg(art)
    setLightboxFav(!!art.favourite_id)
    setLightboxOtherCount(art.other_collection_count || 0)
  }, [])

  const handleLightboxFav = useCallback(() => {
    if (!lightboxImg) return
    const nowFav = !lightboxFav
    setLightboxFav(nowFav)
    onToggleFav({ ...lightboxImg, favourite_id: lightboxFav ? (lightboxImg.favourite_id || 'temp') : null })
  }, [lightboxImg, lightboxFav, onToggleFav])

  const types = activeType
    ? [activeType]
    : TYPE_ORDER.filter(t => grouped[t]?.length > 0)

  if (types.length === 0) {
    return (
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
                      onOpen={handleOpen}
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
          isMultiCollection={lightboxFav && lightboxOtherCount > 0}
          onClose={() => setLightboxImg(null)}
          onToggleFav={handleLightboxFav}
        />
      )}
    </>
  )
}
