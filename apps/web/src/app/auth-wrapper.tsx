'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// AuthContext - defined inline to avoid import issues
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  avatarUrl?: string;
  phoneNumber?: string;
  department?: string;
  joinDate?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Auto-login demo user for development
    const demoUser: User = {
      id: '1',
      email: 'demo@counselflow.com',
      firstName: 'Demo',
      lastName: 'User',
      role: 'admin',
      status: 'active',
    };
    setUser(demoUser);
  }, []);

  const login = async (credentials: any) => {
    setLoading(true);
    const demoUser: User = {
      id: '1',
      email: credentials.email || 'demo@counselflow.com',
      firstName: 'Demo',
      lastName: 'User',
      role: 'admin',
      status: 'active',
    };
    setUser(demoUser);
    setLoading(false);
  };

  const logout = async () => {
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      login,
      logout,
      updateUser,
      error,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
