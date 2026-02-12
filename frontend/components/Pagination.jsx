export default function Pagination({ total = 0, page = 1, onPage }) {
  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  function goto(p) {
    if (p < 1 || p > totalPages) return
    onPage(p)
  }

  const pages = []
  const start = Math.max(1, page - 2)
  const end = Math.min(totalPages, page + 2)
  for (let p = start; p <= end; p++) pages.push(p)

  return (
    <nav className="flex flex-wrap items-center gap-2">
      <button onClick={() => goto(page - 1)} disabled={page === 1} className="px-3 py-1 border border-white/10 rounded-md text-gray-300 disabled:opacity-50">Anterior</button>
      {start > 1 && (
        <button onClick={() => goto(1)} className="px-3 py-1 border border-white/10 rounded-md text-gray-300">1</button>
      )}
      {pages.map(p => (
        <button key={p} onClick={() => goto(p)} className={`px-3 py-1 border border-white/10 rounded-md ${p===page? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-md shadow-red-500/20':'text-gray-300'}`}>
          {p}
        </button>
      ))}
      {end < totalPages && (
        <button onClick={() => goto(totalPages)} className="px-3 py-1 border border-white/10 rounded-md text-gray-300">{totalPages}</button>
      )}
      <button onClick={() => goto(page + 1)} disabled={page === totalPages} className="px-3 py-1 border border-white/10 rounded-md text-gray-300 disabled:opacity-50">Siguiente</button>
    </nav>
  )
}
