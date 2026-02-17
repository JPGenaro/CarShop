import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, ChevronDown, ChevronUp, Package, AlertCircle } from 'lucide-react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import RequireAuth from '../../components/RequireAuth'
import { useAuth } from '../../context/AuthContext'
import { fetchWithAuth } from '../../lib/auth'

export default function AdminPedidos() {
  const { user } = useAuth()
  const [pedidos, setPedidos] = useState([])
  const [filteredPedidos, setFilteredPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [updatingOrder, setUpdatingOrder] = useState(null)

  const statusMap = {
    pending: { label: 'Pendiente', bg: 'bg-gray-500/20', text: 'text-gray-400' },
    paid: { label: 'Pagado', bg: 'bg-orange-500/20', text: 'text-orange-400' },
    shipped: { label: 'Enviado', bg: 'bg-blue-500/20', text: 'text-blue-400' },
    delivered: { label: 'Entregado', bg: 'bg-green-500/20', text: 'text-green-400' },
  }

  useEffect(() => {
    loadPedidos()
  }, [])

  useEffect(() => {
    filterPedidos()
  }, [search, statusFilter, pedidos])

  async function loadPedidos() {
    try {
      setLoading(true)
      const res = await fetchWithAuth('/orders/')
      if (!res.ok) throw new Error('No se pudo cargar los pedidos')
      const data = await res.json()
      setPedidos(data.results || data)
    } catch (e) {
      console.error(e)
      setPedidos([])
    } finally {
      setLoading(false)
    }
  }

  function filterPedidos() {
    let filtered = pedidos

    if (search) {
      filtered = filtered.filter(p => {
        const searchLower = search.toLowerCase()
        return (
          p.user?.username?.toLowerCase().includes(searchLower) ||
          p.user?.email?.toLowerCase().includes(searchLower) ||
          p.id.toString().includes(search) ||
          p.address_line1?.toLowerCase().includes(searchLower)
        )
      })
    }

    if (statusFilter) {
      filtered = filtered.filter(p => p.status === statusFilter)
    }

    setFilteredPedidos(filtered)
  }

  async function updateOrderStatus(orderId, newStatus) {
    try {
      setUpdatingOrder(orderId)
      const res = await fetchWithAuth(`/orders/${orderId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Error actualizando estado')
      const updated = await res.json()
      setPedidos(prev => prev.map(p => p.id === orderId ? updated : p))
    } catch (e) {
      console.error(e)
    } finally {
      setUpdatingOrder(null)
    }
  }

  // Check admin
  if (user && !user.is_staff) {
    return (
      <RequireAuth>
        <div className="min-h-screen flex flex-col bg-[#121212]">
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-12 text-center">
            <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-100 mb-2">Acceso Denegado</h1>
            <p className="text-gray-400">Solo los administradores pueden acceder a esta página.</p>
          </main>
          <Footer />
        </div>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth>
      <div className="min-h-screen flex flex-col bg-[#121212]">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">📦 Gestión de Pedidos</h1>
            <p className="text-gray-400">Busca, filtra y actualiza el estado de los pedidos</p>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar por nombre, email, ID o dirección..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-gray-100 placeholder-gray-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-gray-100"
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="paid">Pagado</option>
              <option value="shipped">Enviado</option>
              <option value="delivered">Entregado</option>
            </select>

            <div className="text-sm text-gray-400 flex items-center justify-end">
              Mostrando {filteredPedidos.length} de {pedidos.length} pedidos
            </div>
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Cargando pedidos...</p>
            </div>
          ) : filteredPedidos.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-white/10 bg-white/5">
              <Package size={48} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">No se encontraron pedidos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPedidos.map(order => (
                <div
                  key={order.id}
                  className="rounded-xl border border-white/10 bg-white/5 overflow-hidden hover:bg-white/10 transition-colors"
                >
                  <button
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg font-bold text-orange-400">#{order.id}</span>
                          <span className={`text-xs px-2 py-1 rounded font-semibold ${statusMap[order.status]?.bg || 'bg-gray-500/20'} ${statusMap[order.status]?.text || 'text-gray-400'}`}>
                            {statusMap[order.status]?.label || 'Desconocido'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400">
                          <div>{order.user?.username} • {order.user?.email}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(order.created_at).toLocaleDateString('es-AR')} • ${Number(order.total).toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-bold text-orange-400">${Number(order.total).toFixed(2)}</div>
                          <div className="text-xs text-gray-500">{order.items?.length || 0} productos</div>
                        </div>
                        {expandedOrder === order.id ? (
                          <ChevronUp size={20} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={20} className="text-gray-400" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {expandedOrder === order.id && (
                    <div className="border-t border-white/10 p-4 bg-black/20 space-y-4">
                      {/* Productos */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-300 mb-2">Productos</h3>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs text-gray-400 pb-2 border-b border-white/5 last:border-0">
                              <div>
                                <div className="text-gray-200">{item.name}</div>
                                <div>SKU: {item.sku} • x{item.qty}</div>
                              </div>
                              <div className="text-right font-semibold text-orange-400">
                                ${Number(item.price * item.qty).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Detalles de Envío */}
                      <div className="border-t border-white/10 pt-4">
                        <h3 className="text-sm font-semibold text-gray-300 mb-2">Datos de Envío</h3>
                        <div className="text-xs text-gray-400 space-y-1">
                          <div><strong className="text-gray-300">{order.address_line1}</strong></div>
                          {order.address_line2 && <div>{order.address_line2}</div>}
                          <div>{order.city}, {order.province} {order.postal_code}</div>
                          <div className="pt-2">
                            <span className="text-gray-500">DNI:</span> {order.dni} • <span className="text-gray-500">Tel:</span> {order.phone}
                          </div>
                        </div>
                      </div>

                      {/* Estado Update */}
                      <div className="border-t border-white/10 pt-4">
                        <h3 className="text-sm font-semibold text-gray-300 mb-3">Cambiar Estado</h3>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(statusMap).map(([status, config]) => (
                            <button
                              key={status}
                              onClick={() => updateOrderStatus(order.id, status)}
                              disabled={updatingOrder === order.id || order.status === status}
                              className={`text-xs px-3 py-1.5 rounded font-semibold transition-all ${
                                order.status === status
                                  ? `${config.bg} ${config.text}`
                                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {updatingOrder === order.id ? 'Actualizando...' : config.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Resumen de Pago */}
                      <div className="border-t border-white/10 pt-4">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <div className="text-gray-500">Subtotal</div>
                            <div className="text-gray-200 font-semibold">
                              ${(Number(order.total) / 1.21 + Number(order.discount_amount || 0)).toFixed(2)}
                            </div>
                          </div>
                          {order.discount_amount > 0 && (
                            <div>
                              <div className="text-gray-500">Descuento {order.coupon_code && `(${order.coupon_code})`}</div>
                              <div className="text-green-400 font-semibold">-${Number(order.discount_amount).toFixed(2)}</div>
                            </div>
                          )}
                          <div>
                            <div className="text-gray-500">IVA (21%)</div>
                            <div className="text-gray-200 font-semibold">
                              ${(Number(order.total) - Number(order.total) / 1.21).toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Total</div>
                            <div className="text-orange-400 font-bold text-lg">
                              ${Number(order.total).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </RequireAuth>
  )
}
