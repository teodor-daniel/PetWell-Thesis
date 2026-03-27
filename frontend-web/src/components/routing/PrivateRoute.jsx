
import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

export default function PrivateRoute({ children, requiredRole }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  if (!allowed.includes(user.role)) {
    if (user.role === 'VET')   return <Navigate to="/vet-dashboard" replace />;
    if (user.role === 'OWNER') return <Navigate to="/dashboard" replace />;
    return <Navigate to="/home" replace />;
  }
  return children;
}
