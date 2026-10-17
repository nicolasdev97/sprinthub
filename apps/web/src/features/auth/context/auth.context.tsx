'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { setAccessToken, subscribeAccessToken } from '@/services';

import { authService } from '../service';
import { AuthUser } from '../types';

interface AuthContextValue {
  accessToken: string | null;
  user: AuthUser | null;
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

  useEffect(() => {
    return subscribeAccessToken((token) => {
      setAccessTokenState(token);
      if (token === null) {
        setUser(null);
      }
    });
  }, []);

  const setAuth = (token: string, authUser: AuthUser) => {
    setAccessToken(token);
    setAccessTokenState(token);
    setUser(authUser);
  };

  const clearAuth = () => {
    setAccessToken(null);
    setAccessTokenState(null);
    setUser(null);
  };

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
