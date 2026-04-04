import { useState, useEffect } from 'react'
import { Save, Zap, Loader, LogOut, KeyRound, Server, Database, User, Plus, Trash2, Pencil } from 'lucide-react'
import { api } from '../api'
import { toast } from '../hooks/useToast'

function SonarrLogo({ size = 18 }) {
  return (
    <svg height={size} viewBox="0 0 216.7 216.9" width={size} xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path clipRule="evenodd" d="M216.7 108.45c0 29.833-10.533 55.4-31.6 76.7-.7.833-1.483 1.6-2.35 2.3-3.466 3.4-7.133 6.484-11 9.25-18.267 13.467-39.367 20.2-63.3 20.2-23.967 0-45.033-6.733-63.2-20.2-4.8-3.4-9.3-7.25-13.5-11.55-16.367-16.266-26.417-35.167-30.15-56.7-.733-4.2-1.217-8.467-1.45-12.8-.1-2.4-.15-4.8-.15-7.2 0-2.533.05-4.95.15-7.25 0-.233.066-.467.2-.7 1.567-26.6 12.033-49.583 31.4-68.95C53.05 10.517 78.617 0 108.45 0c29.933 0 55.484 10.517 76.65 31.55 21.067 21.433 31.6 47.067 31.6 76.9z" fill="#EEE" fillRule="evenodd"/>
      <path clipRule="evenodd" d="M194.65 42.5l-22.4 22.4C159.152 77.998 158 89.4 158 109.5c0 17.934 2.852 34.352 16.2 47.7 9.746 9.746 19 18.95 19 18.95-2.5 3.067-5.2 6.067-8.1 9-.7.833-1.483 1.6-2.35 2.3-2.533 2.5-5.167 4.817-7.9 6.95l-17.55-17.55c-15.598-15.6-27.996-17.1-48.6-17.1-19.77 0-33.223 1.822-47.7 16.3-8.647 8.647-18.55 18.6-18.55 18.6-3.767-2.867-7.333-6.034-10.7-9.5-2.8-2.8-5.417-5.667-7.85-8.6 0 0 9.798-9.848 19.15-19.2 13.852-13.853 16.1-29.916 16.1-47.85 0-17.5-2.874-33.823-15.6-46.55-8.835-8.836-21.05-21-21.05-21 2.833-3.6 5.917-7.067 9.25-10.4 2.934-2.867 5.934-5.55 9-8.05L61.1 43.85C74.102 56.852 90.767 60.2 108.7 60.2c18.467 0 35.077-3.577 48.6-17.1 8.32-8.32 19.3-19.25 19.3-19.25 2.9 2.367 5.733 4.933 8.5 7.7 3.467 3.533 6.65 7.183 9.55 10.95z" fill="#3A3F51" fillRule="evenodd"/>
      <g clipRule="evenodd">
        <path d="M78.7 114c-.2-1.167-.332-2.35-.4-3.55-.032-.667-.05-1.333-.05-2 0-.7.018-1.367.05-2 0-.067.018-.133.05-.2.435-7.367 3.334-13.733 8.7-19.1 5.9-5.833 12.984-8.75 21.25-8.75 8.3 0 15.384 2.917 21.25 8.75 5.834 5.934 8.75 13.033 8.75 21.3 0 8.267-2.916 15.35-8.75 21.25-.2.233-.416.45-.65.65-.966.933-1.982 1.783-3.05 2.55-5.065 3.733-10.916 5.6-17.55 5.6s-12.466-1.866-17.5-5.6c-1.332-.934-2.582-2-3.75-3.2-4.532-4.5-7.316-9.734-8.35-15.7z" fill="#0CF" fillRule="evenodd"/>
        <path d="M157.8 59.75l-15 14.65M30.785 32.526L71.65 73.25m84.6 84.25l27.808 28.78m1.855-153.894L157.8 59.75m-125.45 126l27.35-27.4" fill="none" stroke="#0CF" strokeMiterlimit="1" strokeWidth="2"/>
        <path d="M157.8 59.75l-16.95 17.2M58.97 60.604l17.2 17.15M59.623 158.43l16.75-17.4m61.928-1.396l18.028 17.945" fill="none" stroke="#0CF" strokeMiterlimit="1" strokeWidth="7"/>
      </g>
    </svg>
  )
}

