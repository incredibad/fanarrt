import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { Film, Tv, Star, Settings, RefreshCw, LayoutGrid, PanelLeftOpen, PanelLeftClose } from 'lucide-react'

export default function Sidebar({ onSync, syncing, counts = {} }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const close = () => setMobileOpen(false)
    window.addEventListener('popstate', close)
    return () => window.removeEventListener('popstate', close)
  }, [])

  const fmt = (n) => n == null ? null : n >= 1000 ? `${(n/1000).toFixed(1)}k` : String(n)

  const navItem = (to, icon, label, count, end = false) => (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      onClick={() => setMobileOpen(false)}
    >
      {icon}
      <span className="nav-label">{label}</span>
      {fmt(count) && <span className="nav-badge">{fmt(count)}</span>}
    </NavLink>
  )

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
              <img src="/logo.svg" alt="Fanarrt" width="28" height="28" style={{ display: 'block' }} />
            </div>
            <div className="sidebar-logo-text">
              <div className="logo-title">Fanarrt</div>
              <div className="logo-sub">v1.1</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Library</div>
          {navItem('/', <LayoutGrid size={15} />, 'All Media', counts.all, true)}
          {navItem('/shows', <Tv size={15} />, 'TV Shows', counts.shows)}
          {navItem('/movies', <Film size={15} />, 'Movies', counts.movies)}

          <div className="nav-section-label" style={{ marginTop: 8 }}>Manage</div>
          {navItem('/favourites', <Star size={15} />, 'Favourites', counts.favourites)}

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
