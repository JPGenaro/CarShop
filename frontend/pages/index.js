import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Filter, Search, Wrench } from 'lucide-react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Footer from '../components/Footer'
import RepuestoCard from '../components/RepuestoCard'
import Pagination from '../components/Pagination'
import { SkeletonCard } from '../components/Skeleton'
import RecentlyViewed from '../components/RecentlyViewed'

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
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [maxPrice, setMaxPrice] = useState(10000)

  function onlyDigits(value) {
    return value.replace(/\D/g, '')
  }

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
    if (priceRange[0] > 0) params.append('price__gte', priceRange[0])
    if (priceRange[1] < maxPrice) params.append('price__lte', priceRange[1])

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
  }, [search, brand, model, year, category, ordering, page, priceRange, maxPrice])

  useEffect(() => {
    if (!search || search.trim().length < 2) {
      setSuggestions([])
      return
    }
    const term = search.trim()
    const timeout = setTimeout(() => {
      setSuggestLoading(true)
      fetch(`${API_BASE}/repuestos/?search=${encodeURIComponent(term)}&page=1`)
        .then(res => res.json())
        .then(data => {
          const results = data.results || data
          setSuggestions(Array.isArray(results) ? results.slice(0, 6) : [])
        })
        .catch(() => setSuggestions([]))
        .finally(() => setSuggestLoading(false))
    }, 350)
    return () => clearTimeout(timeout)
  }, [search])

  function clearFilters() {
    setSearch('')
    setBrand('')
    setModel('')
    setYear('')
    setCategory('')
    setOrdering('')
    setPriceRange([0, maxPrice])
    setPage(1)
  }

  const categoryLabel = categories.find(c => String(c.id) === String(category))?.name
  const orderingLabel = {
    price: 'Precio ↑',
    '-price': 'Precio ↓',
    name: 'Nombre ↑',
    '-created_at': 'Recientes',
  }[ordering]

  return (
    <div>
      <Navbar />
      <Hero />
      <RecentlyViewed />
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
            <div className="flex flex-col gap-4">
              <div className="relative">
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-4 py-3">
                <Search size={18} className="text-orange-400" />
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  className="bg-transparent outline-none text-gray-100 placeholder:text-gray-500 w-full"
                  placeholder="Buscar repuestos por nombre, SKU o descripción..."
                />
                </div>
                {showSuggestions && (suggestions.length > 0 || suggestLoading) && (
                  <div className="absolute z-20 mt-2 w-full rounded-xl border border-white/10 bg-[#121212] shadow-xl">
                    {suggestLoading ? (
                      <div className="px-4 py-3 text-sm text-gray-400">Buscando...</div>
                    ) : (
                      <ul className="max-h-64 overflow-y-auto">
                        {suggestions.map(s => (
                          <li key={s.id}>
                            <button
                              type="button"
                              onMouseDown={() => {
                                setSearch(s.name)
                                setShowSuggestions(false)
                                setPage(1)
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/10"
                            >
                              <span className="font-medium">{s.name}</span>
                              {s.sku && <span className="ml-2 text-xs text-gray-500">SKU: {s.sku}</span>}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
                <motion.div whileHover={{ y: -2 }} className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-4 py-3 xl:col-span-1">
                  <Filter size={18} className="text-orange-400" />
                  <input
                    value={brand}
                    onChange={e => { setBrand(e.target.value); setPage(1) }}
                    className="bg-transparent outline-none text-gray-100 placeholder:text-gray-500 w-full"
                    placeholder="Marca"
                  />
                </motion.div>

                <motion.div whileHover={{ y: -2 }} className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-4 py-3 xl:col-span-1">
                  <input
                    value={model}
                    onChange={e => { setModel(e.target.value); setPage(1) }}
                    className="bg-transparent outline-none text-gray-100 placeholder:text-gray-500 w-full"
                    placeholder="Modelo"
                  />
                </motion.div>

                <motion.div whileHover={{ y: -2 }} className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-4 py-3 xl:col-span-1">
                  <input
                    value={year}
                    onChange={e => { setYear(onlyDigits(e.target.value)); setPage(1) }}
                    className="bg-transparent outline-none text-gray-100 placeholder:text-gray-500 w-full"
                    placeholder="Año"
                  />
                </motion.div>

                <select value={category} onChange={e => { setCategory(e.target.value); setPage(1) }} className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-gray-100 xl:col-span-2" disabled={loading}>
                  <option value="">Todas las categorías</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>

                <select value={ordering} onChange={e => { setOrdering(e.target.value); setPage(1) }} className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-gray-100 xl:col-span-1" disabled={loading}>
                  <option value="">Ordenar</option>
                  <option value="price">Precio ↑</option>
                  <option value="-price">Precio ↓</option>
                  <option value="name">Nombre ↑</option>
                  <option value="-created_at">Recientes</option>
                </select>

              </div>
            </div>

            {/* Price Range Slider */}
            <div className="mt-4 p-4 rounded-xl bg-black/20 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-gray-300">
                  Rango de precio
                </label>
                <div className="text-sm text-orange-400 font-semibold">
                  ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
                </div>
              </div>
              
              <div className="relative h-8 flex items-center">
                {/* Track background */}
                <div className="absolute w-full h-2 bg-gray-700 rounded-lg"></div>
                
                {/* Active range */}
                <div 
                  className="absolute h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg"
                  style={{
                    left: `${(priceRange[0] / maxPrice) * 100}%`,
                    right: `${100 - (priceRange[1] / maxPrice) * 100}%`
                  }}
                ></div>
                
                {/* Min slider */}
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  step="100"
                  value={priceRange[0]}
                  onChange={(e) => {
                    const newMin = Number(e.target.value)
                    if (newMin < priceRange[1]) {
                      setPriceRange([newMin, priceRange[1]])
                      setPage(1)
                    }
                  }}
                  className="absolute w-full appearance-none bg-transparent pointer-events-none cursor-pointer"
                  style={{
                    WebkitAppearance: 'none',
                    zIndex: 3
                  }}
                />
                
                {/* Max slider */}
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  step="100"
                  value={priceRange[1]}
                  onChange={(e) => {
                    const newMax = Number(e.target.value)
                    if (newMax > priceRange[0]) {
                      setPriceRange([priceRange[0], newMax])
                      setPage(1)
                    }
                  }}
                  className="absolute w-full appearance-none bg-transparent pointer-events-none cursor-pointer"
                  style={{
                    WebkitAppearance: 'none',
                    zIndex: 4
                  }}
                  style={{
                    WebkitAppearance: 'none',
                  }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>$0</span>
                <span>${maxPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-xl border border-orange-400/40 bg-black/40 px-4 py-2 text-sm text-orange-300 hover:border-orange-400/70 hover:text-orange-200 transition-colors"
              >
                Limpiar filtros
              </button>
            </div>

            {(search || brand || model || year || category || ordering || priceRange[0] > 0 || priceRange[1] < maxPrice) && (
              <div className="mt-4 flex flex-wrap gap-2 items-center">
                {search && (
                  <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-gray-200">Búsqueda: {search}</span>
                )}
                {brand && (
                  <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-gray-200">Marca: {brand}</span>
                )}
                {model && (
                  <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-gray-200">Modelo: {model}</span>
                )}
                {year && (
                  <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-gray-200">Año: {year}</span>
                )}
                {category && (
                  <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-gray-200">Categoría: {categoryLabel || category}</span>
                )}
                {ordering && (
                  <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-gray-200">Orden: {orderingLabel || ordering}</span>
                )}
                {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                  <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-gray-200">
                    Precio: ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
                  </span>
                )}
                <button type="button" onClick={clearFilters} className="text-xs text-orange-300 hover:text-orange-200">
                  Limpiar filtros
                </button>
              </div>
            )}
          </motion.div>
        </div>

        {loading ? (
          <div className="flex flex-wrap gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]" style={{ maxWidth: '340px' }}>
                <SkeletonCard />
              </div>
            ))}
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
                className="flex flex-wrap gap-6"
              >
                {items.map(item => (
                  <div key={item.id} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]" style={{ maxWidth: '340px' }}>
                    <RepuestoCard item={item} />
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex justify-center">
              <Pagination total={count} page={page} onPage={p => setPage(p)} />
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
