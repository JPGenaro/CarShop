import React from 'react';
import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-gray-600 pb-8 mb-8">
          <div>
            <h4 className="text-lg font-semibold mb-4">CarShop</h4>
            <p className="text-sm text-gray-400">Tu tienda de repuestos de autos de confianza.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li><Link href="/products" className="text-gray-400 hover:text-white">Productos</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white">Sobre Nosotros</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white">Contacto</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Síguenos</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white"><FaFacebook size={24} /></a>
              <a href="#" className="text-gray-400 hover:text-white"><FaTwitter size={24} /></a>
              <a href="#" className="text-gray-400 hover:text-white"><FaInstagram size={24} /></a>
            </div>
          </div>
        </div>
        <div className="text-center text-sm text-gray-400">
          © {new Date().getFullYear()} CarShop. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;