import { useEffect, useState } from 'react'
import Link from 'next/link'
import RequireAuth from '../../components/RequireAuth'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useAuth } from '../../context/AuthContext'
import { fetchWithAuth } from '../../lib/auth'

export default function CuponesList() {
  const { user } = useAuth()
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const res = await fetchWithAuth('/coupons/')
        if (!res.ok) throw new Error('Error cargando cupones')
        const data = await res.json()
        const list = data.results || data
        setCoupons(Array.isArray(list) ? list : [])
      } catch (e) {
        setError('No se pudieron cargar los cupones')
      } finally {
        setLoading(false)
      }
    }
    if (user?.is_staff) load()
  }, [user])

  return (
    <RequireAuth>
      <div className="min-h-screen flex flex-col bg-[#121212]">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Cupones</h1>
            <Link href="/cupones/new" className="text-sm text-white bg-gradient-to-r from-red-600 to-orange-500 px-4 py-2 rounded-md">
              Crear cupón
            </Link>
          </div>

          {!user?.is_staff ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 text-gray-300">
              Acceso solo para administradores.
            </div>
          ) : loading ? (
            <div className="text-gray-400">Cargando...</div>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              {coupons.length === 0 ? (
                <div className="text-gray-400">No hay cupones.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-400 border-b border-white/10">
                        <th className="py-2">Código</th>
                        <th className="py-2">Tipo</th>
                        <th className="py-2">Valor</th>
                        <th className="py-2">Activo</th>
                        <th className="py-2">Válido</th>
                        <th className="py-2">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map(c => (
                        <tr key={c.id} className="border-b border-white/5 text-gray-200">
                          <td className="py-2 font-semibold">{c.code}</td>
                          <td className="py-2">{c.discount_type === 'percent' ? 'Porcentaje' : 'Fijo'}</td>
                          <td className="py-2">{c.discount_value}</td>
                          <td className="py-2">{c.active ? 'Sí' : 'No'}</td>
                          <td className="py-2">
                            {new Date(c.valid_from).toLocaleDateString('es-AR')} - {new Date(c.valid_to).toLocaleDateString('es-AR')}
                          </td>
                          <td className="py-2">
                            <Link href={`/cupones/${c.id}/edit`} className="text-orange-300 hover:text-orange-200">
                              Editar
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </RequireAuth>
  )
}
