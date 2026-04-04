import { useState, useEffect } from 'react'
import { AlertTriangle, Zap, Loader, LogOut, KeyRound, Server, Database, User, Plus, Trash2, Pencil } from 'lucide-react'
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

function TVDBLogo({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 54" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path d="M0,5.096C0,1.81 2.964-0.441 6.462,0.073L52.101,6.035C54.153,6.337 55.787,8.547 55.787,10.954L55.787,17.184C51.941,19.761 49.42,24.074 49.42,28.96C49.42,33.892 51.88,38.168 55.787,40.736L55.787,43.476C55.787,45.883 54.153,48.093 52.101,48.395L11.603,53.927C8.104,54.442 5.141,52.19 5.141,48.904L5.141,5.096ZM19.68,10.822L13.661,10.822L13.661,18.706L9.842,18.706L9.842,23.262L13.661,23.262L13.661,32.023C13.485,37.527 15.647,39.992 20.615,40.039L25.251,40.039L25.251,35.483L22.871,35.483C20.175,35.352 19.591,34.563 19.681,31.015L19.681,23.262L27.08,23.262L33.934,40.038L40.403,40.038L49.837,18.706L43.457,18.706L37.348,33.381L31.777,18.706L19.68,18.706L19.68,10.822Z" fill="#6CD591" fillRule="nonzero"/>
      <path d="M88.61,18.277C92.518,18.277 95.123,19.241 97.1,21.431C98.717,23.183 99.571,25.768 99.571,28.658C99.571,32.863 97.864,36.149 94.764,38.032C92.742,39.259 90.991,39.609 87.037,39.609L77.244,39.609L77.244,10.393L83.264,10.393L83.264,18.277L88.61,18.277ZM83.264,35.054L87.711,35.054C91.26,35.054 93.416,32.688 93.416,28.833C93.416,24.804 91.53,22.832 87.711,22.832L83.264,22.832L83.264,35.054Z" fill="#FFFFFF" fillRule="nonzero"/>
      <path d="M68.014,10.393L74.034,10.393L74.034,39.609L63.656,39.609C59.434,39.609 57.412,38.996 55.255,37.113C53.054,35.142 51.931,32.338 51.931,28.79C51.931,25.11 53.144,22.307 55.705,20.248C57.322,18.934 59.524,18.277 62.354,18.277L68.014,18.277L68.014,10.393ZM68.014,22.833L63.656,22.833C60.152,22.833 58.041,25.067 58.041,28.79C58.041,32.688 60.197,35.054 63.656,35.054L68.014,35.054L68.014,22.833Z" fill="#FFFFFF" fillRule="nonzero"/>
    </svg>
  )
}

