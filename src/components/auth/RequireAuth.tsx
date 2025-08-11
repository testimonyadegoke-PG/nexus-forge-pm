
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/hooks/useUsers';

interface RequireAuthProps {
  children: React.ReactNode;
  roles?: string[];
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { data: userProfile, isLoading: profileLoading } = useUser(user?.id || '');

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if roles are specified
  if (roles && userProfile) {
    const userRole = userProfile.role;
    if (!roles.includes(userRole)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
            <p className="text-sm text-gray-500 mt-2">Required roles: {roles.join(', ')}</p>
            <p className="text-sm text-gray-500">Your role: {userRole}</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};
