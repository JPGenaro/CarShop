import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
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
  const [additionalImages, setAdditionalImages] = useState([])
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
      if (imageFile) fd.append('image', imageFile)

      const res = await fetchWithAuth('/repuestos/', {
        method: 'POST',
        body: fd,
      })

      if (!res.ok) throw new Error('Error creando repuesto')
      const newItem = await res.json()
      
      // Upload additional images if any
      if (additionalImages.length > 0) {
        for (let i = 0; i < additionalImages.length; i++) {
          const imgFd = new FormData()
          imgFd.append('repuesto', newItem.id)
          imgFd.append('image', additionalImages[i])
          imgFd.append('orden', i + 1)
          
          await fetchWithAuth('/imagenes/', {
            method: 'POST',
            body: imgFd,
          })
        }
      }
      
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
                <label className="block text-sm font-medium mb-2 text-gray-200">Imagen Principal</label>
                <div className="border border-white/10 rounded-lg p-4 bg-black/20">
                  {imageFile ? (
                    <div className="relative">
                      <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-48 object-cover rounded-lg mb-2" />
                      <button
                        type="button"
                        onClick={() => setImageFile(null)}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-48 cursor-pointer border-2 border-dashed border-white/20 rounded-lg hover:border-orange-400/50 transition-colors">
                      <Upload size={32} className="text-gray-400 mb-2" />
                      <span className="text-sm text-gray-400">Click para subir imagen</span>
                      <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-200">Imágenes Adicionales (Galería)</label>
                <div className="border border-white/10 rounded-lg p-4 bg-black/20">
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {additionalImages.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img src={URL.createObjectURL(img)} alt={`Preview ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => setAdditionalImages(additionalImages.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <label className="flex items-center justify-center h-24 cursor-pointer border-2 border-dashed border-white/20 rounded-lg hover:border-orange-400/50 transition-colors">
                    <ImageIcon size={24} className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-400">Agregar imágenes</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple
                      onChange={e => {
                        const files = Array.from(e.target.files || [])
                        setAdditionalImages([...additionalImages, ...files])
                      }}
                      className="hidden" 
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">{additionalImages.length} imagen(es) adicional(es)</p>
                </div>
              </div>

              {error && <p className="text-red-400">{error}</p>}
              <div className="flex gap-3 pt-4">
                <button disabled={loading} className="flex-1 bg-gradient-to-r from-red-600 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? 'Creando...' : 'Crear Repuesto'}
                </button>
                <button type="button" onClick={() => router.push('/')} className="px-6 py-3 border border-white/10 rounded-lg text-gray-300 hover:border-white/30 transition-colors">Cancelar</button>
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