function TMDBLogo({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 185.04 133.4" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id="tmdb_grad" y1="66.7" x2="185.04" y2="66.7" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#90cea1"/>
          <stop offset="0.56" stopColor="#3cbec9"/>
          <stop offset="1" stopColor="#00b3e5"/>
        </linearGradient>
      </defs>
      <path fill="url(#tmdb_grad)" d="M51.06,66.7h0A17.67,17.67,0,0,1,68.73,49h-.1A17.67,17.67,0,0,1,86.3,66.7h0A17.67,17.67,0,0,1,68.63,84.37h.1A17.67,17.67,0,0,1,51.06,66.7Zm82.67-31.33h32.9A17.67,17.67,0,0,0,184.3,17.7h0A17.67,17.67,0,0,0,166.63,0h-32.9A17.67,17.67,0,0,0,116.06,17.7h0A17.67,17.67,0,0,0,133.73,35.37Zm-113,98h63.9A17.67,17.67,0,0,0,102.3,115.7h0A17.67,17.67,0,0,0,84.63,98H20.73A17.67,17.67,0,0,0,3.06,115.7h0A17.67,17.67,0,0,0,20.73,133.37Zm83.92-49h6.25L125.5,49h-8.35l-8.9,23.2h-.1L99.4,49H90.5Zm32.45,0h7.8V49h-7.8Zm22.2,0h24.95V77.2H167.1V70h15.35V62.8H167.1V56.2h16.25V49h-24ZM10.1,35.4h7.8V6.9H28V0H0V6.9H10.1ZM39,35.4h7.8V20.1H61.9V35.4h7.8V0H61.9V13.2H46.75V0H39Zm41.25,0h25V28.2H88V21h15.35V13.8H88V7.2h16.25V0h-24Zm-79,49H9V57.25h.1l9,27.15H24l9.3-27.15h.1V84.4h7.8V49H29.45l-8.2,23.1h-.1L13,49H1.2Zm112.09,49H126a24.59,24.59,0,0,0,7.56-1.15,19.52,19.52,0,0,0,6.35-3.37,16.37,16.37,0,0,0,4.37-5.5A16.91,16.91,0,0,0,146,115.8a18.5,18.5,0,0,0-1.68-8.25,15.1,15.1,0,0,0-4.52-5.53A18.55,18.55,0,0,0,133.07,99,33.54,33.54,0,0,0,125,98H113.29Zm7.81-28.2h4.6a17.43,17.43,0,0,1,4.67.62,11.68,11.68,0,0,1,3.88,1.88,9,9,0,0,1,2.62,3.18,9.87,9.87,0,0,1,1,4.52,11.92,11.92,0,0,1-1,5.08,8.69,8.69,0,0,1-2.67,3.34,10.87,10.87,0,0,1-4,1.83,21.57,21.57,0,0,1-5,.55H121.1Zm36.14,28.2h14.5a23.11,23.11,0,0,0,4.73-.5,13.38,13.38,0,0,0,4.27-1.65,9.42,9.42,0,0,0,3.1-3,8.52,8.52,0,0,0,1.2-4.68,9.16,9.16,0,0,0-.55-3.2,7.79,7.79,0,0,0-1.57-2.62,8.38,8.38,0,0,0-2.45-1.85,10,10,0,0,0-3.18-1v-.1a9.28,9.28,0,0,0,4.43-2.82,7.42,7.42,0,0,0,1.67-5,8.34,8.34,0,0,0-1.15-4.65,7.88,7.88,0,0,0-3-2.73,12.9,12.9,0,0,0-4.17-1.3,34.42,34.42,0,0,0-4.63-.32h-13.2Zm7.8-28.8h5.3a10.79,10.79,0,0,1,1.85.17,5.77,5.77,0,0,1,1.7.58,3.33,3.33,0,0,1,1.23,1.13,3.22,3.22,0,0,1,.47,1.82,3.63,3.63,0,0,1-.42,1.8,3.34,3.34,0,0,1-1.13,1.2,4.78,4.78,0,0,1-1.57.65,8.16,8.16,0,0,1-1.78.2H165Zm0,14.15h5.9a15.12,15.12,0,0,1,2.05.15,7.83,7.83,0,0,1,2,.55,4,4,0,0,1,1.58,1.17,3.13,3.13,0,0,1,.62,2,3.71,3.71,0,0,1-.47,1.95,4,4,0,0,1-1.23,1.3,4.78,4.78,0,0,1-1.67.7,8.91,8.91,0,0,1-1.83.2h-7Z"/>
    </svg>
  )
}

function FanartTvLogo({ size = 18 }) {
  // No official SVG exists; using a branded "F" badge in their orange
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <rect width="40" height="40" rx="7" fill="#ffa800"/>
      <path fill="white" d="M10 9h20v6H16v5h12v6H16v10h-6z"/>
    </svg>
  )
}

