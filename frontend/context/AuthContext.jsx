import React, { createContext, useContext, useEffect, useState } from 'react'
import { getAccessToken, login as apiLogin, logout as apiLogout, fetchWithAuth } from '../lib/auth'
import Spinner from '../components/Spinner'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchMe() {
    try {
      const res = await fetchWithAuth('/auth/me/')
      if (!res.ok) {
        setUser(null)
        return
      }
      const data = await res.json()
      setUser(data)
    } catch (e) {
      setUser(null)
    }
  }

  useEffect(() => {
    let mounted = true
    async function init() {
      if (!getAccessToken()) {
        if (mounted) setLoading(false)
        return
      }
      await fetchMe()
      if (mounted) setLoading(false)
    }
    init()
    return () => { mounted = false }
  }, [])

  async function login(username, password) {
    await apiLogin(username, password)
    await fetchMe()
  }

  function logout() {
    apiLogout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size={6} />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
