import { useState, useEffect, useRef } from 'react'
import { NavLink, useNavigate, useLocation, useMatch } from 'react-router-dom'
import { Film, Tv, Settings, RefreshCw, LayoutGrid, PanelLeftOpen, PanelLeftClose,
         FolderOpen, Plus, Check, X } from 'lucide-react'

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
            <div className="logo-icon" style={{ background: 'none', padding: 0, width: 34, height: 34 }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="28" height="28" style={{ display: 'block' }}>
                <polygon
                  points="20,2 24.4,13.9 37.1,14.4 27.1,22.3 30.6,34.6 20,27.5 9.4,34.6 12.9,22.3 2.9,14.4 15.6,13.9"
                  fill="#6366f1"
                />
              </svg>
            </div>
            <div className="sidebar-logo-text">
              <div className="logo-title">Fanarrt</div>
              <div className="logo-sub">v1.2</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Library</div>
          {navItem('/', <LayoutGrid size={15} />, 'All Media', counts.all, true)}
          {navItem('/shows', <Tv size={15} />, 'TV Shows', counts.shows)}
          {navItem('/movies', <Film size={15} />, 'Movies', counts.movies)}

          <div className="nav-section-label" style={{ marginTop: 8 }}>Collections</div>

          {collections.map(col => (
            <button
              key={col.id}
              className={`nav-item ${col.id === activeCollectionId ? 'active' : ''}`}
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

          <div className="nav-section-label" style={{ marginTop: 8 }}>System</div>
          <button className="nav-item" onClick={() => { onSync(); setMobileOpen(false) }} disabled={syncing}>
            <RefreshCw size={15} style={{ animation: syncing ? 'spin 0.7s linear infinite' : 'none', flexShrink: 0 }} />
            <span className="nav-label">{syncing ? 'Syncing…' : 'Sync Library'}</span>
          </button>
          {navItem('/settings', <Settings size={15} />, 'Settings', null)}
        </nav>
      </aside>
    </>
  )
}
