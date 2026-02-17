import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { ShoppingCart, Heart, GitCompare, Menu, X, User, LogOut, Settings, Home, PlusCircle, LogIn, UserPlus, BarChart3, ChevronDown, Tag, TicketPercent } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useCompare } from '../context/CompareContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { items } = useCart()
  const { count: compareCount } = useCompare()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [adminMenuOpen, setAdminMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const adminMenuRef = useRef(null)
  const userMenuRef = useRef(null)
  const count = items.reduce((acc, i) => acc + i.qty, 0)

  useEffect(() => {
    function handleClickOutside(event) {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target)) {
        setAdminMenuOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
          <div className="hidden lg:flex items-center gap-6">
            <Link href="/#repuestos" className="flex items-center gap-2 text-sm text-gray-200 hover:text-orange-400 transition-colors">
              <Home size={18} />
              Inicio
            </Link>
            
            {user && (
              <Link href="/favoritos" className="flex items-center gap-2 text-sm text-gray-200 hover:text-orange-400 transition-colors">
                <Heart size={18} />
                Favoritos
              </Link>
            )}
            
            <Link href="/comparar" className="relative flex items-center gap-2 text-sm text-gray-200 hover:text-orange-400 transition-colors">
              <GitCompare size={18} />
              Comparar
              {compareCount > 0 && (
                <span className="absolute -top-2 -right-3 text-xs bg-gradient-to-r from-red-600 to-orange-500 text-white px-1.5 py-0.5 rounded-full">
                  {compareCount}
                </span>
              )}
            </Link>
            
            <Link href="/carrito" className="relative flex items-center gap-2 text-sm text-gray-200 hover:text-orange-400 transition-colors">
              <ShoppingCart size={18} />
              Carrito
              {count > 0 && (
                <span className="absolute -top-2 -right-3 text-xs bg-gradient-to-r from-red-600 to-orange-500 text-white px-1.5 py-0.5 rounded-full">
                  {count}
                </span>
              )}
            </Link>

            {/* Admin Dropdown */}
            {user?.is_staff && (
              <div className="relative" ref={adminMenuRef}>
                <button
                  onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                  className="flex items-center gap-2 text-sm text-gray-200 hover:text-orange-400 transition-colors"
                >
                  <Settings size={18} />
                  Admin
                  <ChevronDown size={14} className={`transition-transform ${adminMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {adminMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg border border-white/10 bg-black/95 backdrop-blur-xl shadow-xl">
                    <div className="py-2">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-white/5 hover:text-orange-400 transition-colors"
                        onClick={() => setAdminMenuOpen(false)}
                      >
                        <BarChart3 size={16} />
                        Dashboard
                      </Link>
                      <Link
                        href="/admin/assistant"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-white/5 hover:text-orange-400 transition-colors"
                        onClick={() => setAdminMenuOpen(false)}
                      >
                        <Settings size={16} />
                        Asistente IA
                      </Link>
                      <Link
                        href="/repuestos/new"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-white/5 hover:text-orange-400 transition-colors"
                        onClick={() => setAdminMenuOpen(false)}
                      >
                        <PlusCircle size={16} />
                        Nuevo Producto
                      </Link>
                      <Link
                        href="/categorias/new"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-white/5 hover:text-orange-400 transition-colors"
                        onClick={() => setAdminMenuOpen(false)}
                      >
                        <Tag size={16} />
                        Nueva Categoría
                      </Link>
                      <Link
                        href="/cupones"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-white/5 hover:text-orange-400 transition-colors"
                        onClick={() => setAdminMenuOpen(false)}
                      >
                        <TicketPercent size={16} />
                        Cupones
                      </Link>
                      <Link
                        href="/cupones/new"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-white/5 hover:text-orange-400 transition-colors"
                        onClick={() => setAdminMenuOpen(false)}
                      >
                        <TicketPercent size={16} />
                        Nuevo Cupón
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Menu */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-sm text-gray-200 hover:text-orange-400 transition-colors"
                >
                  <User size={18} />
                  {user.username}
                  <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg border border-white/10 bg-black/95 backdrop-blur-xl shadow-xl">
                    <div className="py-2">
                      <Link
                        href="/mi-cuenta"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-white/5 hover:text-orange-400 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User size={16} />
                        Mi Cuenta
                      </Link>
                      <div className="border-t border-white/10 my-1"></div>
                      <button
                        onClick={() => { handleLogout(); setUserMenuOpen(false); }}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors w-full text-left"
                      >
                        <LogOut size={16} />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="flex items-center gap-2 text-sm text-gray-200 hover:text-orange-400 transition-colors">
                  <LogIn size={18} />
                  Login
                </Link>
                <Link href="/register" className="flex items-center gap-2 text-sm text-white bg-gradient-to-r from-red-600 to-orange-500 px-4 py-2 rounded-lg hover:opacity-95 shadow-lg shadow-red-500/20 transition-opacity">
                  <UserPlus size={18} />
                  Registrarse
                </Link>
              </div>
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
                <Link href="/dashboard" className="flex items-center gap-2 py-2 text-gray-200 hover:text-orange-400" onClick={() => setMobileMenuOpen(false)}>
                  <BarChart3 size={18} />
                  Dashboard
                </Link>
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
