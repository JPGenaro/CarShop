import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)

function readCart() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem('carshop_cart')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeCart(items) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem('carshop_cart', JSON.stringify(items))
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    setItems(readCart())
  }, [])

  useEffect(() => {
    writeCart(items)
  }, [items])

  function addItem(product, qty = 1) {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        return prev.map(i => (i.id === product.id ? { ...i, qty: i.qty + qty } : i))
      }
      return [...prev, { ...product, qty }]
    })
  }

  function removeItem(id) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function updateQty(id, qty) {
    if (qty <= 0) return removeItem(id)
    setItems(prev => prev.map(i => (i.id === id ? { ...i, qty } : i)))
  }

  function clear() {
    setItems([])
  }

  const summary = useMemo(() => {
    const subtotal = items.reduce((acc, i) => acc + Number(i.price || 0) * i.qty, 0)
    const tax = subtotal * 0.0
    const total = subtotal + tax
    return { subtotal, tax, total }
  }, [items])

  const value = { items, addItem, removeItem, updateQty, clear, summary }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
