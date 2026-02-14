import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import RequireAuth from '../../../components/RequireAuth'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'
import { SkeletonDetail } from '../../../components/Skeleton'
import { fetchWithAuth } from '../../../lib/auth'
import { useAuth } from '../../../context/AuthContext'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

export default function EditRepuesto() {
  const router = useRouter()
  const { id } = router.query
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
  const [existingImages, setExistingImages] = useState([])
  const [additionalImages, setAdditionalImages] = useState([])
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(null)

  function onlyDigits(value) {
    return value.replace(/\D/g, '')
  }

  function onlyDecimal(value) {
    const cleaned = value.replace(/[^\d.]/g, '')
    const parts = cleaned.split('.')
    if (parts.length <= 1) return cleaned
    return `${parts[0]}.${parts.slice(1).join('')}`
  }

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
        setBrand(item.brand || '')
        setModel(item.model || '')
        setYear(item.year || '')
        setCategoryId(item.category?.id || '')
        setImageUrl(item.image || '')
        setExistingImages(item.imagenes || [])
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
    setSaving(true)

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

      const res = await fetchWithAuth(`/repuestos/${id}/`, {
        method: 'PUT',
        body: fd,
      })

      if (!res.ok) throw new Error('Error actualizando')
      
      // Upload additional images if any
      if (additionalImages.length > 0) {
        for (let i = 0; i < additionalImages.length; i++) {
          const imgFd = new FormData()
          imgFd.append('repuesto', id)
          imgFd.append('image', additionalImages[i])
          imgFd.append('orden', existingImages.length + i + 1)
          
          await fetchWithAuth('/imagenes/', {
            method: 'POST',
            body: imgFd,
          })
        }
      }
      
      router.push(`/repuestos/${id}`)
    } catch (err) {
      console.error(err)
      setError('No se pudo actualizar el repuesto')
    } finally {
      setSaving(false)
    }
  }

  async function deleteImage(imageId) {
    if (!confirm('¿Eliminar esta imagen?')) return
    try {
      await fetchWithAuth(`/imagenes/${imageId}/`, { method: 'DELETE' })
      setExistingImages(existingImages.filter(img => img.id !== imageId))
    } catch (e) {
      console.error('Error eliminando imagen', e)
    }
  }

  if (loading) return (
    <RequireAuth>
      <div className="min-h-screen flex flex-col bg-[#121212]">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12">
          <SkeletonDetail />
        </main>
        <Footer />
      </div>
    </RequireAuth>
  )

  return (
    <RequireAuth>
      <div className="min-h-screen flex flex-col bg-[#121212]">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-8 text-gray-100">Editar Repuesto</h1>
          {!user?.is_staff ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 max-w-2xl w-full text-gray-300">
              Solo administradores pueden editar repuestos.
            </div>
          ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 max-w-3xl w-full">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Nombre</label>
                  <input value={name} onChange={e => setName(e.target.value)} className="w-full border border-white/10 rounded-lg px-4 py-2 bg-black/40 text-gray-100 focus:border-orange-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">SKU</label>
                  <input value={sku} onChange={e => setSku(e.target.value)} className="w-full border border-white/10 rounded-lg px-4 py-2 bg-black/40 text-gray-100 focus:border-orange-400 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Descripción</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-white/10 rounded-lg px-4 py-2 bg-black/40 text-gray-100 focus:border-orange-400 focus:outline-none" rows={4} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Marca</label>
                  <input value={brand} onChange={e => setBrand(e.target.value)} className="w-full border border-white/10 rounded-lg px-4 py-2 bg-black/40 text-gray-100 focus:border-orange-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Modelo</label>
                  <input value={model} onChange={e => setModel(e.target.value)} className="w-full border border-white/10 rounded-lg px-4 py-2 bg-black/40 text-gray-100 focus:border-orange-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Año</label>
                  <input value={year} onChange={e => setYear(onlyDigits(e.target.value))} className="w-full border border-white/10 rounded-lg px-4 py-2 bg-black/40 text-gray-100 focus:border-orange-400 focus:outline-none" inputMode="numeric" maxLength={4} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Precio</label>
                  <input value={price} onChange={e => setPrice(onlyDecimal(e.target.value))} className="w-full border border-white/10 rounded-lg px-4 py-2 bg-black/40 text-gray-100 focus:border-orange-400 focus:outline-none" inputMode="decimal" pattern="[0-9.]*" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Stock</label>
                  <input value={stock} onChange={e => setStock(onlyDigits(e.target.value))} className="w-full border border-white/10 rounded-lg px-4 py-2 bg-black/40 text-gray-100 focus:border-orange-400 focus:outline-none" inputMode="numeric" pattern="\d*" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Categoría</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full border border-white/10 rounded-lg px-4 py-2 bg-black/40 text-gray-100 focus:border-orange-400 focus:outline-none">
                  <option value="">-- seleccionar --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
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
                  ) : imageUrl ? (
                    <div className="relative">
                      <img src={imageUrl} alt="Current" className="w-full h-48 object-cover rounded-lg mb-2" />
                      <label className="absolute bottom-3 right-3 cursor-pointer px-3 py-1 bg-orange-500 rounded-lg text-white text-sm hover:bg-orange-600">
                        Cambiar
                        <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="hidden" />
                      </label>
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
                <label className="block text-sm font-medium mb-2 text-gray-200">Galería de Imágenes</label>
                <div className="border border-white/10 rounded-lg p-4 bg-black/20">
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {existingImages.map((img) => (
                      <div key={img.id} className="relative group">
                        <img src={img.image} alt={`Imagen ${img.orden}`} className="w-full h-24 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => deleteImage(img.id)}
                          className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {additionalImages.map((img, idx) => (
                      <div key={`new-${idx}`} className="relative">
                        <img src={URL.createObjectURL(img)} alt={`Nueva ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
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
                    <span className="text-sm text-gray-400">Agregar más imágenes</span>
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
                  <p className="text-xs text-gray-500 mt-2">{existingImages.length + additionalImages.length} imagen(es) total(es)</p>
                </div>
              </div>

              {error && <p className="text-red-400">{error}</p>}
              <div className="flex gap-3 pt-4">
                <button disabled={saving} className="flex-1 bg-gradient-to-r from-red-600 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button type="button" onClick={() => router.push(`/repuestos/${id}`)} className="px-6 py-3 border border-white/10 rounded-lg text-gray-300 hover:border-white/30 transition-colors">Cancelar</button>
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
