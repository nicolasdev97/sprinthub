'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

import { queryClient } from '@/lib';
import { setAccessToken, subscribeAccessToken } from '@/services';
import { userService } from '@/features/users';
import { crossTabSync } from '@/shared/utils';

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
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem('sprinthub:active-workspace-id');
      } catch {
        // Ignore storage errors in restricted environments
      }
    }
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

  // Listen to cross-tab broadcast events for instant multi-tab sync
  useEffect(() => {
    return crossTabSync.subscribe((event) => {
      if (event.type === 'AUTH_LOGOUT') {
        clearAuth();
        if (
          typeof window !== 'undefined' &&
          !window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/register') &&
          window.location.pathname !== '/'
        ) {
          window.location.href = '/login';
        }
      } else if (event.type === 'AUTH_USER_UPDATED') {
        setUser(event.user);
        queryClient.invalidateQueries({ queryKey: ['user'] });
      } else if (event.type === 'QUERY_INVALIDATE') {
        event.queryKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
    });
  }, [clearAuth]);

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
      crossTabSync.postMessage({ type: 'AUTH_LOGOUT' });
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
