import { useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import { register, login } from '../lib/auth'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      await register({ username, email, password })
      // auto-login
      await login(username, password)
      router.push('/')
    } catch (err) {
      setError(err.detail || 'Error registrando usuario')
    }
  }

  return (
    <div>
      <Navbar />
      <main className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Register</h1>
        <form onSubmit={handleSubmit} className="max-w-md">
          <label className="block mb-2">Usuario</label>
          <input value={username} onChange={e=>setUsername(e.target.value)} className="w-full border rounded px-3 py-2 mb-4" />
          <label className="block mb-2">Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded px-3 py-2 mb-4" />
          <label className="block mb-2">Contraseña</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded px-3 py-2 mb-4" />
          {error && <p className="text-red-600 mb-2">{error}</p>}
          <button className="bg-green-600 text-white px-4 py-2 rounded">Registrar</button>
        </form>
      </main>
    </div>
  )
}
