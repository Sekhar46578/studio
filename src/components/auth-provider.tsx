"use client";

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import type { User } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => void;
  logout: () => void;
  signup: (name: string, email: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for a session
    try {
      const storedUser = localStorage.getItem('shopstock-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('shopstock-user');
    }
    setLoading(false);
  }, []);

  const login = (email: string) => {
    // This is a mock login. In a real app, you'd find the user.
    // For now, we'll just create a user with the provided email.
    const mockUser: User = { name: 'Shop Owner', email };
    localStorage.setItem('shopstock-user', JSON.stringify(mockUser));
    setUser(mockUser);
  };
  
  const signup = (name: string, email: string) => {
    const newUser: User = { name, email };
    localStorage.setItem('shopstock-user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('shopstock-user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="space-y-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-8 w-[200px]" />
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
