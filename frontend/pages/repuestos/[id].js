import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../../components/Navbar'

export default function RepuestoDetail() {
  const router = useRouter()
  const { id } = router.query
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetch(`http://127.0.0.1:8000/api/repuestos/${id}/`)
      .then(res => res.json())
      .then(data => {
        setItem(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [id])

  return (
    <div>
      <Navbar />
      <main className="container py-10">
        {loading ? (
          <p className="text-gray-400">Cargando...</p>
        ) : item ? (
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
              <p className="mt-4 text-gray-300 leading-relaxed">{item.description}</p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <span className="text-2xl font-semibold text-orange-400">${item.price}</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <p className="text-gray-400">No encontrado</p>
        )}
      </main>
    </div>
  )
}
