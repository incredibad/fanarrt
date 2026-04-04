const BASE = '/api'

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include', // always send session cookie
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

export const api = {
  // Auth
  getAuthStatus: () => apiFetch('/auth/status'),
  setup: (username, password) =>
    apiFetch('/auth/setup', { method: 'POST', body: JSON.stringify({ username, password }) }),
  login: (username, password) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
  changePassword: (currentPassword, newPassword) =>
    apiFetch('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }),

  // Settings
  getSettings: () => apiFetch('/settings'),
  saveSettings: (data) => apiFetch('/settings', { method: 'POST', body: JSON.stringify(data) }),
  testConnection: (svc) => apiFetch(`/settings/test/${svc}`, { method: 'POST' }),
  testInstanceConnection: (url, apiKey) =>
    apiFetch('/settings/test-connection', { method: 'POST', body: JSON.stringify({ url, api_key: apiKey }) }),
  testSavedInstance: (arrType, instanceId) =>
    apiFetch(`/settings/test-instance/${arrType}/${instanceId}`, { method: 'POST' }),
  purgeFavourites: () => apiFetch('/settings/purge/favourites', { method: 'POST' }),
  purgeLibrary: () => apiFetch('/settings/purge/library', { method: 'POST' }),

  // Library
  getLibrary: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return apiFetch(`/library?${q}`)
  },
  getItem: (id) => apiFetch(`/library/${id}`),
  getItemFanart: (id, params = {}) => {
    const q = new URLSearchParams(params).toString()
    return apiFetch(`/library/${id}/fanart?${q}`)
  },
  syncLibrary: () => apiFetch('/library/sync', { method: 'POST' }),
  fetchItemFanart: (id) => apiFetch(`/library/${id}/fetch-fanart`, { method: 'POST' }),
  fetchAllFanart: () => apiFetch('/library/fetch-all-fanart', { method: 'POST' }),
  needsRefresh: (id) => apiFetch(`/library/${id}/needs-refresh`),

  // Collections
  getCollections: () => apiFetch('/collections'),
  createCollection: (name) =>
    apiFetch('/collections', { method: 'POST', body: JSON.stringify({ name }) }),
  deleteCollection: (id) => apiFetch(`/collections/${id}`, { method: 'DELETE' }),
  renameCollection: (id, name) =>
    apiFetch(`/collections/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) }),

  // Favourites
  getFavourites: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return apiFetch(`/favourites?${q}`)
  },
  addFavourite: (fanart_id, media_item_id, collection_id) =>
    apiFetch('/favourites', { method: 'POST', body: JSON.stringify({ fanart_id, media_item_id, collection_id }) }),
  removeFavourite: (id) => apiFetch(`/favourites/${id}`, { method: 'DELETE' }),
  getFanartCollections: (fanartId) => apiFetch(`/favourites/for-fanart/${fanartId}`),
  getFavouriteStats: (collection_id) => {
    const q = collection_id ? `?collection_id=${collection_id}` : ''
    return apiFetch(`/favourites/stats${q}`)
  },
  downloadView: (fanart_ids, label) =>
    fetch('/api/favourites/download/view', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fanart_ids, label }),
    }),

  // Download URLs (used as href — session cookie is sent automatically by browser)
  downloadUrl: {
    all: '/api/favourites/download/all',
    shows: '/api/favourites/download/shows',
    movies: '/api/favourites/download/movies',
    item: (id) => `/api/favourites/download/${id}`,
    itemAll: (id) => `/api/library/${id}/download`,
  },
}
