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
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">C</div>
          <span className="text-lg font-semibold">Carshop</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-gray-700">Hola, {user.username}</span>
              <button onClick={handleLogout} className="text-sm text-red-600">Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-700 hover:text-blue-600">Login</Link>
              <Link href="/register" className="text-sm text-white bg-blue-600 px-3 py-1 rounded-md hover:opacity-95">Registrarse</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
