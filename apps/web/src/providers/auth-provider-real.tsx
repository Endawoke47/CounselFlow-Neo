// Authentication Provider - REAL IMPLEMENTATION
// User: Endawoke47
// Date: 2025-07-13 Updated with Real API Integration

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { realApiClient, type User, type AuthCredentials } from '../lib/real-api-client';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('counselflow_token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Verify token with backend
      const response = await realApiClient.verifyToken();
      
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('counselflow_token');
        realApiClient.setToken(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Token verification failed, remove it
      localStorage.removeItem('counselflow_token');
      realApiClient.setToken(null);
      setError('Session expired. Please login again.');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: AuthCredentials, rememberMe?: boolean) => {
    try {
      setLoading(true);
      setError(null);

      const response = await realApiClient.login(credentials);
      
      if (response.success && response.data?.user && response.data?.token) {
        setUser(response.data.user);
        
        // Store token based on rememberMe preference
        if (rememberMe) {
          localStorage.setItem('counselflow_token', response.data.token);
        } else {
          sessionStorage.setItem('counselflow_token', response.data.token);
        }
        
        realApiClient.setToken(response.data.token);
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      setError(error.message || 'Login failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call logout endpoint
      await realApiClient.logout();
      
      // Clear local state
      setUser(null);
      
      // Clear storage
      localStorage.removeItem('counselflow_token');
      sessionStorage.removeItem('counselflow_token');
      
      // Redirect to login
      router.push('/login');
    } catch (error: any) {
      console.error('Logout failed:', error);
      // Even if logout fails, clear local state
      setUser(null);
      localStorage.removeItem('counselflow_token');
      sessionStorage.removeItem('counselflow_token');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
