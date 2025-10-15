import Link from 'next/link';
import { ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 text-white p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          CarShop
        </Link>
        <div className="flex space-x-4 items-center">
          <Link href="/products" className="hover:text-gray-300">
            Productos
          </Link>
          <Link href="/contact" className="hover:text-gray-300">
            Contacto
          </Link>
          <Link href="/cart">
            <ShoppingCartIcon className="h-6 w-6" />
          </Link>
          <Link href="/login">
            <UserIcon className="h-6 w-6" />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;