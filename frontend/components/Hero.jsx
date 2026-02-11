import React from 'react'

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold">Encuentra repuestos confiables para tu auto</h2>
        <p className="mt-3 text-lg max-w-2xl mx-auto">Búsqueda rápida, envíos seguros y stock verificado. Explora nuestra selección y encuentra lo que necesitas.</p>
        <div className="mt-6">
          <a href="#repuestos" className="inline-block bg-white text-blue-700 px-6 py-3 rounded-md font-semibold shadow-md hover:opacity-95">Ver repuestos</a>
        </div>
      </div>
    </section>
  )
}
