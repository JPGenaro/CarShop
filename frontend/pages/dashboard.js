import { useEffect, useState } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Package, ShoppingCart, Users, AlertTriangle, DollarSign, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import RequireAuth from '../components/RequireAuth'
import { useAuth } from '../context/AuthContext'
import { fetchWithAuth } from '../lib/auth'

const COLORS = ['#f97316', '#ea580c', '#dc2626', '#fb923c']

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stockInputs, setStockInputs] = useState({})
  const [expandedOrder, setExpandedOrder] = useState(null)

  useEffect(() => {
    if (!user?.is_staff) return
    loadStats()
  }, [user])

  async function loadStats() {
    try {
      const res = await fetchWithAuth('/admin/dashboard/')
      if (!res.ok) throw new Error('Failed to fetch stats')
      const data = await res.json()
      setStats(data)
    } catch (e) {
      console.error('Error loading stats:', e)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddStock(productId, currentStock) {
    const amountToAdd = stockInputs[productId]
    if (!amountToAdd || amountToAdd <= 0) {
      alert('Ingresa una cantidad válida')
      return
    }

    try {
      const newStock = currentStock + parseInt(amountToAdd)
      const res = await fetchWithAuth(`/repuestos/${productId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      })

      if (!res.ok) throw new Error('Error al actualizar stock')
      
      // Clear input and reload stats
      setStockInputs(prev => ({ ...prev, [productId]: '' }))
      await loadStats()
      alert('Stock actualizado correctamente')
    } catch (e) {
      console.error('Error updating stock:', e)
      alert('No se pudo actualizar el stock')
    }
  }

  function handleStockInputChange(productId, value) {
    // Only allow positive numbers
    const numValue = value.replace(/\D/g, '')
    setStockInputs(prev => ({ ...prev, [productId]: numValue }))
  }

  if (!user?.is_staff) {
    return (
      <RequireAuth>
        <div className="min-h-screen flex flex-col bg-[#121212]">
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-12">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 text-gray-300">
              Solo administradores pueden acceder al dashboard.
            </div>
          </main>
          <Footer />
        </div>
      </RequireAuth>
    )
  }

  if (loading) {
    return (
      <RequireAuth>
        <div className="min-h-screen flex flex-col bg-[#121212]">
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-12">
            <p className="text-gray-400">Cargando estadísticas...</p>
          </main>
          <Footer />
        </div>
      </RequireAuth>
    )
  }

  const statusData = stats?.orders_by_status?.map(s => ({
    name: s.status === 'pending' ? 'Pendiente' : 
          s.status === 'paid' ? 'Pagado' : 
          s.status === 'shipped' ? 'Enviado' : 'Entregado',
    value: s.count
  })) || []

  return (
    <RequireAuth>
      <div className="min-h-screen flex flex-col bg-[#121212]">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-100 mb-8">Dashboard de Analytics</h1>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Ingresos Totales</span>
                <DollarSign className="text-orange-400" size={24} />
              </div>
              <div className="text-3xl font-bold text-gray-100">
                ${stats?.revenue?.total?.toFixed(2) || '0.00'}
              </div>
              <p className="text-xs text-gray-500 mt-1">{stats?.revenue?.orders_count || 0} órdenes</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Total Productos</span>
                <Package className="text-blue-400" size={24} />
              </div>
              <div className="text-3xl font-bold text-gray-100">
                {stats?.summary?.total_products || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">En catálogo</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Total Órdenes</span>
                <ShoppingCart className="text-green-400" size={24} />
              </div>
              <div className="text-3xl font-bold text-gray-100">
                {stats?.summary?.total_orders || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Todas las ventas</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Clientes</span>
                <Users className="text-purple-400" size={24} />
              </div>
              <div className="text-3xl font-bold text-gray-100">
                {stats?.summary?.total_customers || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Usuarios registrados</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Sales Chart */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-orange-400" />
                Ventas (Últimos 30 días)
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats?.sales_by_day || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#888"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => new Date(value).getDate()}
                  />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #333', borderRadius: '8px' }}
                    labelStyle={{ color: '#888' }}
                  />
                  <Line type="monotone" dataKey="sales" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Orders by Status */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Órdenes por Estado</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #333', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Top 10 Productos Más Vendidos</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={stats?.top_products || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 10 }} />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #333', borderRadius: '8px' }}
                  labelStyle={{ color: '#888' }}
                />
                <Legend />
                <Bar dataKey="total_sold" fill="#f97316" name="Cantidad Vendida" />
                <Bar dataKey="revenue" fill="#ea580c" name="Ingresos ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Low Stock Alert */}
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} className="text-red-400" />
              Productos con Stock Bajo ({stats?.summary?.low_stock_count || 0})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 text-gray-400">ID</th>
                    <th className="text-left py-2 text-gray-400">Nombre</th>
                    <th className="text-left py-2 text-gray-400">SKU</th>
                    <th className="text-right py-2 text-gray-400">Stock</th>
                    <th className="text-right py-2 text-gray-400">Precio</th>
                    <th className="text-right py-2 text-gray-400">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.low_stock?.map((product) => (
                    <tr key={product.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-2 text-gray-300">{product.id}</td>
                      <td className="py-2 text-gray-300">{product.name}</td>
                      <td className="py-2 text-gray-300">{product.sku}</td>
                      <td className="py-2 text-right">
                        <span className={`px-2 py-1 rounded text-xs ${
                          product.stock === 0 ? 'bg-red-500/20 text-red-400' :
                          product.stock <= 2 ? 'bg-orange-500/20 text-orange-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="py-2 text-right text-gray-300">${product.price}</td>
                      <td className="py-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="+"
                            value={stockInputs[product.id] || ''}
                            onChange={(e) => handleStockInputChange(product.id, e.target.value)}
                            className="w-16 px-2 py-1 text-sm bg-black/40 border border-white/20 rounded text-gray-100 text-center focus:outline-none focus:border-orange-400/60"
                          />
                          <button
                            onClick={() => handleAddStock(product.id, product.stock)}
                            disabled={!stockInputs[product.id] || stockInputs[product.id] <= 0}
                            className="p-1.5 rounded bg-gradient-to-r from-red-600 to-orange-500 text-white hover:shadow-lg hover:shadow-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Agregar stock"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Órdenes Recientes</h2>
            <div className="space-y-3">
              {stats?.recent_orders?.map((order) => (
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
                          {order.status === 'pending' ? 'Pendiente' : 
                           order.status === 'paid' ? 'Pagado' : 
                           order.status === 'shipped' ? 'Enviado' : 'Entregado'}
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
                          <div><span className="text-gray-500">Cliente:</span> {order.user?.username || 'N/A'}</div>
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
          </div>
        </main>
        <Footer />
      </div>
    </RequireAuth>
  )
}
