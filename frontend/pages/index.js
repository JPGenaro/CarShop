import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import RepuestoCard from '../components/RepuestoCard'

export default function Home() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/repuestos/')
      .then(res => res.json())
      .then(data => {
        setItems(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <Navbar />
      <main className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Repuestos</h1>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map(item => (
              <RepuestoCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
