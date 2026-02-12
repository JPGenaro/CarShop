import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Mail, User } from 'lucide-react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { register } from '../lib/auth'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const router = useRouter()
  const { login } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      await register({ username, email, password })
      // auto-login using auth context
      await login(username, password)
      router.push('/')
    } catch (err) {
      console.error(err)
      setError(err.detail || 'Error registrando usuario')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#121212]">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-14 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl shadow-black/50"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400 text-center">Nueva cuenta</p>
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-100">Crear cuenta</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 flex items-center gap-3">
              <User size={18} className="text-orange-400" />
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="bg-transparent outline-none text-gray-100 placeholder:text-gray-500 w-full"
                placeholder="Usuario"
              />
            </div>
            <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 flex items-center gap-3">
              <Mail size={18} className="text-orange-400" />
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="bg-transparent outline-none text-gray-100 placeholder:text-gray-500 w-full"
                placeholder="Email"
              />
            </div>
            <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 flex items-center gap-3">
              <Lock size={18} className="text-orange-400" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="bg-transparent outline-none text-gray-100 placeholder:text-gray-500 w-full"
                placeholder="Contraseña"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 py-2 rounded-md shadow-lg shadow-red-500/20 hover:opacity-95">
              Registrar
            </button>
          </form>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
