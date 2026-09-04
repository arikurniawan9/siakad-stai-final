import React from 'react';
import { UserRole } from '../../types/roles';
import { Permission } from '../../types/auth';
import { useAuth } from '../../context/AuthContext';
import { AksesDitolakPage } from '../../pages/AksesDitolakPage';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export interface AuthGuardProps {
  roles?: UserRole | UserRole[];
  permissions?: Permission | Permission[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
  onNavigateHome?: () => void;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  roles,
  permissions,
  fallback,
  children,
  onNavigateHome
}) => {
  const { user, isAuthenticated, isLoading, hasRole, hasPermission } = useAuth();

  if (isLoading) {
    return <LoadingSpinner text="Memeriksa otorisasi keamanan..." />;
  }

  if (!isAuthenticated || !user) {
    return <AksesDitolakPage onNavigateHome={onNavigateHome} />;
  }

  if (roles && !hasRole(roles)) {
    return fallback ? <>{fallback}</> : <AksesDitolakPage onNavigateHome={onNavigateHome} />;
  }

  if (permissions && !hasPermission(permissions)) {
    const permString = Array.isArray(permissions) ? permissions.join(', ') : permissions;
    return fallback ? (
      <>{fallback}</>
    ) : (
      <AksesDitolakPage requiredPermission={permString} onNavigateHome={onNavigateHome} />
    );
  }

  return <>{children}</>;
};
