import Link from 'next/link'

export default function RepuestoCard({ item }) {
  return (
    <div className="border rounded-md p-4 bg-white shadow-sm">
      <h3 className="text-lg font-medium">{item.name}</h3>
      <p className="text-sm text-gray-600">SKU: {item.sku || '—'}</p>
      <p className="mt-2 text-indigo-600 font-semibold">${item.price}</p>
      <p className="text-sm text-gray-500">Stock: {item.stock}</p>
      <div className="mt-3">
        <Link href={`/repuestos/${item.id}`} className="text-sm text-blue-600">Ver detalle</Link>
      </div>
    </div>
  )
}
