import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AdminLoginPage } from '../features/admin/AdminLoginPage';

export const AdminProtectedRoute: React.FC = () => {
  const { user } = useAuth();

  if (!user || user.role !== 'ADMIN') {
    return <AdminLoginPage />;
  }

  return <Outlet />;
};