function AniListLogo({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 172 172" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path fillRule="evenodd" fill="#02a9ff" d="m85 48.7c0 0.1 30.7 88.7 30.8 88.7 15.4 0 32.3 0 32.3 0 4 0 6.2-2.3 6.2-6.3v-13.7c0-4-2.2-6.2-6.2-6.2h-36.8v-70.2c0-4-2.2-6.2-6.2-6.2h-13.7c-4.1 0-6.3 2.2-6.3 6.2 0 0-0.1 7.2-0.1 7.7z"/>
      <path fillRule="evenodd" fill="#fefefe" d="m80.8 34.8l35.9 102.6h-27.8l-6-17.8h-30.5l-6.1 17.8h-28l36.1-102.6zm-3.8 62.1l-9.5-28.4-8.8 28.4z"/>
    </svg>
  )
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
  const [anilistFuzzySearch, setAnilistFuzzySearch] = useState(false)
  const [sonarrInstances, setSonarrInstances] = useState([])
  const [radarrInstances, setRadarrInstances] = useState([])
  const [instanceStatus, setInstanceStatus] = useState({})
  const [loading, setLoading] = useState(true)
  const [purgeFavsEnabled, setPurgeFavsEnabled] = useState(false)
  const [purgeLibEnabled, setPurgeLibEnabled] = useState(false)
  const [confirmPurge, setConfirmPurge] = useState(null) // 'favs' | 'library'
  const [purging, setPurging] = useState(false)

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
        if (data.anilist_fuzzy_search !== undefined) setAnilistFuzzySearch(data.anilist_fuzzy_search)
        if (Array.isArray(data.sonarr_instances)) setSonarrInstances(data.sonarr_instances)
        if (Array.isArray(data.radarr_instances)) setRadarrInstances(data.radarr_instances)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const saveSetting = async (key, value) => {
    try {
      await api.saveSettings({ [key]: value })
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  const saveFormField = (key) => () => saveSetting(key, form[key])

  const toggleAnilist = (v) => { setAnilistEnabled(v); saveSetting('anilist_enabled', v) }
  const toggleFuzzy = (v) => { setAnilistFuzzySearch(v); saveSetting('anilist_fuzzy_search', v) }

  const moveProvider = (idx, dir) => {
    setProviderOrder(prev => {
      const next = [...prev]
      const swap = idx + dir
      if (swap < 0 || swap >= next.length) return prev
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      saveSetting('provider_order', JSON.stringify(next))
      return next
    })
  }

  const handlePurge = async (type) => {
    setConfirmPurge(null)
    setPurging(true)
    try {
      if (type === 'favs') { await api.purgeFavourites(); toast('Favourites and collections cleared', 'success') }
      else { await api.purgeLibrary(); toast('Library data cleared', 'success') }
      setPurgeFavsEnabled(false)
      setPurgeLibEnabled(false)
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setPurging(false)
    }
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
                <TVDBLogo /> TheTVDB
              </div>
              <div className="form-field">
                <label className="form-label">API Key</label>
                <input className="form-input" type="password" value={form.tvdb_api_key} onChange={set('tvdb_api_key')} onBlur={saveFormField('tvdb_api_key')}
                  placeholder="Your TheTVDB v4 API key" />
                <div className="form-hint">
                  Get a free key at <a href="https://www.thetvdb.com/api-information" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-2)' }}>thetvdb.com/api-information</a>
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">PIN (optional)</label>
                <input className="form-input" value={form.tvdb_pin} onChange={set('tvdb_pin')} onBlur={saveFormField('tvdb_pin')}
                  placeholder="Subscriber PIN if applicable" />
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-section-title">
                <TMDBLogo /> The Movie Database (TMDB)
              </div>
              <div className="form-field">
                <label className="form-label">API Key (v3)</label>
                <input className="form-input" type="password" value={form.tmdb_api_key} onChange={set('tmdb_api_key')} onBlur={saveFormField('tmdb_api_key')}
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
                <FanartTvLogo /> Fanart.tv
              </div>
              <div className="form-field">
                <label className="form-label">API Key</label>
                <input className="form-input" type="password" value={form.fanart_api_key} onChange={set('fanart_api_key')} onBlur={saveFormField('fanart_api_key')}
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
                <AniListLogo /> AniList
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>
                    Fetch anime artwork from AniList
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
                    Fetches posters and banners for anime. Looks up the MAL ID from TVDB metadata and community mapping files, then queries AniList by that ID. No API key required.
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={anilistEnabled}
                  onClick={() => toggleAnilist(!anilistEnabled)}
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-soft)' }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>
                    Fuzzy title search fallback
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
                    If no MAL ID is found, search AniList by title instead. Useful for newer anime not yet in the mapping files, but may return wrong results for ambiguous titles.
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={anilistFuzzySearch}
                  onClick={() => toggleFuzzy(!anilistFuzzySearch)}
                  style={{
                    flexShrink: 0, width: 40, height: 22, borderRadius: 11,
                    background: anilistFuzzySearch ? 'var(--accent)' : 'var(--bg-4)',
                    border: '1px solid ' + (anilistFuzzySearch ? 'var(--accent)' : 'var(--border)'),
                    cursor: 'pointer', position: 'relative', transition: 'background 0.2s, border-color 0.2s',
                  }}
                >
                  <span style={{
                    position: 'absolute', top: 2, left: anilistFuzzySearch ? 20 : 2,
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

          <div className="settings-section" style={{ marginTop: 24, maxWidth: '100%', borderColor: 'var(--red)', borderWidth: 1, borderStyle: 'solid' }}>
            <div className="settings-section-title" style={{ color: 'var(--red)' }}>
              <AlertTriangle size={14} /> Danger Zone
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Purge favourites */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>Purge all favourites and collections</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6, marginBottom: 10 }}>
                    Permanently deletes every starred item and all collections. A new empty default collection will be recreated. This cannot be undone.
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-2)', cursor: 'pointer', userSelect: 'none' }}>
                    <input type="checkbox" checked={purgeFavsEnabled} onChange={e => setPurgeFavsEnabled(e.target.checked)} />
                    I understand this action is irreversible
                  </label>
                </div>
                <button
                  className="btn btn-danger btn-sm"
                  style={{ flexShrink: 0, marginTop: 2 }}
                  disabled={!purgeFavsEnabled || purging}
                  onClick={() => setConfirmPurge('favs')}
                >
                  <Trash2 size={13} /> Purge Favourites
                </button>
              </div>

              <div style={{ borderTop: '1px solid var(--border-soft)' }} />

              {/* Purge library */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>Purge all library data</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6, marginBottom: 10 }}>
                    Permanently deletes all media items, fetched fanart, and favourites. Your Sonarr/Radarr connections and API keys are kept. You will need to re-sync your library. This cannot be undone.
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-2)', cursor: 'pointer', userSelect: 'none' }}>
                    <input type="checkbox" checked={purgeLibEnabled} onChange={e => setPurgeLibEnabled(e.target.checked)} />
                    I understand this action is irreversible
                  </label>
                </div>
                <button
                  className="btn btn-danger btn-sm"
                  style={{ flexShrink: 0, marginTop: 2 }}
                  disabled={!purgeLibEnabled || purging}
                  onClick={() => setConfirmPurge('library')}
                >
                  <Trash2 size={13} /> Purge Library
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Purge confirmation modal */}
      {confirmPurge && (
        <div className="modal-overlay" onClick={() => setConfirmPurge(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title" style={{ color: 'var(--red)' }}>
              <AlertTriangle size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
              {confirmPurge === 'favs' ? 'Purge all favourites and collections?' : 'Purge all library data?'}
            </h3>
            <p className="modal-body">
              {confirmPurge === 'favs'
                ? 'This will permanently delete every starred item and all collections. A new empty default collection will be recreated.'
                : 'This will permanently delete all media items, fanart, and favourites. You will need to re-sync your library from Sonarr/Radarr.'}
              {' '}<strong>This cannot be undone.</strong>
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirmPurge(null)}>Cancel</button>
              <button className="btn btn-danger btn-sm" onClick={() => handlePurge(confirmPurge)}>
                Yes, permanently delete
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
