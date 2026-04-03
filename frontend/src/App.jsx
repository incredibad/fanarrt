import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import LibraryPage from './pages/LibraryPage'
import ItemPage from './pages/ItemPage'
import FavouritesPage from './pages/FavouritesPage'
import SettingsPage from './pages/SettingsPage'
import LoginPage from './pages/LoginPage'
import SetupPage from './pages/SetupPage'
import { useToastSetup, ToastContainer } from './hooks/useToast'
import { toast } from './hooks/useToast'
import { api } from './api'

const AUTH_UNKNOWN = 'unknown'
const AUTH_SETUP   = 'setup'
const AUTH_LOGIN   = 'login'
const AUTH_OK      = 'ok'

export default function App() {
  const { toasts } = useToastSetup()
  const [authState, setAuthState] = useState(AUTH_UNKNOWN)
  const [syncing, setSyncing] = useState(false)
  const [counts, setCounts] = useState({ all: null, shows: null, movies: null, favourites: null })
  const [collections, setCollections] = useState([])
  const [activeCollectionId, setActiveCollectionId] = useState(() => {
    const stored = localStorage.getItem('activeCollectionId')
    return stored ? parseInt(stored, 10) : null
  })

  useEffect(() => {
    api.getAuthStatus()
      .then(({ needsSetup, loggedIn }) => {
        if (needsSetup) setAuthState(AUTH_SETUP)
        else if (!loggedIn) setAuthState(AUTH_LOGIN)
        else setAuthState(AUTH_OK)
      })
      .catch(() => setAuthState(AUTH_LOGIN))
  }, [])

  useEffect(() => {
    if (authState !== AUTH_OK) return
    loadCollections()
  }, [authState])

  async function loadCollections() {
    try {
      const cols = await api.getCollections()
      setCollections(cols)
      setActiveCollectionId(prev => {
        if (!cols.length) return null
        if (prev && cols.find(c => c.id === prev)) return prev
        return cols[0].id
      })
    } catch {}
  }

  async function loadCounts(collectionId) {
    const cid = collectionId ?? activeCollectionId
    try {
      const [all, shows, movies, favStats] = await Promise.all([
        api.getLibrary({ limit: 1 }),
        api.getLibrary({ limit: 1, type: 'show' }),
        api.getLibrary({ limit: 1, type: 'movie' }),
        api.getFavouriteStats(cid),
      ])
      setCounts({
        all: all.total,
        shows: shows.total,
        movies: movies.total,
        favourites: favStats.reduce((sum, s) => sum + s.count, 0),
      })
    } catch {}
  }

  // Reload counts once collections are settled and activeCollectionId is known
  useEffect(() => {
    if (authState !== AUTH_OK || !activeCollectionId) return
    loadCounts(activeCollectionId)
  }, [authState, activeCollectionId])

  const handleFavCountChange = useCallback((delta, collectionId) => {
    const targetId = collectionId ?? activeCollectionId
    // Only update the sidebar favourites link count for the active collection
    if (targetId === activeCollectionId) {
      setCounts(prev => ({
        ...prev,
        favourites: Math.max(0, (prev.favourites ?? 0) + delta),
      }))
    }
    // Always update the specific collection's badge count
    setCollections(prev => prev.map(c =>
      c.id === targetId
        ? { ...c, count: Math.max(0, (c.count || 0) + delta) }
        : c
    ))
  }, [activeCollectionId])

  const handleCollectionChange = useCallback((id) => {
    setActiveCollectionId(id)
    localStorage.setItem('activeCollectionId', id)
    loadCounts(id)
  }, [])

  const handleCollectionCreate = useCallback(async (name) => {
    try {
      const col = await api.createCollection(name)
      setCollections(prev => [...prev, col])
      handleCollectionChange(col.id)
    } catch (e) {
      toast(e.message, 'error')
    }
  }, [handleCollectionChange])

  const handleCollectionRename = useCallback(async (id, name) => {
    try {
      await api.renameCollection(id, name)
      setCollections(prev => prev.map(c => c.id === id ? { ...c, name } : c))
    } catch (e) {
      toast(e.message, 'error')
    }
  }, [])

  const handleCollectionDelete = useCallback(async (id) => {
    try {
      await api.deleteCollection(id)
      const remaining = collections.filter(c => c.id !== id)
      setCollections(remaining)
      if (activeCollectionId === id && remaining.length > 0) {
        handleCollectionChange(remaining[0].id)
      } else {
        loadCounts()
      }
    } catch (e) {
      toast(e.message, 'error')
    }
  }, [activeCollectionId, collections, handleCollectionChange])

  const handleAuthComplete = () => setAuthState(AUTH_OK)

  const handleLogout = async () => {
    try { await api.logout() } catch {}
    toast('Signed out', 'info')
    setAuthState(AUTH_LOGIN)
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await api.syncLibrary()
      const parts = []
      if (res.sonarr !== null) parts.push(`${res.sonarr} shows`)
      if (res.radarr !== null) parts.push(`${res.radarr} movies`)
      if (parts.length > 0) toast(`Synced: ${parts.join(', ')}`, 'success')
      if (res.errors?.length > 0) toast(res.errors[0], 'error')
      if (parts.length === 0 && !res.errors?.length) toast('No sources configured yet', 'info')
      loadCounts()
    } catch (e) {
      if (e.message?.includes('Authentication')) setAuthState(AUTH_LOGIN)
      else toast(e.message, 'error')
    } finally {
      setSyncing(false)
    }
  }

  if (authState === AUTH_UNKNOWN) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--bg)' }}>
        <div className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    )
  }

  if (authState === AUTH_SETUP) return <><SetupPage onComplete={handleAuthComplete} /><ToastContainer toasts={toasts} /></>
  if (authState === AUTH_LOGIN) return <><LoginPage onComplete={handleAuthComplete} /><ToastContainer toasts={toasts} /></>

  const activeCollection = collections.find(c => c.id === activeCollectionId) || null

  return (
    <div className="app-layout">
      <Sidebar
        onSync={handleSync}
        syncing={syncing}
        counts={counts}
        collections={collections}
        activeCollectionId={activeCollectionId}
        onCollectionChange={handleCollectionChange}
        onCollectionCreate={handleCollectionCreate}
      />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<LibraryPage activeCollectionId={activeCollectionId} />} />
          <Route path="/shows" element={<LibraryPage typeFilter="show" activeCollectionId={activeCollectionId} />} />
          <Route path="/movies" element={<LibraryPage typeFilter="movie" activeCollectionId={activeCollectionId} />} />
          <Route path="/item/:id" element={
            <ItemPage
              onFavCountChange={handleFavCountChange}
              activeCollectionId={activeCollectionId}
              collections={collections}
            />
          } />
          <Route path="/favourites" element={
            <FavouritesPage
              onFavCountChange={handleFavCountChange}
              activeCollection={activeCollection}
              activeCollectionId={activeCollectionId}
              collections={collections}
              onCollectionRename={handleCollectionRename}
              onCollectionDelete={handleCollectionDelete}
            />
          } />
          <Route path="/settings" element={<SettingsPage onLogout={handleLogout} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <ToastContainer toasts={toasts} />
    </div>
  )
}
