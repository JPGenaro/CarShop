import Link from 'next/link'
import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-black/60 text-gray-300 mt-16 border-t border-white/10">
      <div className="container mx-auto py-12 grid grid-cols-1 md:grid-cols-4 gap-6">
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

        <div>
          <h4 className="text-white font-medium">Redes sociales</h4>
          <div className="mt-3 flex items-center gap-3">
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer" className="p-2 rounded-full border border-white/10 text-gray-300 hover:text-orange-400 hover:border-orange-400/50">
              <Instagram size={18} />
            </a>
            <a href="https://www.facebook.com" target="_blank" rel="noreferrer" className="p-2 rounded-full border border-white/10 text-gray-300 hover:text-orange-400 hover:border-orange-400/50">
              <Facebook size={18} />
            </a>
            <a href="https://www.youtube.com" target="_blank" rel="noreferrer" className="p-2 rounded-full border border-white/10 text-gray-300 hover:text-orange-400 hover:border-orange-400/50">
              <Youtube size={18} />
            </a>
            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="p-2 rounded-full border border-white/10 text-gray-300 hover:text-orange-400 hover:border-orange-400/50">
              <Linkedin size={18} />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-sm text-gray-500">© {new Date().getFullYear()} Carshop - Demo</div>
    </footer>
  )
}
