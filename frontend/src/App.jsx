import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
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
  // Nav counts
  const [counts, setCounts] = useState({ all: null, shows: null, movies: null, favourites: null })

  useEffect(() => {
    api.getAuthStatus()
      .then(({ needsSetup, loggedIn }) => {
        if (needsSetup) setAuthState(AUTH_SETUP)
        else if (!loggedIn) setAuthState(AUTH_LOGIN)
        else setAuthState(AUTH_OK)
      })
      .catch(() => setAuthState(AUTH_LOGIN))
  }, [])

  // Load nav counts once authenticated
  useEffect(() => {
    if (authState !== AUTH_OK) return
    loadCounts()
  }, [authState])

  async function loadCounts() {
    try {
      const [all, shows, movies, favStats] = await Promise.all([
        api.getLibrary({ limit: 1 }),
        api.getLibrary({ limit: 1, type: 'show' }),
        api.getLibrary({ limit: 1, type: 'movie' }),
        api.getFavouriteStats(),
      ])
      setCounts({
        all: all.total,
        shows: shows.total,
        movies: movies.total,
        favourites: favStats.reduce((sum, s) => sum + s.count, 0),
      })
    } catch {}
  }

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
      // Refresh counts after sync
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

  return (
    <div className="app-layout">
      <Sidebar onSync={handleSync} syncing={syncing} counts={counts} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<LibraryPage />} />
          <Route path="/shows" element={<LibraryPage typeFilter="show" />} />
          <Route path="/movies" element={<LibraryPage typeFilter="movie" />} />
          <Route path="/item/:id" element={<ItemPage />} />
          <Route path="/favourites" element={<FavouritesPage />} />
          <Route path="/settings" element={<SettingsPage onLogout={handleLogout} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <ToastContainer toasts={toasts} />
    </div>
  )
}
