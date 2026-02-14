import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { fetchWithAuth } from '../lib/auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

export default function CartPage() {
  const { items, updateQty, removeItem, clear, summary } = useCart()
  const { user, token } = useAuth()
  const [profile, setProfile] = useState(null)
  const [profileError, setProfileError] = useState(null)
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')

  const hasItems = items.length > 0
  const formatted = useMemo(() => {
    return items.map(item => ({
      ...item,
      lineTotal: Number(item.price || 0) * item.qty,
    }))
  }, [items])

  useEffect(() => {
    async function loadProfile() {
      if (!user) return
      try {
        const res = await fetchWithAuth('/auth/profile/')
        if (!res.ok) throw new Error('Error perfil')
        const data = await res.json()
        setProfile(data)
      } catch (e) {
        setProfileError('No se pudo cargar el perfil')
      }
    }
    loadProfile()
  }, [user])

  const profileComplete = Boolean(
    profile?.phone &&
    profile?.dni &&
    profile?.address_line1 &&
    profile?.city &&
    profile?.province &&
    profile?.postal_code &&
    (profile?.country || 'Argentina')
  )

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return
    setCouponError('')
    setCoupon(null)
    
    console.log('Aplicando cupón:', couponCode)
    console.log('Token:', token ? 'presente' : 'ausente')
    
    try {
      const res = await fetch(`${API_BASE}/coupons/validate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: couponCode.trim().toUpperCase() }),
      })
      
      console.log('Status:', res.status)
      
      if (res.ok) {
        const data = await res.json()
        console.log('Cupón válido:', data)
        setCoupon(data)
        setCouponError('')
      } else {
        const err = await res.json()
        console.log('Error del servidor:', err)
        setCouponError(err.error || 'Cupón inválido')
        setCoupon(null)
      }
    } catch (e) {
      console.error('Error al validar cupón:', e)
      setCouponError('Error al validar cupón')
      setCoupon(null)
    }
  }

  const discount = coupon
    ? coupon.discount_type === 'percent'
      ? (summary.subtotal * coupon.discount_value) / 100
      : Number(coupon.discount_value)
    : 0
  const totalWithDiscount = Math.max(0, summary.total - discount)

  async function handlePay() {
    if (!user) return
    if (!profileComplete) return
    
    try {
      // Validate stock for all items before proceeding
      const stockValidation = await Promise.all(
        items.map(async (item) => {
          const res = await fetch(`${API_BASE}/repuestos/${item.id}/`)
          const data = await res.json()
          return {
            id: item.id,
            name: item.name,
            requestedQty: item.qty,
            availableStock: data.stock,
            hasStock: data.stock >= item.qty
          }
        })
      )
      
      const outOfStock = stockValidation.filter(v => !v.hasStock)
      
      if (outOfStock.length > 0) {
        const errorMsg = outOfStock.map(item => 
          `"${item.name}": solicitaste ${item.requestedQty} pero ${item.availableStock === 0 ? 'no hay stock' : `solo hay ${item.availableStock} disponible(s)`}`
        ).join('\n')
        alert(`No hay suficiente stock para los siguientes productos:\n\n${errorMsg}\n\nPor favor actualiza las cantidades.`)
        return
      }
      
      const payload = {
        items: items.map(i => ({
          repuesto_id: i.id,
          name: i.name,
          sku: i.sku,
          price: Number(i.price || 0),
          qty: i.qty,
          brand: i.brand,
          model: i.model,
          year: i.year,
        })),
        coupon_code: coupon?.code || null,
        discount_amount: discount || 0,
      }
      const res = await fetchWithAuth('/orders/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        if (errorData.items && errorData.items[0]) {
          alert(errorData.items[0])
        } else {
          throw new Error('Error orden')
        }
        return
      }
      
      alert(`Pago simulado realizado con éxito. Total: $${totalWithDiscount.toFixed(2)}`)
      clear()
      setCoupon(null)
      setCouponCode('')
    } catch (e) {
      alert('No se pudo procesar el pago simulado')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#121212]">
      <Navbar />
      <main className="container mx-auto py-12 px-4 flex-1">
        <h1 className="text-3xl font-bold mb-8">Carrito</h1>

        {!hasItems ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 text-gray-400">
            Tu carrito está vacío.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {formatted.map(item => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 flex flex-col md:flex-row gap-4">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-28 w-40 object-cover rounded-xl bg-black/40" />
                  ) : (
                    <div className="h-28 w-40 rounded-xl bg-black/40 flex items-center justify-center text-gray-500">Sin imagen</div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-100">{item.name}</h3>
                    <p className="text-sm text-gray-400">SKU: {item.sku || '—'}</p>
                    {[item.brand, item.model, item.year].filter(Boolean).length > 0 && (
                      <p className="text-sm text-gray-400">{[item.brand, item.model, item.year].filter(Boolean).join(' • ')}</p>
                    )}
                    <p className="text-orange-400 font-semibold mt-2">${Number(item.price || 0).toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.id, item.qty - 1)} className="px-2 py-1 rounded border border-white/10 text-gray-200">-</button>
                      <span className="text-gray-100 w-6 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} className="px-2 py-1 rounded border border-white/10 text-gray-200">+</button>
                    </div>
                    <p className="text-sm text-gray-300">Subtotal: ${item.lineTotal.toFixed(2)}</p>
                    <button onClick={() => removeItem(item.id)} className="text-sm text-red-400">Quitar</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 h-fit">
              <h2 className="text-xl font-semibold text-gray-100">Resumen</h2>
              {!user && (
                <div className="mt-3 text-sm text-orange-300">
                  Iniciá sesión para poder pagar.
                </div>
              )}
              {user && !profileComplete && (
                <div className="mt-3 text-sm text-orange-300">
                  Completá tus datos de envío en Mi cuenta para poder pagar.
                </div>
              )}
              {profileError && <div className="mt-3 text-sm text-red-400">{profileError}</div>}

              {user && (
                <div className="mt-4">
                  <label className="text-sm text-gray-300">Cupón de descuento</label>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="CODIGO"
                      className="flex-1 bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-orange-400/60"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="px-3 py-2 rounded-lg border border-white/20 text-gray-200 hover:border-orange-400/60"
                    >
                      Aplicar
                    </button>
                  </div>
                  {couponError && <p className="text-xs text-red-400 mt-1">{couponError}</p>}
                  {coupon && <p className="text-xs text-green-400 mt-1">✓ Cupón aplicado: -{coupon.discount_value}{coupon.discount_type === 'percent' ? '%' : '$'}</p>}
                </div>
              )}

              <div className="mt-4 space-y-2 text-gray-300 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${summary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Impuestos</span>
                  <span>${summary.tax.toFixed(2)}</span>
                </div>
                {coupon && (
                  <div className="flex justify-between text-green-400">
                    <span>Descuento</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold text-gray-100 pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span>${totalWithDiscount.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={handlePay}
                disabled={!user || !profileComplete}
                className="mt-6 w-full bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 py-2 rounded-md shadow-lg shadow-red-500/20 disabled:opacity-50"
              >
                Pagar
              </button>
              <button onClick={clear} className="mt-3 w-full border border-white/10 text-gray-300 px-4 py-2 rounded-md">
                Vaciar carrito
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
