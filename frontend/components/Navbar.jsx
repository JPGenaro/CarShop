import Link from 'next/link'
import { useState } from 'react'
import { ShoppingCart, Heart, GitCompare, Menu, X, User, LogOut, Settings, Home, PlusCircle, LogIn, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useCompare } from '../context/CompareContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { items } = useCart()
  const { count: compareCount } = useCompare()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const count = items.reduce((acc, i) => acc + i.qty, 0)

  function handleLogout() {
    logout()
    window.location.href = '/'
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-red-600 to-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-lg shadow-red-500/20">C</div>
            <div className="leading-tight">
              <span className="text-lg font-semibold tracking-wide">Carshop</span>
              <p className="text-xs text-gray-400 hidden sm:block">Performance Parts</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-4">
            <Link href="/#repuestos" className="flex items-center gap-2 text-sm text-gray-200 hover:text-orange-400">
              <Home size={18} />
              Inicio
            </Link>
            <Link href="/comparar" className="relative flex items-center gap-2 text-sm text-gray-200 hover:text-orange-400">
              <GitCompare size={18} />
              Comparar
              {compareCount > 0 && (
                <span className="absolute -top-2 -right-3 text-xs bg-gradient-to-r from-red-600 to-orange-500 text-white px-1.5 py-0.5 rounded-full">
                  {compareCount}
                </span>
              )}
            </Link>
            {user && (
              <Link href="/favoritos" className="flex items-center gap-2 text-sm text-gray-200 hover:text-orange-400">
                <Heart size={18} />
                Favoritos
              </Link>
            )}
            <Link href="/carrito" className="relative flex items-center gap-2 text-sm text-gray-200 hover:text-orange-400">
              <ShoppingCart size={18} />
              Carrito
              {count > 0 && (
                <span className="absolute -top-2 -right-3 text-xs bg-gradient-to-r from-red-600 to-orange-500 text-white px-1.5 py-0.5 rounded-full">
                  {count}
                </span>
              )}
            </Link>
            {user?.is_staff && (
              <Link href="/admin/assistant" className="flex items-center gap-2 text-sm text-gray-200 hover:text-orange-400">
                <Settings size={18} />
                Asistente IA
              </Link>
            )}
            {user ? (
              <>
                {user?.is_staff && (
                  <Link href="/repuestos/new" className="flex items-center gap-2 text-sm text-gray-200 hover:text-orange-400">
                    <PlusCircle size={18} />
                    Nuevo
                  </Link>
                )}
                <Link href="/mi-cuenta" className="flex items-center gap-2 text-sm text-gray-200 hover:text-orange-400">
                  <User size={18} />
                  Mi cuenta
                </Link>
                <span className="text-sm text-gray-400">Hola, {user.username}</span>
                <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300">Cerrar sesión</button>
              </>
            ) : (
              <>
                <Link href="/login" className="flex items-center gap-2 text-sm text-gray-200 hover:text-orange-400">
                  <LogIn size={18} />
                  Login
                </Link>
                <Link href="/register" className="flex items-center gap-2 text-sm text-white bg-gradient-to-r from-red-600 to-orange-500 px-3 py-1 rounded-md hover:opacity-95 shadow-lg shadow-red-500/20">
                  <UserPlus size={18} />
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile Icons + Hamburger */}
          <div className="flex lg:hidden items-center gap-3">
            <Link href="/carrito" className="relative">
              <ShoppingCart size={20} className="text-gray-200" />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 text-xs bg-gradient-to-r from-red-600 to-orange-500 text-white px-1.5 py-0.5 rounded-full">
                  {count}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-200 hover:text-orange-400"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 py-4 border-t border-white/10 space-y-3">
            <Link href="/#repuestos" className="flex items-center gap-2 py-2 text-gray-200 hover:text-orange-400" onClick={() => setMobileMenuOpen(false)}>
              <Home size={18} />
              Inicio
            </Link>
            <Link href="/comparar" className="flex items-center justify-between py-2 text-gray-200 hover:text-orange-400" onClick={() => setMobileMenuOpen(false)}>
              <span className="flex items-center gap-2">
                <GitCompare size={18} />
                Comparar
              </span>
              {compareCount > 0 && (
                <span className="text-xs bg-gradient-to-r from-red-600 to-orange-500 text-white px-2 py-0.5 rounded-full">
                  {compareCount}
                </span>
              )}
            </Link>
            {user && (
              <Link href="/favoritos" className="flex items-center gap-2 py-2 text-gray-200 hover:text-orange-400" onClick={() => setMobileMenuOpen(false)}>
                <Heart size={18} />
                Favoritos
              </Link>
            )}
            {user?.is_staff && (
              <>
                <Link href="/admin/assistant" className="flex items-center gap-2 py-2 text-gray-200 hover:text-orange-400" onClick={() => setMobileMenuOpen(false)}>
                  <Settings size={18} />
                  Asistente IA
                </Link>
                <Link href="/repuestos/new" className="flex items-center gap-2 py-2 text-gray-200 hover:text-orange-400" onClick={() => setMobileMenuOpen(false)}>
                  <PlusCircle size={18} />
                  Nuevo Producto
                </Link>
              </>
            )}
            {user ? (
              <>
                <Link href="/mi-cuenta" className="flex items-center gap-2 py-2 text-gray-200 hover:text-orange-400" onClick={() => setMobileMenuOpen(false)}>
                  <User size={18} />
                  Mi cuenta
                </Link>
                <div className="py-2 text-sm text-gray-400">Hola, {user.username}</div>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="flex items-center gap-2 w-full text-left py-2 text-red-400 hover:text-red-300">
                  <LogOut size={18} />
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="flex items-center gap-2 py-2 text-gray-200 hover:text-orange-400" onClick={() => setMobileMenuOpen(false)}>
                  <LogIn size={18} />
                  Login
                </Link>
                <Link href="/register" className="flex items-center gap-2 justify-center text-white bg-gradient-to-r from-red-600 to-orange-500 px-4 py-2 rounded-md shadow-lg shadow-red-500/20" onClick={() => setMobileMenuOpen(false)}>
                  <UserPlus size={18} />
                  Registrarse
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
