import { useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import { login } from '../lib/auth'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      await login(username, password)
      router.push('/')
    } catch (err) {
      setError('Credenciales incorrectas')
    }
  }

  return (
    <div>
      <Navbar />
      <main className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <form onSubmit={handleSubmit} className="max-w-md">
          <label className="block mb-2">Usuario</label>
          <input value={username} onChange={e=>setUsername(e.target.value)} className="w-full border rounded px-3 py-2 mb-4" />
          <label className="block mb-2">Contraseña</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded px-3 py-2 mb-4" />
          {error && <p className="text-red-600 mb-2">{error}</p>}
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Entrar</button>
        </form>
      </main>
    </div>
  )
}
