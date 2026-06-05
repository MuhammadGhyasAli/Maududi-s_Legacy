'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiService } from '../services/apiService';

export interface User {
  id: number;
  email: string;
  display_name: string;
  is_active: boolean;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<User>;
  register: (email: string, password: string, display_name?: string) => Promise<{ id: number; email: string }>;
  verifyEmail: (code: string, email: string) => Promise<User>;
  logout: () => void;
  updateProfile: (data: { display_name?: string; email?: string }) => Promise<User>;
  changePassword: (current_password: string, new_password: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  googleSignIn: (token: string) => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getMe()
      .then(u => {
        setUser(u);
        setToken('authenticated');
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const login = useCallback(async (email: string, password: string, _remember?: boolean) => {
    const result = await apiService.login(email, password);
    setToken('authenticated');
    const u = await apiService.getMe();
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (email: string, password: string, display_name?: string) => {
    const result = await apiService.register(email.split('@')[0], email, password, display_name);
    return result;
  }, []);

  const verifyEmail = useCallback(async (code: string, email: string) => {
    const result = await apiService.verifyEmail(code, email);
    setToken('authenticated');
    const u = await apiService.getMe();
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    apiService.logout();
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
    setUser(null);
    setToken(null);
  }, []);

  const updateProfile = useCallback(async (data: { display_name?: string; email?: string }) => {
    const u = await apiService.updateProfile(data);
    setUser(u);
    return u;
  }, []);

  const changePassword = useCallback(async (current_password: string, new_password: string) => {
    await apiService.changePassword(current_password, new_password);
  }, []);

  const googleSignIn = useCallback(async (_token: string) => {
    setToken('authenticated');
    const u = await apiService.getMe();
    setUser(u);
    return u;
  }, []);

  const deleteAccount = useCallback(async (password: string) => {
    await apiService.deleteAccount(password);
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, verifyEmail, logout, updateProfile, changePassword, deleteAccount, googleSignIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
