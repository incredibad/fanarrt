import { useState, useEffect } from 'react'
import { Save, Zap, Loader, LogOut, KeyRound } from 'lucide-react'
import { api } from '../api'
import { toast } from '../hooks/useToast'

function ConnectionStatus({ status }) {
  if (!status) return <span className="status-dot unknown" title="Not tested" />
  if (status === 'testing') return <Loader size={12} style={{ animation: 'spin 0.7s linear infinite', color: 'var(--text-3)' }} />
  if (status.ok) return <span className="status-dot ok" title={`v${status.version}`} />
  return <span className="status-dot fail" title={status.error} />
}

function ChangePasswordSection() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (next !== confirm) { toast('New passwords do not match', 'error'); return }
    if (next.length < 8) { toast('New password must be at least 8 characters', 'error'); return }
    setSaving(true)
    try {
      await api.changePassword(current, next)
      toast('Password changed successfully', 'success')
      setCurrent(''); setNext(''); setConfirm('')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="settings-section">
      <div className="settings-section-title">
        <KeyRound size={14} /> Change Password
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label">Current Password</label>
          <input className="form-input" type="password" value={current}
            onChange={e => setCurrent(e.target.value)} required autoComplete="current-password" />
        </div>
        <div className="form-field">
          <label className="form-label">New Password</label>
          <input className="form-input" type="password" value={next}
            onChange={e => setNext(e.target.value)} placeholder="At least 8 characters" required autoComplete="new-password" />
        </div>
        <div className="form-field">
          <label className="form-label">Confirm New Password</label>
          <input className="form-input" type="password" value={confirm}
            onChange={e => setConfirm(e.target.value)} required autoComplete="new-password" />
        </div>
        <button type="submit" className="btn btn-secondary btn-sm" disabled={saving}>
          {saving ? 'Saving…' : 'Change Password'}
        </button>
      </form>
    </div>
  )
}

