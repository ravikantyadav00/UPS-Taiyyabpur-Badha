'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiFetch } from './api';

export interface User {
  id: string;
  email: string | null;
  username: string | null;
  role: string;
  schoolId: string;
  schoolName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await apiFetch('/auth/me');
      setUser(userData);
    } catch (err) {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {}
    }
    refreshUser();
  }, []);

  useEffect(() => {
    if (!loading) {
      const publicRoutes = ['/login'];
      const isPublic = publicRoutes.includes(pathname);

      if (!user && !isPublic) {
        router.push('/login');
      } else if (user) {
        if (pathname === '/login') {
          if (user.role === 'ADMIN') {
            router.push('/dashboard');
          } else if (user.role === 'TEACHER') {
            router.push('/teacher/dashboard');
          }
        } else if (user.role === 'TEACHER' && pathname.startsWith('/dashboard')) {
          router.push('/teacher/dashboard');
        } else if (user.role === 'ADMIN' && pathname.startsWith('/teacher')) {
          router.push('/dashboard');
        }
      }
    }
  }, [user, loading, pathname, router]);

  const login = async (identifier: string, password: string) => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });

    if (res.accessToken) {
      localStorage.setItem('access_token', res.accessToken);
    }
    if (res.user) {
      localStorage.setItem('user', JSON.stringify(res.user));
      setUser(res.user);
    }

    if (res.user?.role === 'ADMIN') {
      window.location.href = '/dashboard';
    } else if (res.user?.role === 'TEACHER') {
      window.location.href = '/teacher/dashboard';
    } else {
      window.location.href = '/dashboard';
    }
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
