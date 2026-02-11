import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Footer from '../components/Footer'
import RepuestoCard from '../components/RepuestoCard'
import Pagination from '../components/Pagination'
import Spinner from '../components/Spinner'

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
  const [error, setError] = useState(null)

  useEffect(() => {
    // fetch categories for the select
    fetch(`${API_BASE}/categorias/`)
      .then(res => res.json())
      .then(data => {
        // DRF may return a paginated response: { count, next, previous, results }
        const list = data.results || data
        setCategories(Array.isArray(list) ? list : [])
      })
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (category) params.append('category', category)
    if (ordering) params.append('ordering', ordering)
    if (page) params.append('page', page)

    fetch(`${API_BASE}/repuestos/?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error('Error fetching repuestos')
        return res.json()
      })
      .then(data => {
        const results = data.results || data
        setItems(results)
        setCount(data.count || (Array.isArray(data) ? data.length : 0))
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setItems([])
        setError('No se pudo cargar repuestos')
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
      <Hero />
      <main id="repuestos" className="container mx-auto max-w-6xl py-12 px-4">
        <h1 className="text-3xl font-bold mb-6">Repuestos</h1>

        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3 mb-6 items-center">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-3 py-2 flex-1 shadow-sm"
            placeholder="Buscar repuestos..."
            disabled={loading}
          />

          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1) }} className="border rounded px-3 py-2 shadow-sm" disabled={loading}>
            <option value="">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <select value={ordering} onChange={e => { setOrdering(e.target.value); setPage(1) }} className="border rounded px-3 py-2 shadow-sm" disabled={loading}>
            <option value="">Ordenar</option>
            <option value="price">Precio ↑</option>
            <option value="-price">Precio ↓</option>
            <option value="name">Nombre ↑</option>
            <option value="-created_at">Recientes</option>
          </select>

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
            {loading ? 'Cargando...' : 'Buscar'}
          </button>
        </form>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size={8} />
          </div>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : items.length === 0 ? (
          <p>No se encontraron repuestos.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(item => (
                <RepuestoCard key={item.id} item={item} />
              ))}
            </div>

            <div className="mt-8">
              <Pagination total={count} page={page} onPage={p => setPage(p)} />
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
