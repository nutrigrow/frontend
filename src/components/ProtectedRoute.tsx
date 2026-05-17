import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoggedIn, loading } = useAuth()

  if (loading) {
    return null
  }

  if (!isLoggedIn) {
    return <Navigate to="/about-us" replace />
  }

  if (user?.role?.toUpperCase() === 'ADMIN') {
    return <Navigate to="/admin" replace />
  }

  return <>{children}</>
}

export const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoggedIn, loading } = useAuth()

  if (loading) {
    return null
  }

  if (isLoggedIn) {
    if (user?.role?.toUpperCase() === 'ADMIN') {
      return <Navigate to="/admin" replace />
    }
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoggedIn, loading } = useAuth()

  if (loading) {
    return null
  }

  if (!isLoggedIn) {
    return <Navigate to="/sign-in" replace />
  }

  if (user?.role?.toUpperCase() !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
