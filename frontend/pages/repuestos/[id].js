import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
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
      <main className="container py-8">
        {loading ? (
          <p>Cargando...</p>
        ) : item ? (
          <div className="bg-white p-6 rounded shadow">
            <h1 className="text-2xl font-bold">{item.name}</h1>
            <p className="text-sm text-gray-600">SKU: {item.sku || '—'}</p>
            <p className="mt-4">{item.description}</p>
            <p className="mt-4 text-indigo-600 font-semibold">${item.price}</p>
            <p className="text-sm text-gray-500">Stock: {item.stock}</p>
          </div>
        ) : (
          <p>No encontrado</p>
        )}
      </main>
    </div>
  )
}
