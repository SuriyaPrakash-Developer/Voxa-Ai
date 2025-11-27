import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, User } from '../types';

const AuthContext = createContext<AuthState | null>(null);

const LOCAL_STORAGE_KEY = 'gemini-voice-auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const savedAuth = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedAuth) {
      try {
        const { user } = JSON.parse(savedAuth);
        setUser(user);
        setIsAuthenticated(true);
      } catch (e) {
        // malformed data; clear it
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
    // mark that we've checked localStorage (so consumers can wait)
    setIsAuthReady(true);
  }, []);

  const login = async (email: string, password: string) => {
    // Validate against backend
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(async () => ({ message: await res.text() }));
      throw new Error(errBody?.message || 'Login failed');
    }
    const userFromServer: User = await res.json();
    setUser(userFromServer);
    setIsAuthenticated(true);
    setIsAuthReady(true);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ user: userFromServer }));
  };

  const signup = async (userData: { name: string; email: string; mobile: string; password: string }) => {
    // Assume backend call handled by page; just persist user locally
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      mobile: userData.mobile,
    };
    setUser(newUser);
    setIsAuthenticated(true);
    setIsAuthReady(true);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ user: newUser }));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isAuthReady, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};