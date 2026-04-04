import { useEffect, useState, useRef } from 'react'
import { X, Star, Download, ChevronDown, Check } from 'lucide-react'
import { api } from '../api'

const PROVIDER_LABELS = { tvdb: 'TVDB', tmdb: 'TMDB', 'fanart.tv': 'Fanart.tv' }

const langNames = new Intl.DisplayNames(['en'], { type: 'language' })

function langLabel(code) {
  if (!code) return null
  try {
    const name = langNames.of(code)
    return name ? `Language: ${name} (${code.toUpperCase()})` : `Language: ${code.toUpperCase()}`
  } catch {
    return `Language: ${code.toUpperCase()}`
  }
}

function resLabel(width, height, type) {
  if (!width || !height) return null
  if (type === 'background' || type === 'banner') {
    if ((width === 3840 && height === 2160) || (width === 2160 && height === 3840)) return '4K'
    if ((width === 1920 && height === 1080) || (width === 1080 && height === 1920)) return 'FHD'
    if ((width === 1280 && height === 720)  || (width === 720  && height === 1280))  return 'HD'
  }
  return null
}

let dlCounter = 0

function normLang(code) {
  if (!code || code === '' || code === '00') return null
  try { return new Intl.Locale(code).language.toUpperCase() } catch { return code.slice(0, 2).toUpperCase() }
}

function getFilename(image, itemTitle) {
  const ext = image.url.split('?')[0].split('.').pop().toLowerCase() || 'jpg'
  const title = (itemTitle || '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '_') || 'unknown'
  const provider = image.source.replace(/[^a-zA-Z0-9]/g, '')
  const res = (image.width && image.height) ? `${image.width}x${image.height}` : null
  const lang = normLang(image.language)
  const counter = String(++dlCounter).padStart(3, '0')
  const segments = [image.type, provider, res, lang, counter].filter(Boolean)
  return `${title}-${segments.join('-')}.${ext}`
}

async function downloadImage(url, filename) {
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
    window.open(url, '_blank')
  }
}

export default function Lightbox({ image, isFavourite, onClose, onToggleFav, collections, activeCollectionId, onToggleCollection, itemTitle }) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [membership, setMembership] = useState(null)
  const [membershipLoading, setMembershipLoading] = useState(false)
  const pickerRef = useRef(null)

  const showPicker = collections?.length > 1

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') { if (pickerOpen) setPickerOpen(false); else onClose() } }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, pickerOpen])

  useEffect(() => {
    if (!pickerOpen) return
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickerOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [pickerOpen])

  const handleChevronClick = async () => {
    if (pickerOpen) { setPickerOpen(false); return }
    setPickerOpen(true)
    setMembershipLoading(true)
    try {
      const rows = await api.getFanartCollections(image.id)
      const map = {}
      for (const col of collections) map[col.id] = null
      for (const r of rows) map[r.collection_id] = r.id
      if (isFavourite && image.favourite_id) map[activeCollectionId] = image.favourite_id
      else if (!isFavourite) map[activeCollectionId] = null
      setMembership(map)
    } catch {}
    setMembershipLoading(false)
  }

  const handlePickerToggle = async (e, col) => {
    e.stopPropagation()
    const currentFavId = membership?.[col.id] || null
    setMembership(prev => ({ ...prev, [col.id]: currentFavId ? null : 'pending' }))
    const result = await onToggleCollection(image, col.id, currentFavId)
    setMembership(prev => ({
      ...prev,
      [col.id]: currentFavId ? null : (result?.id || 'temp'),
    }))
  }

  if (!image) return null

  const providerLabel = PROVIDER_LABELS[image.source] || image.source.toUpperCase()
  const res = resLabel(image.width, image.height, image.type)
  const filename = getFilename(image, itemTitle)

  return (
    <div className="lightbox" onClick={pickerOpen ? () => setPickerOpen(false) : onClose}>
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
        {showPicker ? (
          <div className="lightbox-picker" ref={pickerRef}>
            <button
              className={`btn ${isFavourite ? 'btn-primary' : 'btn-secondary'} lightbox-picker-star`}
              onClick={onToggleFav}
            >
              <Star size={14} fill={isFavourite ? '#fff' : 'none'} />
              {isFavourite ? 'Remove from collection' : 'Add to collection'}
            </button>
            <button
              className={`btn ${isFavourite ? 'btn-primary' : 'btn-secondary'} lightbox-picker-chevron`}
              onClick={handleChevronClick}
              title="Save to collections…"
            >
              <ChevronDown size={14} />
            </button>
            {pickerOpen && (
              <div className="collection-picker-dropdown lightbox-picker-dropdown" onClick={e => e.stopPropagation()}>
                {membershipLoading ? (
                  <div className="collection-picker-loading">Loading…</div>
                ) : collections.map(col => {
                  const inCol = !!membership?.[col.id]
                  return (
                    <button
                      key={col.id}
                      className={`collection-picker-item ${inCol ? 'in-collection' : ''}`}
                      onClick={(e) => handlePickerToggle(e, col)}
                    >
                      <span className="collection-picker-check">{inCol && <Check size={11} />}</span>
                      <span>{col.name}</span>
                      {col.id === activeCollectionId && <span className="collection-picker-badge">active</span>}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          <button
            className={`btn ${isFavourite ? 'btn-primary' : 'btn-secondary'}`}
            onClick={onToggleFav}
          >
            <Star size={14} fill={isFavourite ? '#fff' : 'none'} />
            {isFavourite ? 'Remove from collection' : 'Add to collection'}
          </button>
        )}

        <button
          className="btn btn-secondary"
          onClick={() => downloadImage(image.url, filename)}
          title="Download this image file"
        >
          <Download size={14} />
          Download Image
        </button>
      </div>

      {/* Mobile backdrop for collection picker */}
      {pickerOpen && <div className="collection-picker-backdrop" onClick={() => setPickerOpen(false)} />}

      {/* Top-left meta chips */}
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
        {image.language && image.language !== 'en' && image.language !== '' && image.language !== '00' && (
          <span className="fanart-meta-chip">{langLabel(image.language)}</span>
        )}
      </div>
    </div>
  )
}
