import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

const FavoritesContext = createContext()

export function useFavorites() {
  return useContext(FavoritesContext)
}

export function FavoritesProvider({ children }) {
  const { token } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token) {
      fetchFavorites()
    } else {
      setFavorites([])
    }
  }, [token])

  async function fetchFavorites() {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/favorites/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setFavorites(data.results || data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function addFavorite(repuestoId) {
    if (!token) return false
    try {
      const res = await fetch(`${API_BASE}/favorites/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ repuesto: repuestoId }),
      })
      if (res.ok) {
        await fetchFavorites()
        return true
      }
    } catch (e) {
      console.error(e)
    }
    return false
  }

  async function removeFavorite(repuestoId) {
    if (!token) return false
    try {
      const res = await fetch(`${API_BASE}/favorites/remove/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ repuesto: repuestoId }),
      })
      if (res.ok) {
        await fetchFavorites()
        return true
      }
    } catch (e) {
      console.error(e)
    }
    return false
  }

  function isFavorite(repuestoId) {
    return favorites.some(f => f.repuesto === repuestoId)
  }

  const value = {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
    refetch: fetchFavorites,
  }

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}
