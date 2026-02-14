import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Plus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchWithAuth } from '../lib/auth'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import { useCompare } from '../context/CompareContext'

function truncate(text, n = 120) {
  if (!text) return ''
  return text.length > n ? text.slice(0, n) + '...' : text
}

export default function RepuestoCard({ item }) {
  const router = useRouter()
  const { user } = useAuth()
  const { addItem } = useCart()
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()
  const { addItem: addToCompare } = useCompare()
  const meta = [item.brand, item.model, item.year].filter(Boolean).join(' • ')
  const favorited = isFavorite(item.id)

  // Carousel state
  const allImages = [item.image, ...(item.imagenes || []).map(img => img.image)].filter(Boolean)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (allImages.length <= 1) return
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
    }, 3000) // Change image every 3 seconds
    return () => clearInterval(interval)
  }, [allImages.length])

  async function handleDelete() {
    if (!confirm('¿Eliminar este repuesto?')) return
    try {
      const res = await fetchWithAuth(`/repuestos/${item.id}/`, { method: 'DELETE' })
      if (!res.ok) throw new Error('delete failed')
      router.reload()
    } catch (e) {
      console.error(e)
      alert('No se pudo eliminar')
    }
  }

  async function toggleFavorite() {
    if (!user) {
      alert('Debes iniciar sesión para agregar favoritos')
      return
    }
    if (favorited) {
      await removeFavorite(item.id)
    } else {
      await addFavorite(item.id)
    }
  }

  function handleAddToCompare() {
    const added = addToCompare(item)
    if (added) {
      alert('Agregado al comparador')
    }
  }

  return (
    <motion.div
      layout
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="border border-white/10 rounded-2xl p-4 bg-white/5 backdrop-blur-xl shadow-lg shadow-black/40 flex flex-col relative"
    >
      <div className="absolute top-3 right-3 z-10 flex gap-2">
        {user && (
          <button
            onClick={toggleFavorite}
            className="p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
          >
            <Heart
              size={20}
              className={favorited ? 'fill-red-500 text-red-500' : 'text-gray-300'}
            />
          </button>
        )}
        <button
          onClick={handleAddToCompare}
          className="p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
          title="Comparar"
        >
          <Plus size={20} className="text-gray-300" />
        </button>
      </div>
      {allImages.length > 0 && (
        <div className="h-44 w-full mb-3 overflow-hidden rounded-xl bg-black/30 flex items-center justify-center relative">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={allImages[currentImageIndex]}
              alt={item.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="object-cover h-full w-full"
            />
          </AnimatePresence>
          {allImages.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
              {allImages.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentImageIndex ? 'bg-orange-400 w-4' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-100">{item.name}</h3>
      <p className="text-sm text-gray-400">SKU: {item.sku || '—'}</p>
      {meta && <p className="text-sm text-gray-400">{meta}</p>}
      <p className="mt-2 text-orange-400 font-bold text-lg">${item.price}</p>
      <p className="text-sm text-gray-400 mt-2">{truncate(item.description)}</p>
      <div className="flex items-center justify-end mt-4">
        <div className="flex items-center gap-2">
          <button onClick={() => addItem(item, 1)} className="text-sm text-gray-100 px-3 py-1 rounded-md border border-white/20 hover:border-orange-400/60">
            Agregar
          </button>
          <Link href={`/repuestos/${item.id}`} className="text-sm text-white bg-gradient-to-r from-red-600 to-orange-500 px-3 py-1 rounded-md shadow-md shadow-red-500/20">Ver</Link>
          {user?.is_staff && (
            <>
              <Link href={`/repuestos/${item.id}/edit`} className="text-sm text-gray-200 px-2 py-1 border border-white/20 rounded hover:border-orange-400/60">Editar</Link>
              <button onClick={handleDelete} className="text-sm text-red-400 px-2 py-1 hover:text-red-300">Borrar</button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
