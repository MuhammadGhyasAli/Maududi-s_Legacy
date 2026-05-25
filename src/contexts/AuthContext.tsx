'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiService } from '../services/apiService';

interface User {
  id: number;
  username: string;
  email: string;
  display_name: string;
  is_active: boolean;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<User>;
  register: (username: string, email: string, password: string, display_name?: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (!storedToken) {
      setLoading(false);
      return;
    }
    setToken(storedToken);
    apiService.getMe(storedToken)
      .then(u => { setUser(u); setLoading(false); })
      .catch(() => {
        localStorage.removeItem('auth_token');
        setToken(null);
        setLoading(false);
      });
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const result = await apiService.login(username, password);
    localStorage.setItem('auth_token', result.access_token);
    const u = await apiService.getMe(result.access_token);
    setUser(u);
    setToken(result.access_token);
    return u;
  }, []);

  const register = useCallback(async (username: string, email: string, password: string, display_name?: string) => {
    await apiService.register(username, email, password, display_name);
    return login(username, password);
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
