import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Tv, Film, Star, X } from 'lucide-react'
import { api } from '../api'

const scrollCache = {}

function firstLetter(title) {
  const c = title.replace(/^(the |a |an )/i, '').charAt(0).toUpperCase()
  return /[A-Z]/.test(c) ? c : '#'
}

export default function LibraryPage({ typeFilter }) {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const scrollAreaRef = useRef(null)
  const location = useLocation()
  const cacheKey = location.pathname

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 280)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setLoading(true)
    const params = { limit: 10000 }
    if (typeFilter) params.type = typeFilter
    if (debouncedSearch) params.search = debouncedSearch
    api.getLibrary(params)
      .then(data => { setItems(data.items); setTotal(data.total) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [typeFilter, debouncedSearch])

  // Restore scroll after load
  useEffect(() => {
    if (loading) return
    const saved = scrollCache[cacheKey]
    if (saved != null) {
      requestAnimationFrame(() => {
        if (scrollAreaRef.current) scrollAreaRef.current.scrollTop = saved
      })
    }
  }, [loading, cacheKey])

  // Save scroll on unmount
  useEffect(() => {
    return () => {
      if (scrollAreaRef.current) scrollCache[cacheKey] = scrollAreaRef.current.scrollTop
    }
  }, [cacheKey])

  function jumpToLetter(letter) {
    const container = scrollAreaRef.current
    if (!container) return
    // Use attribute selector WITHOUT CSS.escape — attribute value selectors
    // treat # as a literal character, not a special character
    // Build the selector by hand to avoid CSS.escape mangling '#'
    let target = null
    const allCards = container.querySelectorAll('[data-letter]')
    for (const el of allCards) {
      if (el.getAttribute('data-letter') === letter) { target = el; break }
    }
    if (!target) return
    // Scroll target into view within the container
    // target.offsetTop is relative to its offsetParent (likely the media-grid div)
    // We need target's top relative to container
    const containerRect = container.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    // delta = how far the target is from the top of the visible container area
    const delta = targetRect.top - containerRect.top
    container.scrollTop += delta - 16
  }

  // Keyboard handler — re-bound every render so closure is fresh
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const letter = e.key.length === 1 ? e.key.toUpperCase() : ''
      if (!letter || (!/[A-Z0-9#]/.test(letter))) return
      jumpToLetter(letter)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const pageTitle = typeFilter === 'show' ? 'TV Shows'
    : typeFilter === 'movie' ? 'Movies' : 'All Media'

  const letters = useMemo(() =>
    [...new Set(items.map(i => firstLetter(i.title)))].sort()
  , [items])

  const seen = new Set()

  return (
    <div className="scroll-area" ref={scrollAreaRef}>
      <div className="page-header">
        <div>
          <h1 className="page-title">{pageTitle}</h1>
          <p className="page-subtitle">{total} titles in your library</p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={14} />
          <input
            className="search-input"
            placeholder="Search titles…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', color: 'var(--text-3)',
              cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center',
            }}><X size={13} /></button>
          )}
        </div>

        {!debouncedSearch && letters.length > 3 && (
          <div className="letter-nav">
            {letters.map(l => (
              <button key={l} className="letter-nav-btn" onClick={() => jumpToLetter(l)}>
                {l}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-overlay"><div className="spinner" />Loading library…</div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <Film size={48} />
          <h3>No media found</h3>
          <p>{debouncedSearch
            ? 'No results match your search.'
            : 'Use "Sync Library" to import titles from Sonarr and Radarr.'}</p>
        </div>
      ) : (
        <div className="media-grid">
          {items.map(item => {
            const letter = firstLetter(item.title)
            const isFirst = !seen.has(letter)
            if (isFirst) seen.add(letter)
            return (
              <MediaCard
                key={item.id}
                item={item}
                dataLetter={isFirst ? letter : undefined}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

function MediaCard({ item, dataLetter }) {
  const [imgError, setImgError] = useState(false)
  const posterSrc = item.poster_path
    ? `/api/proxy/poster?url=${encodeURIComponent(item.poster_path)}`
    : null
  return (
    <Link
      to={`/item/${item.id}`}
      className="media-card"
      {...(dataLetter ? { 'data-letter': dataLetter } : {})}
    >
      <div className="media-card-poster">
        {posterSrc && !imgError ? (
          <img src={posterSrc} alt={item.title} loading="lazy" onError={() => setImgError(true)} />
        ) : (
          <div className="media-card-poster-placeholder">
            {item.type === 'show' ? <Tv size={28} /> : <Film size={28} />}
            <span style={{ fontSize: 10, color: 'var(--text-3)' }}>No poster</span>
          </div>
        )}
        <span className={`media-card-type-badge badge-${item.type}`}>
          {item.type === 'show' ? 'TV' : 'Movie'}
        </span>
        {item.favourite_count > 0 && (
          <span className="fav-count-badge"><Star size={9} fill="#fff" />{item.favourite_count}</span>
        )}
      </div>
      <div className="media-card-info">
        <div className="media-card-title">{item.title}</div>
        <div className="media-card-meta">{item.year || '—'}{item.fanart_count > 0 && ` · ${item.fanart_count} art`}</div>
      </div>
    </Link>
  )
}