function RadarrLogo({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" style={{ flexShrink: 0 }}>
      <defs>
        <rect width="1024" height="1024" id="rl_art" />
        <clipPath id="rl_clip"><use xlinkHref="#rl_art" clipRule="evenodd" /></clipPath>
      </defs>
      <g clipPath="url(#rl_clip)">
        <g transform="translate(70 21.00012)">
          <path d="M105.302 154.943L112.824 869.492C52.651 877.014 7.52158 846.927 7.52158 786.755L0 192.55C0 4.51106 172.996 -40.6184 278.298 34.5974L812.33 342.982C887.546 395.633 902.589 493.413 864.981 561.107C857.46 508.456 834.895 478.37 789.765 448.284L188.039 109.813C142.91 79.7268 105.302 87.2484 105.302 154.943Z" fill="#24292E"/>
          <path d="M0 376.079C45.1295 391.122 90.259 383.6 127.867 361.036L744.636 0C782.244 52.651 774.723 105.302 729.593 135.388L210.604 436.251C135.388 473.859 37.6079 436.251 0 376.079Z" transform="translate(60.17249 531.0214)" fill="#24292E"/>
          <path d="M0 413.687L368.557 203.083L7.52157 0L0 413.687Z" transform="translate(240.6902 282.8092)" fill="#FFC230"/>
        </g>
      </g>
    </svg>
  )
}

function ConnectionStatus({ status }) {
  if (!status) return <span className="status-dot unknown" title="Not tested" />
  if (status === 'testing') return <Loader size={12} style={{ animation: 'spin 0.7s linear infinite', color: 'var(--text-3)' }} />
  if (status.ok) return <span className="status-dot ok" title={`v${status.version}`} />
  return <span className="status-dot fail" title={status.error} />
}

const TABS = [
  { id: 'servers',   label: 'Media Servers', icon: Server },
  { id: 'providers', label: 'Providers',     icon: Database },
  { id: 'account',   label: 'Account',       icon: User },
]

const TYPE_MODE_LABELS = { auto: 'Auto', show: 'Shows Only', anime: 'Anime Only' }

