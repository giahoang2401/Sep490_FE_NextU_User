// src/context/auth-context.tsx
"use client"

import api from '@/utils/axiosConfig';
import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useClientOnly } from '@/hooks/use-hydration';

type User = {
  name: string
  email: string
  accessToken: string
  
}

type AuthContextType = {
  user: User | null
  isLoggedIn: boolean
  isAuthLoading: boolean
  login: (userData: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const isClient = useClientOnly()

  useEffect(() => {
    if (isClient) {
      // Lấy user từ localStorage khi load lại trang
      const storedUser = localStorage.getItem("nextU_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    }
    setIsAuthLoading(false);
  }, [isClient]);

  const login = (userData: User) => {
    setUser(userData)
    setIsLoggedIn(true)
    if (typeof window !== 'undefined') {
      localStorage.setItem("nextU_user", JSON.stringify(userData))
    }
  }

  const logout = async () => {
    try {
      await api.post('/api/auth/logout')
      setUser(null)
      setIsLoggedIn(false)
      if (typeof window !== 'undefined') {
        localStorage.removeItem("nextU_user")
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
      }
    } catch (error) {
      console.error("Logout API failed:", error)
      setUser(null)
      setIsLoggedIn(false)
      if (typeof window !== 'undefined') {
        localStorage.removeItem("nextU_user")
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isAuthLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
