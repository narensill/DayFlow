import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageSpinner } from './States';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <PageSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}
