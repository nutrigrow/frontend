import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, loading } = useAuth()

  if (loading) {
    return null
  }

  if (!isLoggedIn) {
    return <Navigate to="/about-us" replace />
  }

  return <>{children}</>
}

export const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, loading } = useAuth()

  if (loading) {
    return null
  }

  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}