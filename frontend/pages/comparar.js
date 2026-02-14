import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCompare } from '../context/CompareContext'
import Link from 'next/link'

export default function ComparePage() {
  const { items, removeItem, clear } = useCompare()

  const specs = [
    { label: 'Nombre', key: 'name' },
    { label: 'SKU', key: 'sku' },
    { label: 'Marca', key: 'brand' },
    { label: 'Modelo', key: 'model' },
    { label: 'Año', key: 'year' },
    { label: 'Precio', key: 'price' },
    { label: 'Categoría', key: 'category_name' },
  ]

  return (
    <div>
      <Navbar />
      <main className="container mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-100">Comparar Productos</h1>
          {items.length > 0 && (
            <button
              onClick={clear}
              className="px-4 py-2 rounded-md border border-white/20 text-gray-200 hover:border-red-400/60 hover:text-red-400"
            >
              Limpiar todo
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 text-gray-400">
            No hay productos para comparar. Agrega productos desde el catálogo usando el botón "+".
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="overflow-x-auto"
          >
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-4 border border-white/10 bg-white/5 text-left text-gray-300">Especificación</th>
                  {items.map(item => (
                    <th key={item.id} className="p-4 border border-white/10 bg-white/5 text-center relative">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-red-500/20 hover:bg-red-500/40"
                      >
                        <X size={16} className="text-red-400" />
                      </button>
                      {item.image && (
                        <img src={item.image} alt={item.name} className="h-32 w-full object-cover rounded-xl mb-3" />
                      )}
                      <Link href={`/repuestos/${item.id}`} className="text-gray-100 hover:text-orange-400">
                        {item.name}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {specs.map(spec => (
                  <tr key={spec.key}>
                    <td className="p-4 border border-white/10 bg-white/5 font-semibold text-gray-300">{spec.label}</td>
                    {items.map(item => (
                      <td key={item.id} className="p-4 border border-white/10 text-center text-gray-200">
                        {spec.key === 'price' && '$'}
                        {item[spec.key] || '—'}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="p-4 border border-white/10 bg-white/5 font-semibold text-gray-300">Descripción</td>
                  {items.map(item => (
                    <td key={item.id} className="p-4 border border-white/10 text-sm text-gray-300">
                      {item.description?.substring(0, 100) || '—'}
                      {item.description?.length > 100 && '...'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  )
}
