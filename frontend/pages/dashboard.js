import { useEffect, useState } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Package, ShoppingCart, Users, AlertTriangle, DollarSign, Plus, ChevronDown, ChevronUp, Target, ShoppingBag, TrendingDown, Award, Eye } from 'lucide-react'
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
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('date-desc')
  const [searchId, setSearchId] = useState('')

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

  async function handleStatusChange(orderId, newStatus) {
    try {
      const res = await fetchWithAuth(`/orders/${orderId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!res.ok) throw new Error('Error al actualizar estado')
      
      await loadStats()
      alert('Estado actualizado correctamente')
    } catch (e) {
      console.error('Error updating status:', e)
      alert('No se pudo actualizar el estado')
    }
  }

  function getFilteredOrders() {
    let filtered = [...(stats?.recent_orders || [])]

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order.status === filterStatus)
    }

    // Filter by search ID
    if (searchId.trim()) {
      filtered = filtered.filter(order => 
        order.id.toString().includes(searchId.trim())
      )
    }

    // Sort orders
    if (sortBy === 'date-desc') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    } else if (sortBy === 'date-asc') {
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => Number(b.total) - Number(a.total))
    } else if (sortBy === 'price-asc') {
      filtered.sort((a, b) => Number(a.total) - Number(b.total))
    }

    return filtered
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

          {/* ANALYTICS AVANZADOS */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-100 mb-6 flex items-center gap-2">
              <Target size={24} className="text-orange-400" />
              Analytics Avanzados
            </h2>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Tasa de Conversión */}
              <div className="rounded-2xl border border-green-500/20 bg-green-500/5 backdrop-blur-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Tasa de Conversión</span>
                  <Target className="text-green-400" size={24} />
                </div>
                <div className="text-3xl font-bold text-green-400">
                  {stats?.analytics?.conversion_rate?.toFixed(1) || '0'}%
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.analytics?.users_with_orders || 0} de {stats?.summary?.total_customers || 0} clientes compraron
                </p>
                <div className="mt-2 text-xs text-gray-400">
                  Últimos 30d: <span className="text-green-400 font-semibold">{stats?.analytics?.conversion_rate_30d?.toFixed(1) || '0'}%</span>
                </div>
              </div>

              {/* Valor Promedio de Orden */}
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 backdrop-blur-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Valor Promedio Orden</span>
                  <ShoppingBag className="text-blue-400" size={24} />
                </div>
                <div className="text-3xl font-bold text-blue-400">
                  ${stats?.analytics?.avg_order_value?.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Por cada compra realizada
                </p>
              </div>

              {/* Abandono de Carrito */}
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Abandono de Carrito</span>
                  <TrendingDown className="text-red-400" size={24} />
                </div>
                <div className="text-3xl font-bold text-red-400">
                  {stats?.analytics?.cart_abandonment_rate?.toFixed(1) || '0'}%
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.analytics?.active_users_30d - stats?.analytics?.recent_buyers_30d || 0} usuarios sin comprar
                </p>
                <div className="mt-2 text-xs text-gray-400">
                  {stats?.analytics?.active_users_30d || 0} activos últimos 30d
                </div>
              </div>

              {/* Productos por Orden */}
              <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 backdrop-blur-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Items por Orden</span>
                  <Package className="text-purple-400" size={24} />
                </div>
                <div className="text-3xl font-bold text-purple-400">
                  {((stats?.top_products?.reduce((sum, p) => sum + (p.total_sold || 0), 0) || 0) / (stats?.summary?.total_orders || 1)).toFixed(1)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Productos vendidos por orden
                </p>
              </div>
            </div>

            {/* Top Products by Revenue & Category Sales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Top Products by Revenue */}
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                  <Award size={18} className="text-yellow-400" />
                  Top Productos por Ingresos
                </h3>
                <div className="space-y-3">
                  {stats?.top_products_revenue?.slice(0, 5).map((product, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          idx === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                          idx === 1 ? 'bg-gray-400/20 text-gray-300' :
                          idx === 2 ? 'bg-orange-500/20 text-orange-400' :
                          'bg-gray-600/20 text-gray-400'
                        }`}>
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-200">{product.name}</div>
                          <div className="text-xs text-gray-500">{product.sku}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-orange-400">${product.revenue?.toFixed(0) || 0}</div>
                        <div className="text-xs text-gray-500">{product.total_sold} vendidos</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Sales */}
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Ventas por Categoría</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats?.analytics?.category_sales || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" stroke="#888" />
                    <YAxis 
                      type="category" 
                      dataKey="repuesto__category__name" 
                      stroke="#888" 
                      width={100}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #333', borderRadius: '8px' }}
                    />
                    <Bar dataKey="revenue" fill="#f97316" name="Ingresos ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Most Favorited & Price Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Most Favorited Products */}
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                  <Eye size={18} className="text-pink-400" />
                  Productos Más Favoritos
                </h3>
                <div className="space-y-2">
                  {stats?.analytics?.most_favorited?.slice(0, 5).map((product, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-black/20 text-sm">
                      <div className="flex items-center gap-2">
                        {product.repuesto__image && (
                          <img 
                            src={product.repuesto__image} 
                            alt={product.repuesto__name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                        <span className="text-gray-200">{product.repuesto__name}</span>
                      </div>
                      <span className="text-pink-400 font-semibold">{product.favorite_count} ♥</span>
                    </div>
                  ))}
                  {(!stats?.analytics?.most_favorited || stats.analytics.most_favorited.length === 0) && (
                    <div className="text-gray-500 text-sm text-center py-4">Sin datos de favoritos</div>
                  )}
                </div>
              </div>

              {/* Price Distribution */}
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Distribución de Órdenes por Precio</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats?.analytics?.price_distribution || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="range" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #333', borderRadius: '8px' }}
                    />
                    <Bar dataKey="count" fill="#ea580c" name="Órdenes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
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
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Filtrar por estado</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/20 text-gray-100 focus:outline-none focus:border-orange-400/60"
                >
                  <option value="all">Todos</option>
                  <option value="pending">Pendiente</option>
                  <option value="paid">Pagado</option>
                  <option value="shipped">Enviado</option>
                  <option value="delivered">Entregado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Ordenar por</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/20 text-gray-100 focus:outline-none focus:border-orange-400/60"
                >
                  <option value="date-desc">Más reciente</option>
                  <option value="date-asc">Más antiguo</option>
                  <option value="price-desc">Precio: Mayor a menor</option>
                  <option value="price-asc">Precio: Menor a mayor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Buscar por ID</label>
                <input
                  type="text"
                  placeholder="Ej: 123"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/20 text-gray-100 focus:outline-none focus:border-orange-400/60"
                />
              </div>
            </div>

            <div className="space-y-3">
              {getFilteredOrders().length === 0 ? (
                <div className="text-gray-400 text-center py-8">
                  No se encontraron órdenes con los filtros seleccionados
                </div>
              ) : (
                getFilteredOrders().map((order) => (
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

                      <div className="mt-4 pt-4 border-t border-white/10">
                        <h3 className="text-sm font-semibold text-gray-300 mb-2">Estado del pedido</h3>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/20 text-gray-100 focus:outline-none focus:border-orange-400/60"
                        >
                          <option value="pending">Pendiente</option>
                          <option value="paid">Pagado</option>
                          <option value="shipped">Enviado</option>
                          <option value="delivered">Entregado</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </RequireAuth>
  )
}
