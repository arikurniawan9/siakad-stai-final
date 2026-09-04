import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserAuthProfile, UserSession, Permission } from '../types/auth';
import { UserRole } from '../types/roles';
import { authService } from '../services/authService';

interface AuthContextType {
  user: UserAuthProfile | null;
  session: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSessionExpired: boolean;
  login: (identifier: string, kataSandi: string) => Promise<void>;
  loginWithSso: (code: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: Permission | Permission[]) => boolean;
  dismissSessionExpired: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAuthProfile | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSessionExpired, setIsSessionExpired] = useState<boolean>(false);

  // Inisialisasi sesi dari storage saat pertama kali dimuat
  useEffect(() => {
    const stored = authService.getStoredSession();
    if (stored) {
      setUser(stored.user);
      setSession(stored.session);
    } else {
      setUser(null);
      setSession(null);
    }
    setIsLoading(false);
  }, []);

  // Timer pengecekan session expiration
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      if (Date.now() > session.expiresAt) {
        setIsSessionExpired(true);
      }
    }, 15000); // Cek tiap 15 detik

    return () => clearInterval(interval);
  }, [session]);

  const login = async (identifier: string, kataSandi: string) => {
    setIsLoading(true);
    try {
      const result = await authService.login(identifier, kataSandi);
      setUser(result.user);
      setSession(result.session);
      setIsSessionExpired(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithSso = async (code: string) => {
    setIsLoading(true);
    try {
      const result = await authService.loginWithSiakadSso(code);
      setUser(result.user);
      setSession(result.session);
      setIsSessionExpired(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout(user);
    setUser(null);
    setSession(null);
    setIsSessionExpired(false);
  };

  const switchRole = (role: UserRole) => {
    const result = authService.switchRoleDemo(role);
    setUser(result.user);
    setSession(result.session);
    setIsSessionExpired(false);
  };

  const hasRole = useCallback((roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roleList = Array.isArray(roles) ? roles : [roles];
    return roleList.includes(user.role);
  }, [user]);

  const hasPermission = useCallback((permission: Permission | Permission[]): boolean => {
    if (!user) return false;
    const permList = Array.isArray(permission) ? permission : [permission];
    return permList.every((p) => user.permissions.includes(p));
  }, [user]);

  const dismissSessionExpired = () => {
    setIsSessionExpired(false);
    logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user && !!session,
        isLoading,
        isSessionExpired,
        login,
        loginWithSso,
        logout,
        switchRole,
        hasRole,
        hasPermission,
        dismissSessionExpired,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};
