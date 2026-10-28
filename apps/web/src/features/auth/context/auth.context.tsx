'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

import { queryClient } from '@/lib';
import { setAccessToken, subscribeAccessToken } from '@/services';
import { userService } from '@/features/users';
import { crossTabSync, deletedEntities } from '@/shared/utils';

import { authService } from '../service';
import { AuthUser } from '../types';

const SESSION_COOKIE_NAME = 'sprinthub_session';

function hasClientSessionCookie(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }
  return document.cookie
    .split(';')
    .some((item) => item.trim().startsWith(`${SESSION_COOKIE_NAME}=`));
}

function setClientSessionCookie(): void {
  if (typeof document !== 'undefined') {
    document.cookie = `${SESSION_COOKIE_NAME}=active; path=/; max-age=604800; SameSite=Lax`;
  }
}

function clearClientSessionCookie(): void {
  if (typeof document !== 'undefined') {
    document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  }
}

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
    deletedEntities.clear();
    setClientSessionCookie();
    setAccessToken(token);
    setAccessTokenState(token);
    setUser(authUser);
  }, []);

  const clearAuth = useCallback(() => {
    deletedEntities.clear();
    clearClientSessionCookie();
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
      }
    });
  }, [clearAuth]);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      // If no session indicator exists, skip refresh call to avoid unneeded 401 network error for guests
      if (!hasClientSessionCookie()) {
        if (isMounted) {
          setIsInitializing(false);
        }
        return;
      }

      try {
        const { accessToken } = await authService.refresh();
        setAccessToken(accessToken);

        const currentUser = await userService.getCurrentUser();

        if (isMounted) {
          setAccessTokenState(accessToken);
          setUser(currentUser);
        }
      } catch {
        clearClientSessionCookie();
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

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
