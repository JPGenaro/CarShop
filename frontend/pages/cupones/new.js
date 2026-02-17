import { useState } from 'react'
import { useRouter } from 'next/router'
import RequireAuth from '../../components/RequireAuth'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { fetchWithAuth } from '../../lib/auth'
import { useAuth } from '../../context/AuthContext'

export default function NewCupon() {
  const router = useRouter()
  const { user } = useAuth()
  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState('percent')
  const [discountValue, setDiscountValue] = useState('')
  const [active, setActive] = useState(true)
  const [validFrom, setValidFrom] = useState('')
  const [validTo, setValidTo] = useState('')
  const [usageLimit, setUsageLimit] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  function validate() {
    const errors = {}
    if (!code.trim()) errors.code = 'Código requerido.'
    if (!discountValue) errors.discountValue = 'Descuento requerido.'
    if (!validFrom) errors.validFrom = 'Fecha inicio requerida.'
    if (!validTo) errors.validTo = 'Fecha fin requerida.'
    if (validFrom && validTo && new Date(validFrom) > new Date(validTo)) {
      errors.validTo = 'La fecha fin debe ser posterior a la de inicio.'
    }
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
      code: code.trim().toUpperCase(),
      discount_type: discountType,
      discount_value: Number(discountValue),
      active,
      valid_from: new Date(validFrom).toISOString(),
      valid_to: new Date(validTo).toISOString(),
    }
    if (usageLimit) payload.usage_limit = Number(usageLimit)

    try {
      const res = await fetchWithAuth('/coupons/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Error creando cupón')
      router.push('/')
    } catch (err) {
      console.error(err)
      setError('No se pudo crear el cupón')
    } finally {
      setLoading(false)
    }
  }

  return (
    <RequireAuth>
      <div className="min-h-screen flex flex-col bg-[#121212]">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-4">Crear Cupón</h1>
          {!user?.is_staff ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 max-w-2xl w-full text-gray-300">
              Solo administradores pueden crear cupones.
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 max-w-2xl w-full">
              {error && <p className="text-red-400 mb-3">{error}</p>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Código</label>
                  <input
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className={`w-full border ${fieldErrors.code ? 'border-red-500/60' : 'border-white/10'} rounded px-3 py-2 bg-black/40 text-gray-100`}
                  />
                  {fieldErrors.code && <p className="text-sm text-red-400">{fieldErrors.code}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Tipo de descuento</label>
                    <select
                      value={discountType}
                      onChange={e => setDiscountType(e.target.value)}
                      className="w-full border border-white/10 rounded px-3 py-2 bg-black/40 text-gray-100"
                    >
                      <option value="percent">Porcentaje</option>
                      <option value="fixed">Monto fijo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Valor descuento</label>
                    <input
                      value={discountValue}
                      onChange={e => setDiscountValue(e.target.value)}
                      className={`w-full border ${fieldErrors.discountValue ? 'border-red-500/60' : 'border-white/10'} rounded px-3 py-2 bg-black/40 text-gray-100`}
                      inputMode="decimal"
                    />
                    {fieldErrors.discountValue && <p className="text-sm text-red-400">{fieldErrors.discountValue}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Válido desde</label>
                    <input
                      type="datetime-local"
                      value={validFrom}
                      onChange={e => setValidFrom(e.target.value)}
                      className={`w-full border ${fieldErrors.validFrom ? 'border-red-500/60' : 'border-white/10'} rounded px-3 py-2 bg-black/40 text-gray-100`}
                    />
                    {fieldErrors.validFrom && <p className="text-sm text-red-400">{fieldErrors.validFrom}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Válido hasta</label>
                    <input
                      type="datetime-local"
                      value={validTo}
                      onChange={e => setValidTo(e.target.value)}
                      className={`w-full border ${fieldErrors.validTo ? 'border-red-500/60' : 'border-white/10'} rounded px-3 py-2 bg-black/40 text-gray-100`}
                    />
                    {fieldErrors.validTo && <p className="text-sm text-red-400">{fieldErrors.validTo}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Límite de uso (opcional)</label>
                    <input
                      value={usageLimit}
                      onChange={e => setUsageLimit(e.target.value)}
                      className="w-full border border-white/10 rounded px-3 py-2 bg-black/40 text-gray-100"
                      inputMode="numeric"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      id="active"
                      type="checkbox"
                      checked={active}
                      onChange={e => setActive(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <label htmlFor="active" className="text-sm text-gray-200">Activo</label>
                  </div>
                </div>

                <button
                  disabled={loading}
                  className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 py-2 rounded-md"
                >
                  {loading ? 'Guardando...' : 'Crear Cupón'}
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
