import '../styles/globals.css'
import { AuthProvider } from '../context/AuthContext'
import { CartProvider } from '../context/CartContext'
import { FavoritesProvider } from '../context/FavoritesContext'
import { CompareProvider } from '../context/CompareContext'

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <CompareProvider>
            <Component {...pageProps} />
          </CompareProvider>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  )
}
