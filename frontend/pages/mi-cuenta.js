import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import RequireAuth from '../components/RequireAuth'
import { useAuth } from '../context/AuthContext'

export default function MiCuenta() {
  const { user } = useAuth()

  return (
    <RequireAuth>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold mb-4">Mi cuenta</h1>
          <div className="bg-white rounded-lg shadow p-6 max-w-md">
            <p><strong>Usuario:</strong> {user?.username}</p>
            <p className="mt-2"><strong>Email:</strong> {user?.email || '—'}</p>
          </div>
        </main>
        <Footer />
      </div>
    </RequireAuth>
  )
}
