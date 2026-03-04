import '../styles/globals.css'
import { AuthProvider } from '../context/AuthContext'
import { CartProvider } from '../context/CartContext'
import { FavoritesProvider } from '../context/FavoritesContext'
import { CompareProvider } from '../context/CompareContext'
import { ToastProvider } from '../context/ToastContext'
import ToastContainer from '../components/Toast'
import LoadingScreen from '../components/LoadingScreen'
import { useToast } from '../context/ToastContext'
import { useState, useEffect } from 'react'
import Router from 'next/router'

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
  const [pendingRequests, setPendingRequests] = useState(0)
  const [routeLoading, setRouteLoading] = useState(false)
  const [showLoader, setShowLoader] = useState(false)

  const isLoading = routeLoading || pendingRequests > 0

  useEffect(() => {
    if (!isLoading) {
      setShowLoader(false)
      return
    }
    const timer = setTimeout(() => setShowLoader(true), 250)
    return () => clearTimeout(timer)
  }, [isLoading])

  useEffect(() => {
    const handleStart = () => setRouteLoading(true)
    const handleEnd = () => setRouteLoading(false)

    Router.events.on('routeChangeStart', handleStart)
    Router.events.on('routeChangeComplete', handleEnd)
    Router.events.on('routeChangeError', handleEnd)

    return () => {
      Router.events.off('routeChangeStart', handleStart)
      Router.events.off('routeChangeComplete', handleEnd)
      Router.events.off('routeChangeError', handleEnd)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.fetch) return undefined

    const originalFetch = window.fetch.bind(window)

    window.fetch = async (...args) => {
      setPendingRequests((count) => count + 1)
      try {
        return await originalFetch(...args)
      } finally {
        setPendingRequests((count) => Math.max(0, count - 1))
      }
    }

    return () => {
      window.fetch = originalFetch
    }
  }, [])

  return (
    <ToastProvider>
      <LoadingScreen
        show={showLoader}
        message={routeLoading ? 'Cambiando de página...' : 'Cargando datos...'}
      />
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
