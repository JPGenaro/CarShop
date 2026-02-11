import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-white shadow">
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-semibold">
          Carshop
        </Link>
        <div>
          <Link href="/login" className="mr-4 text-sm text-gray-600">Login</Link>
          <Link href="/register" className="text-sm text-gray-600">Register</Link>
        </div>
      </div>
    </nav>
  )
}
