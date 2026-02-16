import { createContext, useContext, useState, useEffect } from 'react'

const CompareContext = createContext()

export function useCompare() {
  return useContext(CompareContext)
}

export function CompareProvider({ children }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    const stored = localStorage.getItem('compareItems')
    if (stored) {
      try {
        setItems(JSON.parse(stored))
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('compareItems', JSON.stringify(items))
  }, [items])

  function addItem(item) {
    if (items.length >= 4) {
      return false
    }
    if (items.find(i => i.id === item.id)) {
      return false
    }
    setItems([...items, item])
    return true
  }

  function removeItem(id) {
    setItems(items.filter(i => i.id !== id))
  }

  function clear() {
    setItems([])
  }

  const value = {
    items,
    addItem,
    removeItem,
    clear,
    count: items.length,
  }

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
}
