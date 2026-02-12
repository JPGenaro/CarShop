import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Filter, Search, Wrench } from 'lucide-react'
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
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
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
    if (brand) params.append('brand', brand)
    if (model) params.append('model', model)
    if (year) params.append('year', year)
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
  }, [search, brand, model, year, category, ordering, page])

  return (
    <div>
      <Navbar />
      <Hero />
      <main id="repuestos" className="container mx-auto py-12 px-4">
        <div className="flex items-center gap-3 mb-6">
          <Wrench className="text-orange-400" size={22} />
          <h1 className="text-3xl font-bold">Repuestos</h1>
        </div>

        <div className="relative -mt-16 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 shadow-2xl shadow-black/50"
          >
            <div className="flex flex-col lg:flex-row gap-4 items-stretch">
              <div className="flex items-center gap-3 flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-3">
                <Search size={18} className="text-orange-400" />
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                  className="bg-transparent outline-none text-gray-100 placeholder:text-gray-500 w-full"
                  placeholder="Buscar repuestos por nombre, SKU o descripción..."
                />
              </div>

              <motion.div whileHover={{ y: -2 }} className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-4 py-3">
                <Filter size={18} className="text-orange-400" />
                <input
                  value={brand}
                  onChange={e => { setBrand(e.target.value); setPage(1) }}
                  className="bg-transparent outline-none text-gray-100 placeholder:text-gray-500 w-32"
                  placeholder="Marca"
                />
              </motion.div>

              <motion.div whileHover={{ y: -2 }} className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-4 py-3">
                <input
                  value={model}
                  onChange={e => { setModel(e.target.value); setPage(1) }}
                  className="bg-transparent outline-none text-gray-100 placeholder:text-gray-500 w-32"
                  placeholder="Modelo"
                />
              </motion.div>

              <motion.div whileHover={{ y: -2 }} className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-4 py-3">
                <input
                  value={year}
                  onChange={e => { setYear(e.target.value); setPage(1) }}
                  className="bg-transparent outline-none text-gray-100 placeholder:text-gray-500 w-24"
                  placeholder="Año"
                />
              </motion.div>

              <select value={category} onChange={e => { setCategory(e.target.value); setPage(1) }} className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-gray-100" disabled={loading}>
                <option value="">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              <select value={ordering} onChange={e => { setOrdering(e.target.value); setPage(1) }} className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-gray-100" disabled={loading}>
                <option value="">Ordenar</option>
                <option value="price">Precio ↑</option>
                <option value="-price">Precio ↓</option>
                <option value="name">Nombre ↑</option>
                <option value="-created_at">Recientes</option>
              </select>
            </div>
          </motion.div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size={8} />
          </div>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : items.length === 0 ? (
          <p className="text-gray-400">No se encontraron repuestos.</p>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${category}-${search}-${ordering}-${page}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {items.map(item => (
                  <RepuestoCard key={item.id} item={item} />
                ))}
              </motion.div>
            </AnimatePresence>

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
