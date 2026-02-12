import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Hero() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  function handleMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12
    setTilt({ x, y })
  }

  function handleLeave() {
    setTilt({ x: 0, y: 0 })
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0b0b0b] via-[#111] to-[#121212] text-white">
      <div className="absolute inset-0">
        <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.04),transparent,rgba(255,255,255,0.03))]" />
      </div>

      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center py-16 lg:py-24 relative z-10">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-orange-400">Modern Dark Series</p>
          <h2 className="mt-4 text-4xl md:text-5xl font-extrabold leading-tight">
            Repuestos premium con estética <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">industrial clean</span>.
          </h2>
          <p className="mt-4 text-lg text-gray-300 max-w-xl">
            Búsqueda inteligente, stock confiable y fichas técnicas claras para equipar tu auto con precisión.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#repuestos" className="inline-flex items-center justify-center bg-gradient-to-r from-red-600 to-orange-500 px-6 py-3 rounded-md font-semibold shadow-lg shadow-red-500/20 hover:opacity-95">
              Ver repuestos
            </a>
            <a href="#repuestos" className="inline-flex items-center justify-center border border-white/20 px-6 py-3 rounded-md text-gray-200 hover:border-orange-400/60">
              Explorar catálogo
            </a>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <motion.div
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            className="relative w-full max-w-md"
            style={{ perspective: 1000 }}
          >
            <motion.div
              style={{ transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)` }}
              className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl shadow-black/50"
            >
              <div className="absolute -top-10 -right-6 h-20 w-20 rounded-full bg-orange-500/20 blur-2xl" />
              <div className="flex items-center justify-center">
                <svg viewBox="0 0 200 200" className="h-56 w-56">
                  <defs>
                    <radialGradient id="disc" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#2b2b2b" />
                      <stop offset="60%" stopColor="#4b4b4b" />
                      <stop offset="100%" stopColor="#1a1a1a" />
                    </radialGradient>
                  </defs>
                  <circle cx="100" cy="100" r="90" fill="url(#disc)" stroke="#f97316" strokeWidth="4" />
                  <circle cx="100" cy="100" r="48" fill="#111" stroke="#ef4444" strokeWidth="3" />
                  {[...Array(6)].map((_, i) => (
                    <circle key={i} cx={100 + 55 * Math.cos((i * Math.PI) / 3)} cy={100 + 55 * Math.sin((i * Math.PI) / 3)} r="6" fill="#111" stroke="#f97316" strokeWidth="2" />
                  ))}
                </svg>
              </div>
              <div className="mt-6 text-center">
                <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Disco de freno</p>
                <p className="text-lg font-semibold">Carbon Ceramic Series</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
