import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import Spinner from './Spinner'

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [loading, user, router])

  if (loading) return <div className="flex items-center justify-center py-12"><Spinner size={6} /></div>
  if (!user) return null
  return children
}
