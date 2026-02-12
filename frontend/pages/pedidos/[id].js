import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import RequireAuth from '../../components/RequireAuth'
import { fetchWithAuth } from '../../lib/auth'

export default function PedidoDetail() {
  const router = useRouter()
  const { id } = router.query
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    async function load() {
      try {
        const res = await fetchWithAuth(`/orders/${id}/`)
        if (!res.ok) throw new Error('No se pudo cargar la orden')
        const data = await res.json()
        setOrder(data)
      } catch (e) {
        setOrder(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  return (
    <RequireAuth>
      <div className="min-h-screen flex flex-col bg-[#121212]">
        <Navbar />
        <main className="container mx-auto py-12 px-4 flex-1">
          {loading ? (
            <p className="text-gray-400">Cargando...</p>
          ) : !order ? (
            <p className="text-gray-400">No se encontró la orden.</p>
          ) : (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h1 className="text-2xl font-bold text-gray-100">Pedido #{order.id}</h1>
                  <span className="text-orange-300">{order.status}</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">Fecha: {new Date(order.created_at).toLocaleString()}</p>
                <p className="text-sm text-gray-400 mt-1">Total: ${Number(order.total || 0).toFixed(2)}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                <h2 className="text-xl font-semibold text-gray-100">Datos de envío</h2>
                <div className="mt-3 text-gray-300 text-sm space-y-1">
                  <p>{order.address_line1} {order.address_line2 || ''}</p>
                  <p>{order.city}, {order.province} ({order.postal_code})</p>
                  <p>{order.country}</p>
                  <p>DNI: {order.dni}</p>
                  <p>Teléfono: {order.phone}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                <h2 className="text-xl font-semibold text-gray-100">Items</h2>
                <div className="mt-4 space-y-3">
                  {order.items?.map(item => (
                    <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 border border-white/10 rounded-xl p-4 text-gray-300">
                      <div>
                        <p className="text-gray-100 font-semibold">{item.name}</p>
                        <p className="text-sm text-gray-400">SKU: {item.sku || '—'}</p>
                        {[item.brand, item.model, item.year].filter(Boolean).length > 0 && (
                          <p className="text-sm text-gray-400">{[item.brand, item.model, item.year].filter(Boolean).join(' • ')}</p>
                        )}
                      </div>
                      <div className="text-sm text-gray-300">
                        <p>Cantidad: {item.qty}</p>
                        <p>Precio: ${Number(item.price || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </RequireAuth>
  )
}
