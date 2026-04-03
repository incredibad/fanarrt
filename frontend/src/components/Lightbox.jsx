import { useEffect } from 'react'
import { X, Star, Download } from 'lucide-react'

const PROVIDER_LABELS = { tvdb: 'TVDB', tmdb: 'TMDB', 'fanart.tv': 'Fanart.tv' }

function resLabel(width, height, type) {
  if (!width || !height) return null
  const isPortrait = type === 'poster'
  if (isPortrait) {
    if (height >= 2160) return '4K'
    return null  // just show raw pixels for posters
  }
  const long = Math.max(width, height)
  if (long >= 3840) return '4K'
  if (long >= 1920) return 'FHD'
  if (long >= 1280) return 'HD'
  return null
}

function getFilename(image) {
  // Derive a sensible filename from the URL
  try {
    const url = new URL(image.url)
    const parts = url.pathname.split('/')
    const last = parts[parts.length - 1]
    if (last && last.includes('.')) return last
  } catch {}
  const ext = image.url.split('?')[0].split('.').pop().toLowerCase() || 'jpg'
  return `${image.type}_${image.source}.${ext}`
}

async function downloadImage(url, filename) {
  // Route through our proxy so the fetch is same-origin and the blob download works.
  // The proxy handles all image types (fanart.tv AND direct URLs via redirect).
  const proxyUrl = `/api/proxy/poster?url=${encodeURIComponent(url)}`
  try {
    const res = await fetch(proxyUrl, { credentials: 'include' })
    if (!res.ok) throw new Error('fetch failed')
    const blob = await res.blob()
    const href = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = href
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(href), 1000)
  } catch {
    // Last resort: open in new tab
    window.open(url, '_blank')
  }
}

export default function Lightbox({ image, isFavourite, onClose, onToggleFav }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!image) return null

  const providerLabel = PROVIDER_LABELS[image.source] || image.source.toUpperCase()
  const res = resLabel(image.width, image.height, image.type)
  const filename = getFilename(image)

  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} title="Close (Esc)">
        <X size={18} />
      </button>

      <img
        className="lightbox-img"
        src={image.url}
        alt={image.type}
        onClick={e => e.stopPropagation()}
      />

      {/* Bottom action bar */}
      <div className="lightbox-actions" onClick={e => e.stopPropagation()}>
        <button
          className={`btn ${isFavourite ? 'btn-primary' : 'btn-secondary'}`}
          onClick={onToggleFav}
        >
          <Star size={14} fill={isFavourite ? '#fff' : 'none'} />
          {isFavourite ? 'Remove from collection' : 'Add to collection'}
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => downloadImage(image.url, filename)}
          title="Download this image file"
        >
          <Download size={14} />
          Download Image
        </button>
      </div>

      {/* Top-left meta chips — z-index above image */}
      <div style={{
        position: 'absolute', top: 20, left: 20,
        display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center',
        zIndex: 10,
        maxWidth: 'calc(100vw - 160px)',
      }}>
        <span className="fanart-meta-chip" style={{ textTransform: 'capitalize' }}>{image.type}</span>
        <span className={`fanart-source-chip source-${image.source.replace('.', '-')}`}>
          {providerLabel}
        </span>
        {res && <span className="fanart-res-chip">{res}</span>}
        {image.width && image.height
          ? <span className="fanart-meta-chip">{image.width}×{image.height}px</span>
          : null
        }
        {image.language && image.language !== 'en' && image.language !== '' && (
          <span className="fanart-meta-chip">{image.language}</span>
        )}
      </div>
    </div>
  )
}
