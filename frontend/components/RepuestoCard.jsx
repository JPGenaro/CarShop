import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import { fetchWithAuth } from '../lib/auth'

function truncate(text, n = 120) {
  if (!text) return ''
  return text.length > n ? text.slice(0, n) + '...' : text
}

export default function RepuestoCard({ item }) {
  const router = useRouter()
  const { user } = useAuth()

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
    <div className="border rounded-lg p-4 bg-white shadow hover:shadow-lg transform hover:-translate-y-1 transition-all duration-150 flex flex-col">
      {item.image && (
        <div className="h-44 w-full mb-3 overflow-hidden rounded-md bg-gray-100 flex items-center justify-center">
          <img src={item.image} alt={item.name} className="object-cover h-full w-full" />
        </div>
      )}
      <h3 className="text-lg font-semibold">{item.name}</h3>
      <p className="text-sm text-gray-600">SKU: {item.sku || '—'}</p>
      <p className="mt-2 text-indigo-600 font-bold text-lg">${item.price}</p>
      <p className="text-sm text-gray-500 mt-2">{truncate(item.description)}</p>
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-700">{item.stock > 0 ? `Stock: ${item.stock}` : <span className="text-red-600">Agotado</span>}</div>
        <div className="flex items-center gap-2">
          <Link href={`/repuestos/${item.id}`} className="text-sm text-white bg-blue-600 px-3 py-1 rounded-md">Ver</Link>
          {user && (
            <>
              <Link href={`/repuestos/${item.id}/edit`} className="text-sm text-gray-700 px-2 py-1 border rounded">Editar</Link>
              <button onClick={handleDelete} className="text-sm text-red-600 px-2 py-1">Borrar</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
