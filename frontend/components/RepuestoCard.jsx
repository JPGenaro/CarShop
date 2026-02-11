import Link from 'next/link'

function truncate(text, n = 120) {
  if (!text) return ''
  return text.length > n ? text.slice(0, n) + '...' : text
}

export default function RepuestoCard({ item }) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow hover:shadow-lg transform hover:-translate-y-1 transition-all duration-150 flex flex-col">
      {item.image && (
        <div className="h-44 w-full mb-3 overflow-hidden rounded-md bg-gray-100 flex items-center justify-center">
          <img src={item.image} alt={item.name} className="object-cover h-full w-full" />
        </div>
      )}
      <h3 className="text-lg font-semibold">{item.name}</h3>
      <p className="text-sm text-gray-600">SKU: {item.sku || '—'}</p>
      <p className="mt-2 text-indigo-600 font-bold text-lg">${item.price}</p>
      <p className="text-sm text-gray-500 mt-2">{truncate(item.description)}</p>
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-700">{item.stock > 0 ? `Stock: ${item.stock}` : <span className="text-red-600">Agotado</span>}</div>
        <Link href={`/repuestos/${item.id}`} className="text-sm text-white bg-blue-600 px-3 py-1 rounded-md">Ver</Link>
      </div>
    </div>
  )
}
