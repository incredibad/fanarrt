import { useState, useEffect, useRef } from 'react'
import { NavLink, useNavigate, useLocation, useMatch } from 'react-router-dom'
import { Film, Tv, Settings, RefreshCw, LayoutGrid, PanelLeftOpen, PanelLeftClose,
         FolderOpen, Plus, Check, X, Sparkles } from 'lucide-react'

export default function Sidebar({ onSync, syncing, counts = {}, collections = [],
  activeCollectionId, onCollectionChange, onCollectionCreate }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [inlineCreating, setInlineCreating] = useState(false)
  const [inlineName, setInlineName] = useState('')
  const inlineNameRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const onItemPage = useMatch('/item/:id')
  const activeFrom = onItemPage ? (location.state?.from || null) : null

  useEffect(() => {
    const close = () => setMobileOpen(false)
    window.addEventListener('popstate', close)
    return () => window.removeEventListener('popstate', close)
  }, [])

  useEffect(() => {
    if (inlineCreating) inlineNameRef.current?.focus()
  }, [inlineCreating])

  const fmt = (n) => n == null ? null : n >= 1000 ? `${(n/1000).toFixed(1)}k` : String(n)

  const navItem = (to, icon, label, count, end = false) => (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `nav-item ${(isActive || activeFrom === to) ? 'active' : ''}`}
      onClick={() => setMobileOpen(false)}
    >
      {icon}
      <span className="nav-label">{label}</span>
      {fmt(count) && <span className="nav-badge">{fmt(count)}</span>}
    </NavLink>
  )

  const handleCollectionClick = (id) => {
    onCollectionChange(id)
    navigate('/favourites')
    setMobileOpen(false)
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    const name = inlineName.trim()
    if (!name) return
    setInlineCreating(false)
    setInlineName('')
    await onCollectionCreate(name)
  }

  return (
    <>
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(o => !o)}
        title={mobileOpen ? 'Close menu' : 'Open menu'}
        aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
      >
        {mobileOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
      </button>

      {mobileOpen && <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />}

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-mark">
            <img src="/logo.svg" alt="Fanarrt" className="logo-img" />
            <div className="logo-title sidebar-logo-text">Fanarrt</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Library</div>
          {navItem('/', <LayoutGrid size={15} />, 'All Media', counts.all, true)}
          {navItem('/shows', <Tv size={15} />, 'TV Shows', counts.shows)}
          {navItem('/anime', <Sparkles size={15} />, 'Anime', counts.anime)}
          {navItem('/movies', <Film size={15} />, 'Movies', counts.movies)}

          <div className="nav-section-label" style={{ marginTop: 8 }}>Collections</div>

          {collections.map(col => (
            <button
              key={col.id}
              className={`nav-item ${col.id === activeCollectionId ? 'collection-active' : ''}`}
              onClick={() => handleCollectionClick(col.id)}
            >
              <FolderOpen size={15} />
              <span className="nav-label">{col.name}</span>
              {fmt(col.count) && <span className="nav-badge">{fmt(col.count)}</span>}
            </button>
          ))}

          {inlineCreating ? (
            <form
              className="collection-new-form"
              style={{ margin: '2px 8px 4px' }}
              onSubmit={handleCreateSubmit}
            >
              <input
                ref={inlineNameRef}
                className="collection-new-input"
                placeholder="Collection name…"
                value={inlineName}
                onChange={e => setInlineName(e.target.value)}
                onKeyDown={e => e.key === 'Escape' && (setInlineCreating(false), setInlineName(''))}
              />
              <button type="submit" className="collection-new-confirm" disabled={!inlineName.trim()}>
                <Check size={12} />
              </button>
              <button type="button" className="collection-new-cancel"
                onClick={() => { setInlineCreating(false); setInlineName('') }}>
                <X size={12} />
              </button>
            </form>
          ) : (
            <button
              className="nav-item"
              onClick={() => setInlineCreating(true)}
              style={{ color: 'var(--text-3)' }}
            >
              <Plus size={15} />
              <span className="nav-label">New collection…</span>
            </button>
          )}

        </nav>

        <div className="sidebar-footer">
          <div className="nav-section-label">System</div>
          <button className="nav-item" onClick={() => { onSync(); setMobileOpen(false) }} disabled={syncing}>
            <RefreshCw size={15} style={{ animation: syncing ? 'spin 0.7s linear infinite' : 'none', flexShrink: 0 }} />
            <span className="nav-label">{syncing ? 'Syncing…' : 'Sync Library'}</span>
          </button>
          {navItem('/settings', <Settings size={15} />, 'Settings', null)}
        </div>
      </aside>
    </>
  )
}
