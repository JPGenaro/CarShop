import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import RepuestoCard from '../components/RepuestoCard'
import Pagination from '../components/Pagination'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

export default function Home() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [ordering, setOrdering] = useState('')
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    // fetch categories for the select
    fetch(`${API_BASE}/categorias/`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (category) params.append('category', category)
    if (ordering) params.append('ordering', ordering)
    if (page) params.append('page', page)

    fetch(`${API_BASE}/repuestos/?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        // DRF default paginated response has `results`
        const results = data.results || data
        setItems(results)
        setCount(data.count || (Array.isArray(data) ? data.length : 0))
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setItems([])
        setLoading(false)
      })
  }, [search, category, ordering, page])

  function handleSearchSubmit(e) {
    e.preventDefault()
    setPage(1)
  }

  return (
    <div>
      <Navbar />
      <main className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Repuestos</h1>

        <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-4">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
            placeholder="Buscar repuestos..."
          />

          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1) }} className="border rounded px-3 py-2">
            <option value="">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <select value={ordering} onChange={e => { setOrdering(e.target.value); setPage(1) }} className="border rounded px-3 py-2">
            <option value="">Ordenar</option>
            <option value="price">Precio ↑</option>
            <option value="-price">Precio ↓</option>
            <option value="name">Nombre ↑</option>
            <option value="-created_at">Recientes</option>
          </select>

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Buscar</button>
        </form>

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map(item => (
                <RepuestoCard key={item.id} item={item} />
              ))}
            </div>

            <div className="mt-6">
              <Pagination total={count} page={page} onPage={p => setPage(p)} />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
