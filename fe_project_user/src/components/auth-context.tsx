// src/context/auth-context.tsx
"use client"

import axios from "axios"
import { createContext, useContext, useEffect, useState, ReactNode } from "react"

type User = {
  name: string
  email: string
  accessToken: string
  
}

type AuthContextType = {
  user: User | null
  isLoggedIn: boolean
  login: (userData: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem("nextU_user")
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser)
        setUser(parsed)
        setIsLoggedIn(true)
      } catch {
        localStorage.removeItem("nextU_user")
      }
    }
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    setIsLoggedIn(true)
    localStorage.setItem("nextU_user", JSON.stringify(userData))
  }

const logout = async () => {
  try {
    // Gọi API logout để huỷ session / revoke token phía backend
    await axios.post("http://localhost:5000/api/bff/auth/logout")

    // Xoá dữ liệu user phía frontend
    setUser(null)
    setIsLoggedIn(false)
    localStorage.removeItem("nextU_user")
  } catch (error) {
    console.error("Logout API failed:", error)
    // Optional: vẫn xóa local nếu server fail, để tránh bị kẹt
    setUser(null)
    setIsLoggedIn(false)
    localStorage.removeItem("nextU_user")
  }
}

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout }}>
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
