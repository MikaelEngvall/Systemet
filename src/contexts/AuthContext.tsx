import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { getByEmail, update } from '../db/database';
import bcrypt from 'bcryptjs';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthorized: (requiredRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const roleHierarchy: Record<UserRole, number> = {
  superuser: 4,
  admin: 3,
  maintenance: 2,
  viewer: 1,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem('user', JSON.stringify(user));
      } catch (error) {
        console.error('Failed to save user to localStorage:', error);
      }
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      const foundUser = await getByEmail(email);
      
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }

      const isValidPassword = await bcrypt.compare(password, foundUser.password);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      const updatedUser = {
        ...foundUser,
        lastLogin: new Date().toISOString(),
      };

      await update('users', updatedUser);
      
      const { password: _, ...userWithoutPassword } = updatedUser;
      setUser(userWithoutPassword as User);
    } catch (error) {
      console.error('Login error:', error);
      throw error instanceof Error ? error : new Error('Failed to login');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const isAuthorized = (requiredRoles: UserRole[]) => {
    if (!user) return false;
    const userRoleLevel = roleHierarchy[user.role];
    return requiredRoles.some(role => userRoleLevel >= roleHierarchy[role]);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthorized }}>
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