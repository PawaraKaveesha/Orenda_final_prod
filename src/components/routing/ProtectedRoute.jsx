import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Loading from '../ui/Loading'

// Blocks admin routes until the session is verified; redirects guests to login.
export default function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loading label="Checking session…" />
      </div>
    )
  }

  if (!admin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return children
}
