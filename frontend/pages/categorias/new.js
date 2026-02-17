import { useState } from 'react'
import { useRouter } from 'next/router'
import RequireAuth from '../../components/RequireAuth'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { fetchWithAuth } from '../../lib/auth'
import { useAuth } from '../../context/AuthContext'

export default function NewCategoria() {
  const router = useRouter()
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  function validate() {
    const errors = {}
    if (!name || name.length < 3) errors.name = 'Nombre mínimo 3 caracteres.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    if (!validate()) {
      setLoading(false)
      return
    }

    const payload = {
      name,
      description,
    }
    if (slug.trim()) payload.slug = slug.trim()

    try {
      const res = await fetchWithAuth('/categorias/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Error creando categoría')
      router.push('/')
    } catch (err) {
      console.error(err)
      setError('No se pudo crear la categoría')
    } finally {
      setLoading(false)
    }
  }

  return (
    <RequireAuth>
      <div className="min-h-screen flex flex-col bg-[#121212]">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-4">Crear Categoría</h1>
          {!user?.is_staff ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 max-w-2xl w-full text-gray-300">
              Solo administradores pueden crear categorías.
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 max-w-2xl w-full">
              {error && <p className="text-red-400 mb-3">{error}</p>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Nombre</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className={`w-full border ${fieldErrors.name ? 'border-red-500/60' : 'border-white/10'} rounded px-3 py-2 bg-black/40 text-gray-100`}
                  />
                  {fieldErrors.name && <p className="text-sm text-red-400">{fieldErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium">Slug (opcional)</label>
                  <input
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    className="w-full border border-white/10 rounded px-3 py-2 bg-black/40 text-gray-100"
                    placeholder="Se genera automáticamente si lo dejás vacío"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Descripción</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full border border-white/10 rounded px-3 py-2 bg-black/40 text-gray-100"
                    rows={4}
                  />
                </div>
                <button
                  disabled={loading}
                  className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 py-2 rounded-md"
                >
                  {loading ? 'Guardando...' : 'Crear Categoría'}
                </button>
              </form>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </RequireAuth>
  )
}
