'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

import { queryClient } from '@/lib';
import { setAccessToken, subscribeAccessToken } from '@/services';
import { userService } from '@/features/users';

import { authService } from '../service';
import { AuthUser } from '../types';

interface AuthContextValue {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setAuth: (accessToken: string, user: AuthUser) => void;
  clearAuth: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [accessTokenState, setAccessTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  const setAuth = useCallback((token: string, authUser: AuthUser) => {
    setAccessToken(token);
    setAccessTokenState(token);
    setUser(authUser);
  }, []);

  const clearAuth = useCallback(() => {
    setAccessToken(null);
    setAccessTokenState(null);
    setUser(null);
    queryClient.clear();
  }, []);

  useEffect(() => {
    return subscribeAccessToken((token) => {
      setAccessTokenState(token);
      if (token === null) {
        setUser(null);
        queryClient.clear();
      }
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { accessToken } = await authService.refresh();
        setAccessToken(accessToken);

        const currentUser = await userService.getCurrentUser();

        if (isMounted) {
          setAccessTokenState(accessToken);
          setUser(currentUser);
        }
      } catch {
        if (isMounted) {
          setAccessToken(null);
          setAccessTokenState(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      clearAuth();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken: accessTokenState,
        user,
        isAuthenticated: Boolean(accessTokenState && user),
        isInitializing,
        setAuth,
        clearAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
