import Link from 'next/link'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()

  function handleLogout() {
    logout()
    // reload to update UI
    window.location.href = '/'
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-red-600 to-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-lg shadow-red-500/20">C</div>
          <div className="leading-tight">
            <span className="text-lg font-semibold tracking-wide">Carshop</span>
            <p className="text-xs text-gray-400">Performance Parts</p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/repuestos/new" className="text-sm text-gray-200 hover:text-orange-400">+ Nuevo</Link>
              <Link href="/mi-cuenta" className="text-sm text-gray-200 hover:text-orange-400">Mi cuenta</Link>
              <span className="text-sm text-gray-400">Hola, {user.username}</span>
              <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300">Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-200 hover:text-orange-400">Login</Link>
              <Link href="/register" className="text-sm text-white bg-gradient-to-r from-red-600 to-orange-500 px-3 py-1 rounded-md hover:opacity-95 shadow-lg shadow-red-500/20">Registrarse</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
