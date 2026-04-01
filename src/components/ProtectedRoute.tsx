import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redireciona não autenticados enviando a tela tentada acessada na "mochila" de redicirecionamento para quando acabar o login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
