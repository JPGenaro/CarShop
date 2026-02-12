import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import RequireAuth from '../components/RequireAuth'
import { useAuth } from '../context/AuthContext'
import { fetchWithAuth } from '../lib/auth'

export default function MiCuenta() {
  const { user } = useAuth()
  const [profile, setProfile] = useState({
    phone: '',
    dni: '',
    address_line1: '',
    address_line2: '',
    city: '',
    province: '',
    postal_code: '',
    country: 'Argentina',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [orders, setOrders] = useState([])
  const [notifications, setNotifications] = useState([])
  const [fieldErrors, setFieldErrors] = useState({})

  function onlyDigits(value) {
    return value.replace(/\D/g, '')
  }

  function validate() {
    const errors = {}
    if (!profile.phone || profile.phone.length < 7) errors.phone = 'Teléfono entre 7 y 15 dígitos.'
    if (!profile.dni || profile.dni.length < 7) errors.dni = 'DNI entre 7 y 12 dígitos.'
    if (!profile.address_line1) errors.address_line1 = 'Dirección requerida.'
    if (!profile.city) errors.city = 'Ciudad requerida.'
    if (!profile.province) errors.province = 'Provincia requerida.'
    if (!profile.postal_code || profile.postal_code.length < 3) errors.postal_code = 'Código postal inválido.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchWithAuth('/auth/profile/')
        if (!res.ok) throw new Error('No se pudo cargar el perfil')
        const data = await res.json()
        setProfile({
          phone: data.phone || '',
          dni: data.dni || '',
          address_line1: data.address_line1 || '',
          address_line2: data.address_line2 || '',
          city: data.city || '',
          province: data.province || '',
          postal_code: data.postal_code || '',
          country: data.country || 'Argentina',
        })
      } catch (e) {
        setError('No se pudo cargar el perfil')
      }
    }
    load()
  }, [])

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetchWithAuth('/orders/')
        if (!res.ok) throw new Error('No se pudo cargar órdenes')
        const data = await res.json()
        setOrders(data.results || data)
      } catch (e) {
        setOrders([])
      }
    }
    loadOrders()
  }, [])

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await fetchWithAuth('/notifications/')
        if (!res.ok) throw new Error('No se pudo cargar notificaciones')
        const data = await res.json()
        setNotifications(data.results || data)
      } catch (e) {
        setNotifications([])
      }
    }
    loadNotifications()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    if (!validate()) {
      setSaving(false)
      return
    }
    try {
      const res = await fetchWithAuth('/auth/profile/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
      if (!res.ok) throw new Error('Error actualizando')
      const data = await res.json()
      setProfile(data)
    } catch (e) {
      setError('No se pudo actualizar el perfil')
    } finally {
      setSaving(false)
    }
  }

  return (
    <RequireAuth>
      <div className="min-h-screen flex flex-col bg-[#121212]">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold mb-6">Mi cuenta</h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <p className="text-gray-300"><strong>Usuario:</strong> {user?.username}</p>
              <p className="mt-2 text-gray-300"><strong>Email:</strong> {user?.email || '—'}</p>
            </div>

            <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-100">Datos de envío</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  value={profile?.phone || ''}
                  onChange={e => setProfile(prev => ({ ...prev, phone: onlyDigits(e.target.value) }))}
                  className={`bg-black/40 border ${fieldErrors.phone ? 'border-red-500/60' : 'border-white/10'} rounded-xl px-4 py-2 text-gray-100`}
                  placeholder="Teléfono"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={15}
                />
                <input
                  value={profile?.dni || ''}
                  onChange={e => setProfile(prev => ({ ...prev, dni: onlyDigits(e.target.value) }))}
                  className={`bg-black/40 border ${fieldErrors.dni ? 'border-red-500/60' : 'border-white/10'} rounded-xl px-4 py-2 text-gray-100`}
                  placeholder="DNI"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={12}
                />
              </div>
              {(fieldErrors.phone || fieldErrors.dni) && (
                <p className="text-sm text-red-400">{fieldErrors.phone || fieldErrors.dni}</p>
              )}
              <input
                value={profile?.address_line1 || ''}
                onChange={e => setProfile(prev => ({ ...prev, address_line1: e.target.value }))}
                className={`bg-black/40 border ${fieldErrors.address_line1 ? 'border-red-500/60' : 'border-white/10'} rounded-xl px-4 py-2 text-gray-100 w-full`}
                placeholder="Calle y número"
                maxLength={200}
              />
              {fieldErrors.address_line1 && <p className="text-sm text-red-400">{fieldErrors.address_line1}</p>}
              <input
                value={profile?.address_line2 || ''}
                onChange={e => setProfile(prev => ({ ...prev, address_line2: e.target.value }))}
                className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-gray-100 w-full"
                placeholder="Piso / Depto (opcional)"
                maxLength={200}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  value={profile?.city || ''}
                  onChange={e => setProfile(prev => ({ ...prev, city: e.target.value }))}
                  className={`bg-black/40 border ${fieldErrors.city ? 'border-red-500/60' : 'border-white/10'} rounded-xl px-4 py-2 text-gray-100`}
                  placeholder="Ciudad"
                  maxLength={100}
                />
                <input
                  value={profile?.province || ''}
                  onChange={e => setProfile(prev => ({ ...prev, province: e.target.value }))}
                  className={`bg-black/40 border ${fieldErrors.province ? 'border-red-500/60' : 'border-white/10'} rounded-xl px-4 py-2 text-gray-100`}
                  placeholder="Provincia"
                  maxLength={100}
                />
                <input
                  value={profile?.postal_code || ''}
                  onChange={e => setProfile(prev => ({ ...prev, postal_code: onlyDigits(e.target.value) }))}
                  className={`bg-black/40 border ${fieldErrors.postal_code ? 'border-red-500/60' : 'border-white/10'} rounded-xl px-4 py-2 text-gray-100`}
                  placeholder="Código Postal"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={10}
                />
              </div>
              {(fieldErrors.city || fieldErrors.province || fieldErrors.postal_code) && (
                <p className="text-sm text-red-400">{fieldErrors.city || fieldErrors.province || fieldErrors.postal_code}</p>
              )}
              <input
                value={profile?.country || 'Argentina'}
                disabled
                className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-gray-400 w-full"
              />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button disabled={saving} className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 py-2 rounded-md shadow-lg shadow-red-500/20">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </form>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <h2 className="text-xl font-semibold text-gray-100">Historial de compras</h2>
              {orders.length === 0 ? (
                <p className="mt-3 text-gray-400">No tenés compras todavía.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {orders.map(order => (
                    <Link key={order.id} href={`/pedidos/${order.id}`} className="block border border-white/10 rounded-xl p-4 text-gray-300 hover:border-orange-400/50">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span>Orden #{order.id}</span>
                        <span className="text-orange-300">{order.status}</span>
                      </div>
                      <div className="text-sm text-gray-400">Total: ${Number(order.total || 0).toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString()}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <h2 className="text-xl font-semibold text-gray-100">Notificaciones</h2>
              {notifications.length === 0 ? (
                <p className="mt-3 text-gray-400">No hay notificaciones.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {notifications.map(n => (
                    <div key={n.id} className="border border-white/10 rounded-xl p-4 text-gray-300">
                      <div className="text-sm text-gray-200">{n.message}</div>
                      <div className="text-xs text-gray-500 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </RequireAuth>
  )
}
