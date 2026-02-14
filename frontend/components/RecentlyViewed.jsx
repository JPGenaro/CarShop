import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Eye } from 'lucide-react'
import Link from 'next/link'

export default function RecentlyViewed() {
  const [recentProducts, setRecentProducts] = useState([])

  useEffect(() => {
    try {
      const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
      setRecentProducts(recent)
    } catch (err) {
      console.error('Error loading recently viewed:', err)
    }
  }, [])

  if (recentProducts.length === 0) return null

  return (
    <section className="container mx-auto py-12 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="text-orange-400" size={22} />
        <h2 className="text-2xl font-bold">Vistos Recientemente</h2>
      </div>

      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-orange-500 scrollbar-track-gray-800">
          {recentProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/repuestos/${product.id}`}>
                <div className="group cursor-pointer min-w-[200px] max-w-[200px] bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/20">
                  <div className="relative h-40 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <Eye className="text-gray-600" size={40} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-gray-100 line-clamp-2 mb-1 group-hover:text-orange-400 transition-colors">
                      {product.name}
                    </h3>
                    
                    {(product.brand || product.model) && (
                      <p className="text-xs text-gray-500 mb-2">
                        {product.brand} {product.model}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-orange-400">
                        ${product.price?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
