import { useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const router = useRouter()
  const { login } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      await login(username, password)
      router.push('/')
    } catch (err) {
      console.error(err)
      setError('Credenciales incorrectas')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4 text-center">Iniciar sesión</h1>
          <form onSubmit={handleSubmit} className="">
            <label className="block mb-2 text-sm font-medium">Usuario</label>
            <input value={username} onChange={e=>setUsername(e.target.value)} className="w-full border rounded px-3 py-2 mb-4" />
            <label className="block mb-2 text-sm font-medium">Contraseña</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded px-3 py-2 mb-4" />
            {error && <p className="text-red-600 mb-2">{error}</p>}
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded">Entrar</button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
