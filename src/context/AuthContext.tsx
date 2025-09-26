import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { message } from 'antd'

interface User {
  email: string
  name?: string
  id?: string
  role?: 'admin' | 'manager' | 'employee'
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, user: User) => void
  logout: () => void
  setUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUserState] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const savedToken = localStorage.getItem('token')
        const savedUser = localStorage.getItem('user')

        if (savedToken && savedUser) {
          setToken(savedToken)
          setUserState(JSON.parse(savedUser))
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = (newToken: string, newUser: User) => {
    try {
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(newUser))
      setToken(newToken)
      setUserState(newUser)
    } catch (error) {
      console.error('Error saving auth data:', error)
      message.error('Lỗi lưu thông tin đăng nhập')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUserState(null)
    message.info('Đã đăng xuất')
  }

  const setUser = (newUser: User) => {
    try {
      localStorage.setItem('user', JSON.stringify(newUser))
      setUserState(newUser)
    } catch (error) {
      console.error('Error saving user data:', error)
    }
  }

  const contextValue: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    setUser,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
