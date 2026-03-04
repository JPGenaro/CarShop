const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

export function saveTokens({ access, refresh }) {
  if (access) localStorage.setItem('access', access)
  if (refresh) localStorage.setItem('refresh', refresh)
}

export function getAccessToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access')
}

export function getRefreshToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('refresh')
}

export function logout() {
  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
}

export async function fetchWithAuth(path, opts = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`
  const headers = opts.headers ? { ...opts.headers } : {}
  const token = getAccessToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(url, { ...opts, headers })
  // If unauthorized and we have a refresh token, try to refresh once
  if (res.status === 401) {
    const refreshed = await tryRefresh()
    if (refreshed) {
      const token2 = getAccessToken()
      if (token2) headers['Authorization'] = `Bearer ${token2}`
      return fetch(url, { ...opts, headers })
    }
  }
  return res
}

async function tryRefresh() {
  const refresh = getRefreshToken()
  if (!refresh) return false
  try {
    const res = await fetch(`${API_BASE}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    })
    if (!res.ok) return false
    const data = await res.json()
    if (data.access) {
      saveTokens({ access: data.access, refresh: data.refresh || refresh })
      return true
    }
  } catch (e) {
    return false
  }
  return false
}

export async function login(username, password) {
  const res = await fetch(`${API_BASE}/auth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) throw new Error('Login failed')
  const data = await res.json()
  saveTokens({ access: data.access, refresh: data.refresh })
  return data
}

export async function register(payload) {
  const res = await fetch(`${API_BASE}/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw err
  }
  return res.json()
}
