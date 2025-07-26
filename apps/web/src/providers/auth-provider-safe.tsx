'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
}

interface AuthCredentials {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: AuthCredentials, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false); // Changed to false to prevent SSR issues
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Only run on client-side after mount
  useEffect(() => {
    setMounted(true);
    // Auto-login demo user for development
    if (typeof window !== 'undefined') {
      const demoUser: User = {
        id: '1',
        email: 'demo@counselflow.com',
        firstName: 'Demo',
        lastName: 'User',
        role: 'admin',
        status: 'active',
      };
      setUser(demoUser);
    }
  }, []);

  const login = async (credentials: AuthCredentials, rememberMe?: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock authentication - always succeed for demo
      const demoUser: User = {
        id: '1',
        email: credentials.email,
        firstName: 'Demo',
        lastName: 'User',
        role: 'admin',
        status: 'active',
      };
      
      setUser(demoUser);
      if (typeof window !== 'undefined' && rememberMe) {
        localStorage.setItem('counselflow_user', JSON.stringify(demoUser));
      }
      
      router.push('/dashboard');
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('counselflow_user');
      }
      router.push('/login');
    } catch (err) {
      setError('Logout failed. Please try again.');
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('counselflow_user', JSON.stringify(updatedUser));
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
