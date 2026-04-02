import { useState, useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { Film, Tv, Settings, RefreshCw, LayoutGrid, PanelLeftOpen, PanelLeftClose,
         FolderOpen, ChevronDown, Plus, Trash2, Check, X } from 'lucide-react'

export default function Sidebar({ onSync, syncing, counts = {}, collections = [],
  activeCollectionId, onCollectionChange, onCollectionCreate, onCollectionDelete }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [creatingNew, setCreatingNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null) // { id, name, count }
  const [inlineCreating, setInlineCreating] = useState(false)
  const [inlineName, setInlineName] = useState('')
  const dropdownRef = useRef(null)
  const newNameRef = useRef(null)
  const inlineNameRef = useRef(null)

  useEffect(() => {
    const close = () => setMobileOpen(false)
    window.addEventListener('popstate', close)
    return () => window.removeEventListener('popstate', close)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
        setCreatingNew(false)
        setNewName('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropdownOpen])

  // Focus inputs when creating
  useEffect(() => {
    if (creatingNew) newNameRef.current?.focus()
  }, [creatingNew])
  useEffect(() => {
    if (inlineCreating) inlineNameRef.current?.focus()
  }, [inlineCreating])

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

  const activeCollection = collections.find(c => c.id === activeCollectionId)

  const handleSelectCollection = (id) => {
    onCollectionChange(id)
    setDropdownOpen(false)
    setCreatingNew(false)
    setNewName('')
    setMobileOpen(false)
  }

  const handleCreateSubmit = async (e) => {
    e?.preventDefault()
    const name = newName.trim()
    if (!name) return
    setDropdownOpen(false)
    setCreatingNew(false)
    setNewName('')
    await onCollectionCreate(name)
  }

  const handleDeleteClick = (e, col) => {
    e.stopPropagation()
    setDropdownOpen(false)
    setPendingDelete(col)
  }

  const confirmDelete = () => {
    if (pendingDelete) onCollectionDelete(pendingDelete.id)
    setPendingDelete(null)
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

          {/* Active collection selector — only shown when >1 collection exists */}
          {collections.length > 1 && (
            <div className="collection-selector" ref={dropdownRef}>
              <button
                className="collection-selector-btn"
                onClick={() => { setDropdownOpen(o => !o); setCreatingNew(false); setNewName('') }}
              >
                <span className="collection-selector-name">
                  {activeCollection?.name ?? 'Select collection'}
                </span>
                <ChevronDown size={13} style={{
                  flexShrink: 0,
                  transition: 'transform 0.15s',
                  transform: dropdownOpen ? 'rotate(180deg)' : 'none',
                }} />
              </button>

              {dropdownOpen && (
                <div className="collection-dropdown">
                  {collections.map(col => (
                    <div
                      key={col.id}
                      className={`collection-dropdown-item ${col.id === activeCollectionId ? 'active' : ''}`}
                      onClick={() => handleSelectCollection(col.id)}
                    >
                      <Check size={12} style={{ opacity: col.id === activeCollectionId ? 1 : 0, flexShrink: 0 }} />
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {col.name}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-3)', flexShrink: 0 }}>{col.count}</span>
                      <button
                        className="collection-delete-btn"
                        onClick={(e) => handleDeleteClick(e, col)}
                        title={`Delete ${col.name}`}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}

                  <div className="collection-dropdown-divider" />

                  {creatingNew ? (
                    <form className="collection-new-form" onSubmit={handleCreateSubmit}>
                      <input
                        ref={newNameRef}
                        className="collection-new-input"
                        placeholder="Collection name…"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        onKeyDown={e => e.key === 'Escape' && (setCreatingNew(false), setNewName(''))}
                      />
                      <button type="submit" className="collection-new-confirm" disabled={!newName.trim()}>
                        <Check size={12} />
                      </button>
                      <button type="button" className="collection-new-cancel"
                        onClick={() => { setCreatingNew(false); setNewName('') }}>
                        <X size={12} />
                      </button>
                    </form>
                  ) : (
                    <div
                      className="collection-dropdown-item collection-new-item"
                      onClick={() => setCreatingNew(true)}
                    >
                      <Plus size={12} style={{ flexShrink: 0 }} />
                      <span>New collection…</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* When only 1 collection, show inline creation affordance */}
          {collections.length === 1 && !inlineCreating && (
            <button
              className="nav-item"
              onClick={() => setInlineCreating(true)}
              style={{ color: 'var(--text-3)' }}
            >
              <Plus size={15} />
              <span className="nav-label">New collection…</span>
            </button>
          )}
          {collections.length === 1 && inlineCreating && (
            <form
              className="collection-new-form"
              style={{ margin: '2px 8px 4px' }}
              onSubmit={async (e) => {
                e.preventDefault()
                const name = inlineName.trim()
                if (!name) return
                setInlineCreating(false)
                setInlineName('')
                await onCollectionCreate(name)
              }}
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
          )}

          {navItem('/favourites', <FolderOpen size={15} />, activeCollection?.name ?? 'Collections', counts.favourites)}

          <div className="nav-section-label" style={{ marginTop: 8 }}>System</div>
          <button className="nav-item" onClick={() => { onSync(); setMobileOpen(false) }} disabled={syncing}>
            <RefreshCw size={15} style={{ animation: syncing ? 'spin 0.7s linear infinite' : 'none', flexShrink: 0 }} />
            <span className="nav-label">{syncing ? 'Syncing…' : 'Sync Library'}</span>
          </button>
          {navItem('/settings', <Settings size={15} />, 'Settings', null)}
        </nav>
      </aside>

      {/* Delete confirmation modal */}
      {pendingDelete && (
        <div className="modal-overlay" onClick={() => setPendingDelete(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Delete collection?</h3>
            <p className="modal-body">
              Deleting <strong>{pendingDelete.name}</strong> will remove{' '}
              <strong>{pendingDelete.count} item{pendingDelete.count !== 1 ? 's' : ''}</strong>.
              This cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setPendingDelete(null)}>Cancel</button>
              <button className="btn btn-danger btn-sm" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