export default function SettingsPage({ onLogout }) {
  const [tab, setTab] = useState('servers')
  const [form, setForm] = useState({
    tvdb_api_key: '', tvdb_pin: '',
    tmdb_api_key: '',
    fanart_api_key: '',
  })
  const DEFAULT_ORDER = ['fanart.tv', 'tvdb', 'tmdb', 'anilist']
  const [providerOrder, setProviderOrder] = useState(DEFAULT_ORDER)
  const [anilistEnabled, setAnilistEnabled] = useState(true)
  const [sonarrInstances, setSonarrInstances] = useState([])
  const [radarrInstances, setRadarrInstances] = useState([])
  const [instanceStatus, setInstanceStatus] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.getSettings()
      .then(data => {
        setForm(prev => ({
          ...prev,
          tvdb_api_key: data.tvdb_api_key || '',
          tvdb_pin: data.tvdb_pin || '',
          tmdb_api_key: data.tmdb_api_key || '',
          fanart_api_key: data.fanart_api_key || '',
        }))
        if (Array.isArray(data.provider_order) && data.provider_order.length) {
          const order = data.provider_order
          // Ensure 'anilist' is present for existing users with saved order
          setProviderOrder(order.includes('anilist') ? order : [...order, 'anilist'])
        }
        if (data.anilist_enabled !== undefined) setAnilistEnabled(data.anilist_enabled)
        if (Array.isArray(data.sonarr_instances)) setSonarrInstances(data.sonarr_instances)
        if (Array.isArray(data.radarr_instances)) setRadarrInstances(data.radarr_instances)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSaveProviders = async () => {
    setSaving(true)
    try {
      await api.saveSettings({ ...form, provider_order: JSON.stringify(providerOrder), anilist_enabled: anilistEnabled })
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

  const saveInstances = async (arrType, instances) => {
    const key = arrType === 'sonarr' ? 'sonarr_instances' : 'radarr_instances'
    try {
      await api.saveSettings({ [key]: instances })
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  const handleInstanceChange = async (arrType, newInstances) => {
    if (arrType === 'sonarr') setSonarrInstances(newInstances)
    else setRadarrInstances(newInstances)
    await saveInstances(arrType, newInstances)
  }

  const handleTestInstance = async (arrType, instanceId, url, apiKey) => {
    const key = `${arrType}-${instanceId}`
    setInstanceStatus(prev => ({ ...prev, [key]: 'testing' }))
    try {
      // If the user typed a new api key, test with it directly; otherwise use the stored key
      const result = apiKey
        ? await api.testInstanceConnection(url, apiKey)
        : await api.testSavedInstance(arrType, instanceId)
      setInstanceStatus(prev => ({ ...prev, [key]: result }))
      if (result.ok) toast(`Connected — v${result.version}`, 'success')
      else toast(`Connection failed: ${result.error}`, 'error')
    } catch (e) {
      setInstanceStatus(prev => ({ ...prev, [key]: { ok: false, error: e.message } }))
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
        {tab === 'providers' && (
          <div className="page-actions">
            <button className="btn btn-primary" onClick={handleSaveProviders} disabled={saving}>
              <Save size={14} />
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div style={{ padding: '0 32px 24px' }}>
        <div className="filter-tabs" style={{ display: 'inline-flex' }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`filter-tab ${tab === id ? 'active' : ''}`}
              onClick={() => setTab(id)}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Media Servers */}
      {tab === 'servers' && (
        <div style={{ padding: '0 32px 32px' }}>
          <div className="settings-grid">
            <div className="settings-section">
              <div className="settings-section-title"><SonarrLogo /> Sonarr</div>
              <InstanceManager
                arrType="sonarr"
                instances={sonarrInstances}
                instanceStatus={instanceStatus}
                onChange={(instances) => handleInstanceChange('sonarr', instances)}
                onTest={handleTestInstance}
              />
            </div>

            <div className="settings-section">
              <div className="settings-section-title"><RadarrLogo /> Radarr</div>
              <InstanceManager
                arrType="radarr"
                instances={radarrInstances}
                instanceStatus={instanceStatus}
                onChange={(instances) => handleInstanceChange('radarr', instances)}
                onTest={handleTestInstance}
              />
            </div>
          </div>

          <div className="settings-section" style={{ marginTop: 24, maxWidth: '100%' }}>
            <div className="settings-section-title">🚀 Getting Started</div>
            <ol style={{ paddingLeft: 18, color: 'var(--text-2)', fontSize: 13.5, lineHeight: 2 }}>
              <li>Add your Sonarr and/or Radarr instances above and test each connection</li>
              <li>Add your TheTVDB and/or TMDB API keys on the Providers tab (both are free)</li>
              <li>Click <strong>Sync Library</strong> in the sidebar to import your media</li>
              <li>Browse to any title and click <strong>Fetch Fanart</strong> to load artwork</li>
              <li>Star your favourites and download them individually or as a batch</li>
            </ol>
          </div>
        </div>
      )}

      {/* Providers */}
      {tab === 'providers' && (
        <div style={{ padding: '0 32px 32px' }}>
          <div className="settings-grid">
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
                Used for movies and as a secondary source for TV shows.
              </div>
            </div>

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
                Clearlogos, clearart, disc art, character art and high-quality backgrounds for TV and movies.
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-section-title">
                <span style={{ fontSize: 16 }}>🎌</span> AniList
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>
                    Fetch anime artwork from AniList
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
                    No API key required. Only used for anime when a confirmed MAL ID is found via TVDB — never guesses by title.
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={anilistEnabled}
                  onClick={() => setAnilistEnabled(v => !v)}
                  style={{
                    flexShrink: 0, width: 40, height: 22, borderRadius: 11,
                    background: anilistEnabled ? 'var(--accent)' : 'var(--bg-4)',
                    border: '1px solid ' + (anilistEnabled ? 'var(--accent)' : 'var(--border)'),
                    cursor: 'pointer', position: 'relative', transition: 'background 0.2s, border-color 0.2s',
                  }}
                >
                  <span style={{
                    position: 'absolute', top: 2, left: anilistEnabled ? 20 : 2,
                    width: 16, height: 16, borderRadius: '50%', background: '#fff',
                    transition: 'left 0.2s', display: 'block',
                  }} />
                </button>
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-section-title">
                <span style={{ fontSize: 16 }}>⚡</span> Priority Order
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16, lineHeight: 1.6 }}>
                Artwork within each category is grouped by provider in this order.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
        </div>
      )}

      {/* Account */}
      {tab === 'account' && (
        <div style={{ padding: '0 32px 32px' }}>
          <div className="settings-grid">
            <ChangePasswordSection />
            <div className="settings-section">
              <div className="settings-section-title">
                <LogOut size={14} /> Sign Out
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16, lineHeight: 1.6 }}>
                You will be returned to the login screen.
              </p>
              <button className="btn btn-danger btn-sm" onClick={onLogout}>
                <LogOut size={13} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Instance Manager ───────────────────────────────────────────────────────────

function InstanceManager({ arrType, instances, instanceStatus, onChange, onTest }) {
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  const startEdit = (inst) => {
    setEditingId(inst.id)
    setEditForm({ label: inst.label || '', url: inst.url || '', api_key: '', type_mode: inst.type_mode || 'auto' })
  }

  const handleAdd = () => {
    const newId = Date.now().toString()
    const newInst = { id: newId, label: '', url: '', api_key: '', type_mode: 'auto' }
    const updated = [...instances, newInst]
    onChange(updated)
    startEdit(newInst)
  }

  const handleSave = (instId) => {
    const updated = instances.map(inst =>
      inst.id === instId ? { ...inst, ...editForm } : inst
    )
    onChange(updated)
    setEditingId(null)
  }

  const handleDelete = (instId) => {
    onChange(instances.filter(inst => inst.id !== instId))
    if (editingId === instId) setEditingId(null)
  }

  const handleCancel = (instId) => {
    // If this was a brand-new unsaved instance (no URL), remove it on cancel
    const inst = instances.find(i => i.id === instId)
    if (inst && !inst.url) {
      onChange(instances.filter(i => i.id !== instId))
    }
    setEditingId(null)
  }

  const handleTest = (instId) => {
    const inst = instances.find(i => i.id === instId)
    const url = editForm.url || inst?.url || ''
    const apiKey = editForm.api_key || ''
    onTest(arrType, instId, url, apiKey)
  }

  const setField = (k) => (e) => setEditForm(prev => ({ ...prev, [k]: e.target.value }))

  const placeholder = arrType === 'sonarr' ? 'http://localhost:8989' : 'http://localhost:7878'

  return (
    <div>
      {instances.length === 0 && (
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 12 }}>No instances configured yet.</p>
      )}

      {instances.map(inst => {
        const statusKey = `${arrType}-${inst.id}`
        const isEditing = editingId === inst.id

        if (isEditing) {
          return (
            <div key={inst.id} className="instance-card instance-card-editing">
              <div className="form-field">
                <label className="form-label">Label</label>
                <input className="form-input" value={editForm.label} onChange={setField('label')}
                  placeholder={arrType === 'sonarr' ? 'e.g. Main Sonarr' : 'e.g. Main Radarr'} />
              </div>
              <div className="form-field">
                <label className="form-label">URL</label>
                <input className="form-input" value={editForm.url} onChange={setField('url')}
                  placeholder={placeholder} />
                <div className="form-hint">Include protocol and port, no trailing slash</div>
              </div>
              <div className="form-field">
                <label className="form-label">API Key</label>
                <input className="form-input" type="password" value={editForm.api_key} onChange={setField('api_key')}
                  placeholder={inst.url ? 'Leave blank to keep existing key' : `Your ${arrType === 'sonarr' ? 'Sonarr' : 'Radarr'} API key`} />
                <div className="form-hint">
                  Found in {arrType === 'sonarr' ? 'Sonarr' : 'Radarr'} → Settings → General
                </div>
              </div>
              {arrType === 'sonarr' && (
                <div className="form-field">
                  <label className="form-label">Type Mode</label>
                  <select className="form-input" value={editForm.type_mode} onChange={setField('type_mode')}>
                    <option value="auto">Auto — use Sonarr series type per show</option>
                    <option value="show">Shows Only — treat all as TV shows</option>
                    <option value="anime">Anime Only — treat all as anime</option>
                  </select>
                  <div className="form-hint">Controls how items from this instance are classified in Fanarrt</div>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => handleTest(inst.id)}>
                  <Zap size={13} /> Test
                </button>
                <ConnectionStatus status={instanceStatus[statusKey]} />
                <div style={{ flex: 1 }} />
                <button className="btn btn-ghost btn-sm" onClick={() => handleCancel(inst.id)}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={() => handleSave(inst.id)}
                  disabled={!editForm.url}>
                  Save
                </button>
              </div>
            </div>
          )
        }

        return (
          <div key={inst.id} className="instance-card">
            <ConnectionStatus status={instanceStatus[statusKey]} />
            <span className="instance-card-label">{inst.label || 'Unnamed'}</span>
            {arrType === 'sonarr' && inst.type_mode && inst.type_mode !== 'auto' && (
              <span className={`instance-type-badge type-mode-${inst.type_mode}`}>
                {TYPE_MODE_LABELS[inst.type_mode]}
              </span>
            )}
            <span className="instance-card-url">{inst.url || <em style={{ color: 'var(--text-3)' }}>No URL set</em>}</span>
            <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => startEdit(inst)} title="Edit">
                <Pencil size={13} />
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(inst.id)} title="Remove"
                style={{ color: 'var(--text-3)' }}>
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        )
      })}

      <button className="btn btn-ghost btn-sm" onClick={handleAdd}
        style={{ marginTop: 8, color: 'var(--text-3)', width: '100%', justifyContent: 'center', borderStyle: 'dashed' }}>
        <Plus size={13} /> Add {arrType === 'sonarr' ? 'Sonarr' : 'Radarr'} Instance
      </button>
    </div>
  )
}

// ── Change password ────────────────────────────────────────────────────────────

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
