import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import Navbar from '../../components/Navbar'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { fetchWithAuth } from '../../lib/auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

export default function RepuestoDetail() {
  const router = useRouter()
  const { id } = router.query
  const [item, setItem] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { addItem } = useCart()
  const { user } = useAuth()

  useEffect(() => {
    if (!id) return
    fetchData()
  }, [id])

  async function fetchData() {
    try {
      const [itemRes, reviewsRes] = await Promise.all([
        fetch(`${API_BASE}/repuestos/${id}/`),
        fetch(`${API_BASE}/reviews/?repuesto=${id}`),
      ])
      const itemData = await itemRes.json()
      const reviewsData = await reviewsRes.json()
      setItem(itemData)
      setReviews(reviewsData.results || reviewsData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitReview(e) {
    e.preventDefault()
    if (!user) {
      alert('Debes iniciar sesión para opinar')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetchWithAuth('/reviews/', {
        method: 'POST',
        body: JSON.stringify({ repuesto: id, rating, comment }),
      })
      if (res.ok) {
        setComment('')
        setRating(5)
        await fetchData()
      } else {
        const err = await res.json()
        alert(err.detail || 'Error al enviar opinión')
      }
    } catch (e) {
      console.error(e)
      alert('Error al enviar')
    } finally {
      setSubmitting(false)
    }
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0

  return (
    <div>
      <Navbar />
      <main className="container mx-auto py-10 px-4">
        {loading ? (
          <p className="text-gray-400">Cargando...</p>
        ) : item ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl shadow-black/50"
            >
              <div className="overflow-hidden rounded-xl bg-black/40">
                {item.image ? (
                  <motion.img layoutId={`repuesto-image-${item.id}`} src={item.image} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-64 w-full flex items-center justify-center text-gray-500">Sin imagen</div>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Detalle técnico</p>
                <h1 className="mt-3 text-3xl font-bold text-gray-100">{item.name}</h1>
                <p className="text-sm text-gray-400 mt-1">SKU: {item.sku || '—'}</p>
                {(item.brand || item.model || item.year) && (
                  <p className="text-sm text-gray-400 mt-1">
                    {[item.brand, item.model, item.year].filter(Boolean).join(' • ')}
                  </p>
                )}
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={16} className={s <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-400">{avgRating} ({reviews.length} opiniones)</span>
                  </div>
                )}
                <p className="mt-4 text-gray-300 leading-relaxed">{item.description}</p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <span className="text-2xl font-semibold text-orange-400">${item.price}</span>
                  <button onClick={() => addItem(item, 1)} className="px-4 py-2 rounded-md bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg shadow-red-500/20">
                    Agregar al carrito
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Reviews section */}
            <div className="mt-10">
              <h2 className="text-2xl font-bold text-gray-100 mb-4">Opiniones</h2>
              
              {user && (
                <form onSubmit={handleSubmitReview} className="mb-6 p-4 rounded-xl border border-white/10 bg-white/5">
                  <label className="block text-sm text-gray-300 mb-2">Tu calificación</label>
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                      >
                        <Star size={24} className={s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'} />
                      </button>
                    ))}
                  </div>
                  <label className="block text-sm text-gray-300 mb-2">Comentario</label>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows={3}
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-orange-400/60"
                    placeholder="Comparte tu experiencia..."
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-3 px-4 py-2 rounded-md bg-gradient-to-r from-red-600 to-orange-500 text-white disabled:opacity-50"
                  >
                    {submitting ? 'Enviando...' : 'Enviar opinión'}
                  </button>
                </form>
              )}

              {reviews.length === 0 ? (
                <p className="text-gray-400">No hay opiniones aún. ¡Sé el primero!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div key={review.id} className="p-4 rounded-xl border border-white/10 bg-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-200">{review.username}</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} size={14} className={s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-300">{review.comment}</p>
                      <p className="text-xs text-gray-500 mt-2">{new Date(review.created_at).toLocaleDateString('es-AR')}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="text-gray-400">No encontrado</p>
        )}
      </main>
    </div>
  )
}
