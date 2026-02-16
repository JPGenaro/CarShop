import '../styles/globals.css'
import { AuthProvider } from '../context/AuthContext'
import { CartProvider } from '../context/CartContext'
import { FavoritesProvider } from '../context/FavoritesContext'
import { CompareProvider } from '../context/CompareContext'
import { ToastProvider } from '../context/ToastContext'
import ToastContainer from '../components/Toast'
import { useToast } from '../context/ToastContext'
import { useState, useEffect } from 'react'

function AppContent({ Component, pageProps }) {
  const { toasts, removeToast } = useToast()

  return (
    <>
      <Component {...pageProps} />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}

export default function MyApp({ Component, pageProps }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <CompareProvider>
              <AppContent Component={Component} pageProps={pageProps} />
            </CompareProvider>
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
