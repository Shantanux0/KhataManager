import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('khata_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) {
        throw new Error('Invalid email or password');
      }
      const data = await response.json();
      const mockUser = {
        ...data.user,
        token: data.token
      };
      localStorage.setItem('khata_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return mockUser;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, shopName, email, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, shopName, email, password })
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Registration failed');
      }
      const data = await response.json();
      const mockUser = {
        ...data.user,
        token: data.token
      };
      localStorage.setItem('khata_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return mockUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('khata_user');
    setUser(null);
  };

  const updateProfile = async (updatedFields) => {
    if (!user || !user.token) return;
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify(updatedFields)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to update profile');
    }
    const updatedUserDto = await response.json();
    const newUserState = {
      ...user,
      ...updatedUserDto
    };
    localStorage.setItem('khata_user', JSON.stringify(newUserState));
    setUser(newUserState);
    return newUserState;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {!loading && children}
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
