import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import RepuestoCard from '../components/RepuestoCard'
import Spinner from '../components/Spinner'
import { useFavorites } from '../context/FavoritesContext'
import { useAuth } from '../context/AuthContext'
import Link from 'next/link'

export default function FavoritesPage() {
  const { favorites, loading, refetch } = useFavorites()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      refetch()
    }
  }, [user])

  if (!user) {
    return (
      <div>
        <Navbar />
        <main className="container mx-auto py-12 px-4">
          <h1 className="text-3xl font-bold text-gray-100 mb-6">Mis Favoritos</h1>
          <p className="text-gray-400">Debes <Link href="/login" className="text-orange-400 underline">iniciar sesión</Link> para ver tus favoritos.</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <main className="container mx-auto py-12 px-4">
        <div className="flex items-center gap-3 mb-8">
          <Heart size={32} className="text-red-500 fill-red-500" />
          <h1 className="text-3xl font-bold text-gray-100">Mis Favoritos</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size={8} />
          </div>
        ) : favorites.length === 0 ? (
          <p className="text-gray-400">No tienes favoritos aún. ¡Agrega productos desde el catálogo!</p>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap gap-6"
          >
            {favorites.map(fav => (
              <div key={fav.id} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]" style={{ maxWidth: '340px' }}>
                <RepuestoCard item={fav.repuesto_detail} />
              </div>
            ))}
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  )
}
