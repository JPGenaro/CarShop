import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { fetchWithAuth } from '../lib/auth'

function truncate(text, n = 120) {
  if (!text) return ''
  return text.length > n ? text.slice(0, n) + '...' : text
}

export default function RepuestoCard({ item }) {
  const router = useRouter()
  const { user } = useAuth()
  const meta = [item.brand, item.model, item.year].filter(Boolean).join(' • ')

  async function handleDelete() {
    if (!confirm('¿Eliminar este repuesto?')) return
    try {
      const res = await fetchWithAuth(`/repuestos/${item.id}/`, { method: 'DELETE' })
      if (!res.ok) throw new Error('delete failed')
      // refresh list
      router.reload()
    } catch (e) {
      console.error(e)
      alert('No se pudo eliminar')
    }
  }

  return (
    <motion.div
      layout
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="border border-white/10 rounded-2xl p-4 bg-white/5 backdrop-blur-xl shadow-lg shadow-black/40 flex flex-col"
    >
      {item.image && (
        <div className="h-44 w-full mb-3 overflow-hidden rounded-xl bg-black/30 flex items-center justify-center">
          <motion.img layoutId={`repuesto-image-${item.id}`} src={item.image} alt={item.name} className="object-cover h-full w-full" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-100">{item.name}</h3>
      <p className="text-sm text-gray-400">SKU: {item.sku || '—'}</p>
      {meta && <p className="text-sm text-gray-400">{meta}</p>}
      <p className="mt-2 text-orange-400 font-bold text-lg">${item.price}</p>
      <p className="text-sm text-gray-400 mt-2">{truncate(item.description)}</p>
      <div className="flex items-center justify-end mt-4">
        <div className="flex items-center gap-2">
          <Link href={`/repuestos/${item.id}`} className="text-sm text-white bg-gradient-to-r from-red-600 to-orange-500 px-3 py-1 rounded-md shadow-md shadow-red-500/20">Ver</Link>
          {user && (
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
