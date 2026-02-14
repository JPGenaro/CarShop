import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, Package } from 'lucide-react'
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
  const [expandedOrder, setExpandedOrder] = useState(null)

  const statusMap = {
    pending: 'Pendiente',
    paid: 'Pagado',
    shipped: 'Enviado',
    delivered: 'Entregado',
  }

  const provinces = [
    'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
    'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
    'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
    'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
    'Tierra del Fuego', 'Tucumán'
  ]

  const citiesByProvince = {
    'Buenos Aires': ['La Plata', 'Mar del Plata', 'Bahía Blanca', 'Tandil', 'Pergamino'],
    'CABA': ['CABA'],
    'Catamarca': ['San Fernando del Valle de Catamarca', 'Belén', 'Andalgalá'],
    'Chaco': ['Resistencia', 'Presidencia Roque Sáenz Peña', 'Villa Ángela'],
    'Chubut': ['Rawson', 'Comodoro Rivadavia', 'Trelew', 'Puerto Madryn'],
    'Córdoba': ['Córdoba', 'Villa Carlos Paz', 'Río Cuarto', 'Villa María'],
    'Corrientes': ['Corrientes', 'Goya', 'Mercedes'],
    'Entre Ríos': ['Paraná', 'Concordia', 'Gualeguaychú'],
    'Formosa': ['Formosa', 'Clorinda', 'Pirané'],
    'Jujuy': ['San Salvador de Jujuy', 'Palpalá', 'Perico'],
    'La Pampa': ['Santa Rosa', 'General Pico', 'Toay'],
    'La Rioja': ['La Rioja', 'Chilecito', 'Aimogasta'],
    'Mendoza': ['Mendoza', 'San Rafael', 'Godoy Cruz', 'Luján de Cuyo'],
    'Misiones': ['Posadas', 'Oberá', 'Eldorado'],
    'Neuquén': ['Neuquén', 'Cutral Có', 'Zapala'],
    'Río Negro': ['Viedma', 'Bariloche', 'General Roca'],
    'Salta': ['Salta', 'Orán', 'Tartagal'],
    'San Juan': ['San Juan', 'Rawson', 'Chimbas'],
    'San Luis': ['San Luis', 'Villa Mercedes', 'Merlo'],
    'Santa Cruz': ['Río Gallegos', 'Caleta Olivia', 'El Calafate'],
    'Santa Fe': ['Santa Fe', 'Rosario', 'Rafaela', 'Venado Tuerto'],
    'Santiago del Estero': ['Santiago del Estero', 'La Banda', 'Termas de Río Hondo'],
    'Tierra del Fuego': ['Ushuaia', 'Río Grande', 'Tolhuin'],
    'Tucumán': ['San Miguel de Tucumán', 'Tafí Viejo', 'Concepción'],
  }

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
                <select
                  value={profile?.province || ''}
                  onChange={e => setProfile(prev => ({ ...prev, province: e.target.value, city: '' }))}
                  className={`bg-black/40 border ${fieldErrors.province ? 'border-red-500/60' : 'border-white/10'} rounded-xl px-4 py-2 text-gray-100`}
                >
                  <option value="">Provincia</option>
                  {provinces.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <select
                  value={profile?.city || ''}
                  onChange={e => setProfile(prev => ({ ...prev, city: e.target.value }))}
                  className={`bg-black/40 border ${fieldErrors.city ? 'border-red-500/60' : 'border-white/10'} rounded-xl px-4 py-2 text-gray-100`}
                  disabled={!profile?.province}
                >
                  <option value="">Ciudad</option>
                  {(citiesByProvince[profile?.province] || []).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
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
                    <div key={order.id} className="border border-white/10 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        className="w-full p-4 text-left hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <Package size={20} className="text-orange-400" />
                            <div>
                              <div className="text-gray-200 font-semibold">Orden #{order.id}</div>
                              <div className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('es-AR')}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                              order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                              order.status === 'paid' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {statusMap[order.status] || 'Desconocido'}
                            </span>
                            {expandedOrder === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </div>
                        </div>
                        <div className="mt-2 text-lg font-bold text-orange-400">
                          ${Number(order.total || 0).toFixed(2)}
                        </div>
                      </button>
                      
                      {expandedOrder === order.id && (
                        <div className="border-t border-white/10 p-4 bg-black/20">
                          <h3 className="text-sm font-semibold text-gray-300 mb-3">Productos</h3>
                          <div className="space-y-2 mb-4">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-start text-sm">
                                <div className="flex-1">
                                  <div className="text-gray-200">{item.name}</div>
                                  <div className="text-xs text-gray-500">
                                    {[item.brand, item.model, item.year].filter(Boolean).join(' • ')}
                                  </div>
                                  <div className="text-xs text-gray-500">SKU: {item.sku}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-gray-300">x{item.qty}</div>
                                  <div className="text-gray-400">${Number(item.price).toFixed(2)}</div>
                                  <div className="font-semibold text-orange-400">
                                    ${(Number(item.price) * item.qty).toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="border-t border-white/10 pt-3 space-y-1 text-sm">
                            <div className="flex justify-between text-gray-400">
                              <span>Subtotal</span>
                              <span>${(Number(order.total) / 1.21 + Number(order.discount_amount || 0)).toFixed(2)}</span>
                            </div>
                            {order.discount_amount > 0 && (
                              <div className="flex justify-between text-green-400">
                                <span>Descuento {order.coupon_code && `(${order.coupon_code})`}</span>
                                <span>-${Number(order.discount_amount).toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-gray-400">
                              <span>IVA (21%)</span>
                              <span>${(Number(order.total) - Number(order.total) / 1.21).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-gray-100 pt-2 border-t border-white/10">
                              <span>Total</span>
                              <span className="text-orange-400">${Number(order.total).toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-white/10">
                            <h3 className="text-sm font-semibold text-gray-300 mb-2">Datos de envío</h3>
                            <div className="text-sm text-gray-400 space-y-1">
                              <div>{order.address_line1}</div>
                              {order.address_line2 && <div>{order.address_line2}</div>}
                              <div>{order.city}, {order.province}</div>
                              <div>CP: {order.postal_code}</div>
                              <div className="pt-2">DNI: {order.dni} • Tel: {order.phone}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
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