export default function SettingsPage({ onLogout }) {
  const [form, setForm] = useState({
    sonarr_url: '', sonarr_api_key: '',
    radarr_url: '', radarr_api_key: '',
    tvdb_api_key: '', tvdb_pin: '',
    tmdb_api_key: '',
    fanart_api_key: '',
  })
  const DEFAULT_ORDER = ['fanart.tv', 'tvdb', 'tmdb']
  const [providerOrder, setProviderOrder] = useState(DEFAULT_ORDER)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [connStatus, setConnStatus] = useState({ sonarr: null, radarr: null })

  useEffect(() => {
    api.getSettings()
      .then(data => {
        setForm(prev => ({ ...prev, ...data }))
        if (data.provider_order) {
          try { setProviderOrder(JSON.parse(data.provider_order)) } catch {}
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.saveSettings({ ...form, provider_order: JSON.stringify(providerOrder) })
      toast('Settings saved', 'success')
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const moveProvider = (idx, dir) => {
    setProviderOrder(prev => {
      const next = [...prev]
      const swap = idx + dir
      if (swap < 0 || swap >= next.length) return prev
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      return next
    })
  }

  const handleTest = async (svc) => {
    // Save first, then test
    try {
      await api.saveSettings(form)
    } catch {}

    setConnStatus(prev => ({ ...prev, [svc]: 'testing' }))
    try {
      const result = await api.testConnection(svc)
      setConnStatus(prev => ({ ...prev, [svc]: result }))
      if (result.ok) toast(`${svc} connected — v${result.version}`, 'success')
      else toast(`${svc} failed: ${result.error}`, 'error')
    } catch (e) {
      setConnStatus(prev => ({ ...prev, [svc]: { ok: false, error: e.message } }))
    }
  }

  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }))

  if (loading) return <div className="loading-overlay"><div className="spinner" /></div>

  return (
    <div className="scroll-area">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure your media server and API connections</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-danger btn-sm" onClick={onLogout}>
            <LogOut size={13} /> Sign Out
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={14} />
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="settings-grid">
        {/* Sonarr */}
        <div className="settings-section">
          <div className="settings-section-title">
            <span style={{ fontSize: 16 }}>📺</span> Sonarr
            <ConnectionStatus status={connStatus.sonarr} />
          </div>
          <div className="form-field">
            <label className="form-label">URL</label>
            <input className="form-input" value={form.sonarr_url} onChange={set('sonarr_url')}
              placeholder="http://localhost:8989" />
            <div className="form-hint">Include protocol and port, no trailing slash</div>
          </div>
          <div className="form-field">
            <label className="form-label">API Key</label>
            <input className="form-input" type="password" value={form.sonarr_api_key} onChange={set('sonarr_api_key')}
              placeholder="Your Sonarr API key" />
            <div className="form-hint">Found in Sonarr → Settings → General</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => handleTest('sonarr')}>
            <Zap size={13} /> Test Connection
          </button>
        </div>

        {/* Radarr */}
        <div className="settings-section">
          <div className="settings-section-title">
            <span style={{ fontSize: 16 }}>🎬</span> Radarr
            <ConnectionStatus status={connStatus.radarr} />
          </div>
          <div className="form-field">
            <label className="form-label">URL</label>
            <input className="form-input" value={form.radarr_url} onChange={set('radarr_url')}
              placeholder="http://localhost:7878" />
          </div>
          <div className="form-field">
            <label className="form-label">API Key</label>
            <input className="form-input" type="password" value={form.radarr_api_key} onChange={set('radarr_api_key')}
              placeholder="Your Radarr API key" />
            <div className="form-hint">Found in Radarr → Settings → General</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => handleTest('radarr')}>
            <Zap size={13} /> Test Connection
          </button>
        </div>

        {/* TheTVDB */}
        <div className="settings-section">
          <div className="settings-section-title">
            <span style={{ fontSize: 16 }}>🗄️</span> TheTVDB
          </div>
          <div className="form-field">
            <label className="form-label">API Key</label>
            <input className="form-input" type="password" value={form.tvdb_api_key} onChange={set('tvdb_api_key')}
              placeholder="Your TheTVDB v4 API key" />
            <div className="form-hint">
              Get a free key at <a href="https://www.thetvdb.com/api-information" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-2)' }}>thetvdb.com/api-information</a>
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">PIN (optional)</label>
            <input className="form-input" value={form.tvdb_pin} onChange={set('tvdb_pin')}
              placeholder="Subscriber PIN if applicable" />
          </div>
        </div>

        {/* TMDB */}
        <div className="settings-section">
          <div className="settings-section-title">
            <span style={{ fontSize: 16 }}>🎥</span> The Movie Database (TMDB)
          </div>
          <div className="form-field">
            <label className="form-label">API Key (v3)</label>
            <input className="form-input" type="password" value={form.tmdb_api_key} onChange={set('tmdb_api_key')}
              placeholder="Your TMDB API key" />
            <div className="form-hint">
              Free key at <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-2)' }}>themoviedb.org/settings/api</a>
            </div>
          </div>
          <div style={{ marginTop: 16, padding: '10px 12px', background: 'var(--bg-3)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
            TMDB is used for movies and as a secondary source for TV shows. TVDB is the primary source for TV show artwork.
          </div>
        </div>

        {/* Fanart.tv */}
        <div className="settings-section">
          <div className="settings-section-title">
            <span style={{ fontSize: 16 }}>🎨</span> Fanart.tv
          </div>
          <div className="form-field">
            <label className="form-label">API Key</label>
            <input className="form-input" type="password" value={form.fanart_api_key} onChange={set('fanart_api_key')}
              placeholder="Your Fanart.tv API key" />
            <div className="form-hint">
              Free personal key at <a href="https://fanart.tv/get-an-api-key/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-2)' }}>fanart.tv/get-an-api-key</a>
            </div>
          </div>
          <div style={{ marginTop: 16, padding: '10px 12px', background: 'var(--bg-3)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
            Provides clearlogos, clearart, disc art, character art and high-quality backgrounds for both TV and movies. Uses TVDB ID for shows, TMDB ID for movies.
          </div>
        </div>

        {/* Provider order */}
        <div className="settings-section" style={{ gridColumn: '1 / -1' }}>
          <div className="settings-section-title">
            <span style={{ fontSize: 16 }}>⚡</span> Provider Priority Order
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16, lineHeight: 1.6 }}>
            Artwork within each category is grouped by provider in this order. Drag the arrows to reorder — higher means it appears first when browsing.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 320 }}>
            {providerOrder.map((p, i) => (
              <div key={p} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--bg-3)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', padding: '8px 12px',
              }}>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', width: 18 }}>{i + 1}</span>
                <span style={{ flex: 1, fontSize: 13.5, color: 'var(--text)', fontWeight: 500 }}>{p}</span>
                <div style={{ display: 'flex', gap: 2 }}>
                  <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px' }}
                    onClick={() => moveProvider(i, -1)} disabled={i === 0} title="Move up">↑</button>
                  <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px' }}
                    onClick={() => moveProvider(i, 1)} disabled={i === providerOrder.length - 1} title="Move down">↓</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Account section */}
      <div style={{ padding: '0 32px', marginBottom: 24 }}>
        <div className="settings-grid" style={{ marginBottom: 0 }}>
          <ChangePasswordSection />
        </div>
      </div>

      {/* How-to section */}
      <div style={{ padding: '0 32px 32px' }}>
        <div className="settings-section" style={{ maxWidth: '100%' }}>
          <div className="settings-section-title">🚀 Getting Started</div>
          <ol style={{ paddingLeft: 18, color: 'var(--text-2)', fontSize: 13.5, lineHeight: 2 }}>
            <li>Enter your Sonarr and/or Radarr URLs and API keys above, then click <strong>Save Settings</strong></li>
            <li>Test each connection using the Test button</li>
            <li>Add your TheTVDB and/or TMDB API keys (both are free)</li>
            <li>Click <strong>Sync Library</strong> in the sidebar to import your media</li>
            <li>Browse to any title and click <strong>Fetch Fanart</strong> to load artwork</li>
            <li>Star your favourites and download them individually or as a batch</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
