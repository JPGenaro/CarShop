import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import RequireAuth from '../../components/RequireAuth'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { fetchWithAuth } from '../../lib/auth'
import { useAuth } from '../../context/AuthContext'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

export default function NewRepuesto() {
  const router = useRouter()
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  function onlyDigits(value) {
    return value.replace(/\D/g, '')
  }

  function onlyDecimal(value) {
    const cleaned = value.replace(/[^\d.]/g, '')
    const parts = cleaned.split('.')
    if (parts.length <= 1) return cleaned
    return `${parts[0]}.${parts.slice(1).join('')}`
  }

  function validate() {
    const errors = {}
    if (!name || name.length < 3) errors.name = 'Nombre mínimo 3 caracteres.'
    if (!price) errors.price = 'Precio requerido.'
    if (!categoryId) errors.categoryId = 'Seleccioná una categoría.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  useEffect(() => {
    fetch(`${API_BASE}/categorias/`)
      .then(r => r.json())
      .then(d => {
        const list = d.results || d
        setCategories(Array.isArray(list) ? list : [])
      })
      .catch(() => setCategories([]))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    if (!validate()) {
      setLoading(false)
      return
    }

    try {
      let res
      if (imageFile) {
        const fd = new FormData()
        fd.append('name', name)
        fd.append('sku', sku)
        fd.append('description', description)
        fd.append('brand', brand)
        fd.append('model', model)
        if (year) fd.append('year', parseInt(year))
        fd.append('price', parseFloat(price) || 0)
        fd.append('stock', parseInt(stock) || 0)
        if (categoryId) fd.append('category_id', categoryId)
        fd.append('image', imageFile)

        res = await fetchWithAuth('/repuestos/', {
          method: 'POST',
          body: fd,
        })
      } else {
        const body = {
          name,
          sku,
          description,
          brand,
          model,
          year: year ? parseInt(year) : null,
          price: parseFloat(price) || 0,
          stock: parseInt(stock) || 0,
          category_id: categoryId || null,
          image: imageUrl || null,
        }

        res = await fetchWithAuth('/repuestos/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }

      if (!res.ok) throw new Error('Error creando repuesto')
      await res.json()
      router.push('/')
    } catch (err) {
      console.error(err)
      setError('No se pudo crear el repuesto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <RequireAuth>
      <div className="min-h-screen flex flex-col bg-[#121212]">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-4">Crear Repuesto</h1>
          {!user?.is_staff ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 max-w-2xl w-full text-gray-300">
              Solo administradores pueden crear repuestos.
            </div>
          ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 max-w-2xl w-full">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Nombre</label>
                <input value={name} onChange={e => setName(e.target.value)} className={`w-full border ${fieldErrors.name ? 'border-red-500/60' : 'border-white/10'} rounded px-3 py-2 bg-black/40 text-gray-100`} />
                {fieldErrors.name && <p className="text-sm text-red-400">{fieldErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium">SKU</label>
                <input value={sku} onChange={e => setSku(e.target.value)} className="w-full border border-white/10 rounded px-3 py-2 bg-black/40 text-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium">Descripción</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-white/10 rounded px-3 py-2 bg-black/40 text-gray-100" rows={4} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium">Marca</label>
                  <input value={brand} onChange={e => setBrand(e.target.value)} className="w-full border border-white/10 rounded px-3 py-2 bg-black/40 text-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Modelo</label>
                  <input value={model} onChange={e => setModel(e.target.value)} className="w-full border border-white/10 rounded px-3 py-2 bg-black/40 text-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Año</label>
                  <input value={year} onChange={e => setYear(onlyDigits(e.target.value))} className="w-full border border-white/10 rounded px-3 py-2 bg-black/40 text-gray-100" inputMode="numeric" maxLength={4} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Precio</label>
                  <input
                    value={price}
                    onChange={e => setPrice(onlyDecimal(e.target.value))}
                    className={`w-full border ${fieldErrors.price ? 'border-red-500/60' : 'border-white/10'} rounded px-3 py-2 bg-black/40 text-gray-100`}
                    inputMode="decimal"
                    pattern="[0-9.]*"
                  />
                  {fieldErrors.price && <p className="text-sm text-red-400">{fieldErrors.price}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium">Stock</label>
                  <input value={stock} onChange={e => setStock(onlyDigits(e.target.value))} className="w-full border border-white/10 rounded px-3 py-2 bg-black/40 text-gray-100" inputMode="numeric" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Categoría</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className={`w-full border ${fieldErrors.categoryId ? 'border-red-500/60' : 'border-white/10'} rounded px-3 py-2 bg-black/40 text-gray-100`}>
                  <option value="">-- seleccionar --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {fieldErrors.categoryId && <p className="text-sm text-red-400">{fieldErrors.categoryId}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium">Imagen (archivo) <span className="text-xs text-gray-500">o pega URL abajo</span></label>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="w-full mb-2" />
                <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full border border-white/10 rounded px-3 py-2 bg-black/40 text-gray-100" placeholder="https://... (opcional)" />
              </div>
              {error && <p className="text-red-400">{error}</p>}
              <div className="flex gap-3">
                <button disabled={loading} className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 py-2 rounded">Crear</button>
                <button type="button" onClick={() => router.push('/')} className="px-4 py-2 border border-white/10 rounded text-gray-300">Cancelar</button>
              </div>
            </form>
          </div>
          )}
        </main>
        <Footer />
      </div>
    </RequireAuth>
  )
}
