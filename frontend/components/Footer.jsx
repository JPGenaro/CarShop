import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-black/60 text-gray-300 mt-16 border-t border-white/10">
      <div className="container mx-auto py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h3 className="text-white text-lg font-semibold">Carshop</h3>
          <p className="text-sm mt-2 text-gray-400">Tienda de repuestos - Proyecto demo</p>
        </div>

        <div>
          <h4 className="text-white font-medium">Enlaces</h4>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link href="/" className="hover:underline">Inicio</Link></li>
            <li><Link href="/login" className="hover:underline">Login</Link></li>
            <li><Link href="/register" className="hover:underline">Registrar</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-medium">Contacto</h4>
          <p className="text-sm mt-2 text-gray-400">soporte@carshop.local</p>
          <p className="text-sm text-gray-400">(+54) 9 11 1234-5678</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-sm text-gray-500">© {new Date().getFullYear()} Carshop - Demo</div>
    </footer>
  )
}
