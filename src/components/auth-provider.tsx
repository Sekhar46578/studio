"use client";

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import type { User } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('shopstock-session');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user session from localStorage", error);
      localStorage.removeItem('shopstock-session');
    }
    setLoading(false);
  }, []);

  const getUsers = (): User[] => {
    try {
      const users = localStorage.getItem('shopstock-users');
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error("Failed to parse users from localStorage", error);
      return [];
    }
  };

  const saveUsers = (users: User[]) => {
    localStorage.setItem('shopstock-users', JSON.stringify(users));
  };
  
  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    const users = getUsers();
    if (users.find(u => u.email === email)) {
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: "An account with this email already exists.",
      });
      return false;
    }

    const newUser: User = { name, email, password, picture: '' };
    saveUsers([...users, newUser]);
    
    localStorage.setItem('shopstock-session', JSON.stringify(newUser));
    setUser(newUser);
    return true;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = getUsers();
    const foundUser = users.find(u => u.email === email && u.password === password);

    if (foundUser) {
      localStorage.setItem('shopstock-session', JSON.stringify(foundUser));
      setUser(foundUser);
      return true;
    }
    
    toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid email or password.",
    });
    return false;
  };

  const logout = () => {
    localStorage.removeItem('shopstock-session');
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
     if (!user) return;

    // Also update the list of all users
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === user.email);
    if(userIndex > -1) {
        const updatedUsers = [...users];
        updatedUsers[userIndex] = { ...updatedUsers[userIndex], ...updatedUser};
        saveUsers(updatedUsers);
    }
    
    localStorage.setItem('shopstock-session', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }

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
    <AuthContext.Provider value={{ user, loading, login, logout, signup, updateUser }}>
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
