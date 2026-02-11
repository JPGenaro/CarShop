import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getAccessToken, logout, fetchWithAuth } from '../lib/auth'

export default function Navbar() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = getAccessToken()
    if (!token) return
    // fetch current user
    fetchWithAuth('/auth/me/', {
      method: 'GET',
    }).then(res => res.json()).then(data => setUser(data)).catch(() => setUser(null))
  }, [])

  function handleLogout() {
    logout()
    setUser(null)
    // reload to update UI
    window.location.href = '/'
  }

  return (
    <nav className="bg-white shadow">
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-semibold">
          Carshop
        </Link>
        <div>
          {user ? (
            <>
              <span className="mr-4 text-sm text-gray-700">Hola, {user.username}</span>
              <button onClick={handleLogout} className="text-sm text-red-600">Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link href="/login" className="mr-4 text-sm text-gray-600">Login</Link>
              <Link href="/register" className="text-sm text-gray-600">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
