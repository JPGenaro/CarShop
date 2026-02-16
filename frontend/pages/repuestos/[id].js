import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Edit, ChevronLeft, ChevronRight, Share2, Facebook, Twitter, Linkedin, Link as LinkIcon, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Head from 'next/head'
import Navbar from '../../components/Navbar'
import { SkeletonDetail } from '../../components/Skeleton'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
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
  const [selectedImage, setSelectedImage] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const { addItem } = useCart()
  const { user } = useAuth()
  const { showToast } = useToast()

  const allImages = item ? [item.image, ...(item.imagenes || []).map(img => img.image)].filter(Boolean) : []

  function nextImage() {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
  }

  function prevImage() {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

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
      // Set initial selected image
      const images = [itemData.image, ...(itemData.imagenes || []).map(img => img.image)].filter(Boolean)
      if (images.length > 0) {
        setSelectedImage(images[0])
        setCurrentImageIndex(0)
      }
      
      // Save to recently viewed
      saveToRecentlyViewed(itemData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function saveToRecentlyViewed(product) {
    try {
      const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
      // Remove if already exists
      const filtered = recent.filter(p => p.id !== product.id)
      // Add to beginning
      const updated = [{ 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        image: product.image,
        brand: product.brand,
        model: product.model
      }, ...filtered].slice(0, 10) // Keep only last 10
      localStorage.setItem('recentlyViewed', JSON.stringify(updated))
    } catch (err) {
      console.error('Error saving to recently viewed:', err)
    }
  }

  useEffect(() => {
    if (allImages.length > 0) {
      setSelectedImage(allImages[currentImageIndex])
    }
  }, [currentImageIndex, item])

  useEffect(() => {
    function handleClickOutside(event) {
      if (showShareMenu && !event.target.closest('.share-menu-container')) {
        setShowShareMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showShareMenu])

  async function handleSubmitReview(e) {
    e.preventDefault()
    if (!user) {
      showToast('Debes iniciar sesión para opinar', 'info')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetchWithAuth('/reviews/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repuesto: id, rating, comment }),
      })
      if (res.ok) {
        setComment('')
        setRating(5)
        showToast('Opinión publicada con éxito', 'success')
        await fetchData()
      } else {
        const err = await res.json()
        showToast(err.detail || 'Error al enviar opinión', 'error')
      }
    } catch (e) {
      console.error(e)
      showToast('Error al enviar', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteReview(reviewId) {
    if (!confirm('¿Eliminar tu opinión?')) return
    try {
      const res = await fetchWithAuth(`/reviews/${reviewId}/`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== reviewId))
        showToast('Opinión eliminada', 'success')
      } else {
        let err = {}
        try {
          err = await res.json()
        } catch {
          err = {}
        }
        showToast(err.detail || 'No se pudo eliminar', 'error')
      }
    } catch (e) {
      console.error(e)
      showToast('No se pudo eliminar', 'error')
    }
  }

  function handleAddToCart() {
    if (item.stock <= 0) {
      showToast('Este producto no está disponible en este momento', 'error')
      return
    }
    addItem(item, 1)
  }

  function handleShare(platform) {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const text = `${item.name} - Carshop`
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
    }

    if (platform === 'copy') {
      navigator.clipboard.writeText(url)
      showToast('Enlace copiado al portapapeles', 'success')
      setShowShareMenu(false)
      return
    }

    window.open(urls[platform], '_blank', 'width=600,height=400')
    setShowShareMenu(false)
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0

  const productUrl = typeof window !== 'undefined' ? window.location.href : ''
  const productImage = item?.image || ''

  return (
    <div>
      <Head>
        <title>{item ? `${item.name} - Carshop` : 'Carshop'}</title>
        <meta name="description" content={item?.description || 'Repuestos de calidad'} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="product" />
        <meta property="og:url" content={productUrl} />
        <meta property="og:title" content={item?.name || 'Carshop'} />
        <meta property="og:description" content={item?.description || 'Repuestos de calidad'} />
        <meta property="og:image" content={productImage} />
        <meta property="og:site_name" content="Carshop" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={productUrl} />
        <meta property="twitter:title" content={item?.name || 'Carshop'} />
        <meta property="twitter:description" content={item?.description || 'Repuestos de calidad'} />
        <meta property="twitter:image" content={productImage} />
        
        {/* Product meta */}
        {item?.price && <meta property="product:price:amount" content={item.price} />}
        {item?.price && <meta property="product:price:currency" content="ARS" />}
      </Head>
      <Navbar />
      <main className="container mx-auto py-10 px-4">
        {loading ? (
          <SkeletonDetail />
        ) : item ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl shadow-black/50"
            >
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-xl bg-black/40 group">
                  {selectedImage ? (
                    <AnimatePresence mode="wait">
                      <motion.img 
                        key={selectedImage}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                        src={selectedImage} 
                        alt={item.name} 
                        className="h-96 w-full object-cover" 
                      />
                    </AnimatePresence>
                  ) : (
                    <div className="h-96 w-full flex items-center justify-center text-gray-500">Sin imagen</div>
                  )}
                  
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight size={24} />
                      </button>
                      
                      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
                        {allImages.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              idx === currentImageIndex ? 'bg-orange-400 w-6' : 'bg-white/50 hover:bg-white/70'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                
                {allImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          currentImageIndex === idx ? 'border-orange-400' : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <img src={img} alt={`Imagen ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Detalle técnico</p>
                  {item.stock <= 0 && (
                    <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold border border-red-400/30">
                      Sin stock
                    </span>
                  )}
                </div>
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
                  <button 
                    onClick={handleAddToCart} 
                    disabled={item.stock <= 0}
                    className={`px-4 py-2 rounded-md shadow-lg transition-all ${
                      item.stock <= 0 
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50' 
                        : 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-red-500/20 hover:shadow-red-500/40'
                    }`}
                  >
                    {item.stock <= 0 ? 'No disponible' : 'Agregar al carrito'}
                  </button>
                  
                  {/* Share Button */}
                  <div className="relative share-menu-container">
                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="flex items-center gap-2 px-4 py-2 rounded-md border border-white/20 text-gray-300 hover:border-orange-400/60 transition-colors"
                    >
                      <Share2 size={18} />
                      Compartir
                    </button>
                    
                    {showShareMenu && (
                      <div className="absolute top-full mt-2 right-0 z-20 w-48 rounded-xl border border-white/10 bg-black/95 backdrop-blur-xl shadow-xl overflow-hidden">
                        <button
                          onClick={() => handleShare('facebook')}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-white/10 transition-colors"
                        >
                          <Facebook size={18} className="text-blue-500" />
                          Facebook
                        </button>
                        <button
                          onClick={() => handleShare('twitter')}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-white/10 transition-colors"
                        >
                          <Twitter size={18} className="text-sky-500" />
                          Twitter
                        </button>
                        <button
                          onClick={() => handleShare('linkedin')}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-white/10 transition-colors"
                        >
                          <Linkedin size={18} className="text-blue-600" />
                          LinkedIn
                        </button>
                        <button
                          onClick={() => handleShare('whatsapp')}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-white/10 transition-colors"
                        >
                          <svg className="w-[18px] h-[18px]" fill="#25D366" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                          WhatsApp
                        </button>
                        <button
                          onClick={() => handleShare('copy')}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-white/10 transition-colors border-t border-white/10"
                        >
                          <LinkIcon size={18} className="text-gray-400" />
                          Copiar enlace
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {user?.is_staff && (
                    <Link href={`/repuestos/${item.id}/edit`} className="flex items-center gap-2 px-4 py-2 rounded-md border border-orange-400/50 text-orange-400 hover:bg-orange-400/10 transition-colors">
                      <Edit size={18} />
                      Editar producto
                    </Link>
                  )}
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
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-200">{review.username}</span>
                          <span className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString('es-AR')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} size={14} className={s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'} />
                            ))}
                          </div>
                          {user && review.user === user.id && (
                            <button
                              onClick={() => handleDeleteReview(review.id)}
                              className="p-1 rounded hover:bg-white/10 text-red-400 hover:text-red-300"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 mt-3 leading-relaxed">{review.comment}</p>
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
