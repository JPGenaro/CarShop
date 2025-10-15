import React from 'react';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center text-white text-center bg-cover bg-center" style={{ backgroundImage: 'url(/hero-bg.jpg)' }}>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 p-8">
          <h1 className="text-5xl font-bold">Bienvenido a CarShop</h1>
          <p className="mt-4 text-xl">Encuentra los mejores repuestos para tu vehículo.</p>
          <button className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-semibold transition-colors">
            Explorar Productos
          </button>
        </div>
      </section>

      {/* Product Categories Section */}
      <section className="container mx-auto p-8 my-8">
        <h2 className="text-3xl font-bold text-center mb-8">Categorías Principales</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-100 p-6 rounded-lg text-center">
            <Image src="/motor.png" alt="Motor" width={100} height={100} className="mx-auto mb-4" />
            <h3 className="text-xl font-semibold">Motor</h3>
            <p className="mt-2 text-gray-600">Todo lo necesario para el corazón de tu auto.</p>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg text-center">
            <Image src="/suspension.png" alt="Suspensión" width={100} height={100} className="mx-auto mb-4" />
            <h3 className="text-xl font-semibold">Suspensión</h3>
            <p className="mt-2 text-gray-600">Componentes para un manejo suave y seguro.</p>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg text-center">
            <Image src="/brakes.png" alt="Frenos" width={100} height={100} className="mx-auto mb-4" />
            <h3 className="text-xl font-semibold">Frenos</h3>
            <p className="mt-2 text-gray-600">Sistemas de frenado de alta calidad.</p>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="container mx-auto p-8 my-8 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-8">Productos Destacados</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Placeholder Product Card 1 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4">
              <h3 className="text-lg font-semibold">Bujía de encendido</h3>
              <p className="text-gray-600 mt-1">$15.00</p>
              <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded-full hover:bg-blue-600 transition-colors">
                Agregar al Carrito
              </button>
            </div>
          </div>
          {/* Placeholder Product Card 2 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4">
              <h3 className="text-lg font-semibold">Disco de freno</h3>
              <p className="text-gray-600 mt-1">$80.00</p>
              <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded-full hover:bg-blue-600 transition-colors">
                Agregar al Carrito
              </button>
            </div>
          </div>
          {/* Placeholder Product Card 3 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4">
              <h3 className="text-lg font-semibold">Amortiguador</h3>
              <p className="text-gray-600 mt-1">$120.00</p>
              <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded-full hover:bg-blue-600 transition-colors">
                Agregar al Carrito
              </button>
            </div>
          </div>
          {/* Placeholder Product Card 4 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4">
              <h3 className="text-lg font-semibold">Filtro de aire</h3>
              <p className="text-gray-600 mt-1">$25.00</p>
              <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded-full hover:bg-blue-600 transition-colors">
                Agregar al Carrito
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}