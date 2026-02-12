import { useState } from 'react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import RequireAuth from '../../components/RequireAuth'
import { useAuth } from '../../context/AuthContext'
import { fetchWithAuth } from '../../lib/auth'

export default function AdminAssistant() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hola, soy el asistente. Escribí "ayuda" para ver comandos.' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSend(e) {
    e.preventDefault()
    if (!input.trim()) return
    const text = input.trim()
    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setLoading(true)
    try {
      const res = await fetchWithAuth('/admin/assistant/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json()
      const reply = data.message || data.detail || 'Respuesta no disponible.'
      setMessages(prev => [...prev, { role: 'assistant', text: reply }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Error al procesar la solicitud.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <RequireAuth>
      <div className="min-h-screen flex flex-col bg-[#121212]">
        <Navbar />
        <main className="container mx-auto px-4 py-12 flex-1">
          <h1 className="text-2xl font-bold mb-6">Asistente IA (Admin)</h1>
          {!user?.is_staff ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 text-gray-400">
              Acceso solo para administradores.
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                {messages.map((m, idx) => (
                  <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`${m.role === 'user' ? 'bg-orange-500 text-black' : 'bg-black/50 text-gray-100'} px-4 py-2 rounded-xl max-w-[75%] text-sm`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSend} className="mt-4 flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-gray-100"
                  placeholder='Ej: "subir stock sku BRK-TCOR18-01 a 5"'
                />
                <button disabled={loading} className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 py-2 rounded-md">
                  {loading ? 'Enviando...' : 'Enviar'}
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
