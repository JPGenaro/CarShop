import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import RequireAuth from '../../../components/RequireAuth'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'
import { fetchWithAuth } from '../../../lib/auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

export default function EditRepuesto({}) {
  const router = useRouter()
  const { id } = router.query
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [image, setImage] = useState('')
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    async function load() {
      try {
        const [resItem, resCats] = await Promise.all([
          fetch(`${API_BASE}/repuestos/${id}/`),
          fetch(`${API_BASE}/categorias/`),
        ])
        const item = await resItem.json()
        const cats = await resCats.json()
        const list = cats.results || cats
        setCategories(Array.isArray(list) ? list : [])
        setName(item.name || '')
        setSku(item.sku || '')
        setDescription(item.description || '')
        setPrice(item.price || '')
        setStock(item.stock || '')
        setCategoryId(item.category?.id || '')
        setImage(item.image || '')
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      const body = {
        name,
        sku,
        description,
        price: parseFloat(price) || 0,
        stock: parseInt(stock) || 0,
        category_id: categoryId || null,
        image: image || null,
      }
      const res = await fetchWithAuth(`/repuestos/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Error actualizando')
      router.push('/')
    } catch (err) {
      console.error(err)
      setError('No se pudo actualizar el repuesto')
    }
  }

  if (loading) return <div className="p-8">Cargando...</div>

  return (
    <RequireAuth>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold mb-4">Editar Repuesto</h1>
          <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Nombre</label>
                <input value={name} onChange={e=>setName(e.target.value)} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">SKU</label>
                <input value={sku} onChange={e=>setSku(e.target.value)} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Descripción</label>
                <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full border rounded px-3 py-2" rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Precio</label>
                  <input value={price} onChange={e=>setPrice(e.target.value)} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Stock</label>
                  <input value={stock} onChange={e=>setStock(e.target.value)} className="w-full border rounded px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Categoría</label>
                <select value={categoryId} onChange={e=>setCategoryId(e.target.value)} className="w-full border rounded px-3 py-2">
                  <option value="">-- seleccionar --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Imagen (URL temporal)</label>
                <input value={image} onChange={e=>setImage(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="https://..." />
              </div>
              {error && <p className="text-red-600">{error}</p>}
              <div className="flex gap-3">
                <button className="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
                <button type="button" onClick={()=>router.push('/')} className="px-4 py-2 border rounded">Cancelar</button>
              </div>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    </RequireAuth>
  )
}
