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
    const storedToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (!storedToken) {
      setLoading(false);
      return;
    }
    setToken(storedToken);
    apiService.getMe(storedToken)
      .then(u => { setUser(u); setLoading(false); })
      .catch(() => {
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
        setToken(null);
        setLoading(false);
      });
  }, []);

  const login = useCallback(async (email: string, password: string, remember?: boolean) => {
    const result = await apiService.login(email, password);
    const t = result.access_token;
    if (remember !== false) {
      localStorage.setItem('auth_token', t);
      sessionStorage.removeItem('auth_token');
    } else {
      sessionStorage.setItem('auth_token', t);
      localStorage.removeItem('auth_token');
    }
    const u = await apiService.getMe(t);
    setUser(u);
    setToken(t);
    return u;
  }, []);

  const register = useCallback(async (email: string, password: string, display_name?: string) => {
    const result = await apiService.register(email.split('@')[0], email, password, display_name);
    return result;
  }, []);

  const verifyEmail = useCallback(async (code: string, email: string) => {
    const result = await apiService.verifyEmail(code, email);
    localStorage.setItem('auth_token', result.access_token);
    const u = await apiService.getMe(result.access_token);
    setUser(u);
    setToken(result.access_token);
    return u;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
    setUser(null);
    setToken(null);
  }, []);

  const updateProfile = useCallback(async (data: { display_name?: string; email?: string }) => {
    if (!token) throw new Error('Not authenticated');
    const u = await apiService.updateProfile(token, data);
    setUser(u);
    return u;
  }, [token]);

  const changePassword = useCallback(async (current_password: string, new_password: string) => {
    if (!token) throw new Error('Not authenticated');
    await apiService.changePassword(token, current_password, new_password);
  }, [token]);

  const googleSignIn = useCallback(async (token: string) => {
    localStorage.setItem('auth_token', token);
    const u = await apiService.getMe(token);
    setUser(u);
    setToken(token);
    return u;
  }, []);

  const deleteAccount = useCallback(async (password: string) => {
    if (!token) throw new Error('Not authenticated');
    await apiService.deleteAccount(token, password);
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
    setUser(null);
    setToken(null);
  }, [token]);

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
