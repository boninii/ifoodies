import { setUnauthorizedHandler } from '@/services/api'
import { getToken, removeToken, saveToken } from '@/services/auth'
import React, { createContext, useEffect, useState } from 'react'

type AuthContextType = {
  token: string | null
  isAuthenticated: boolean
  /** True enquanto o token salvo ainda está sendo carregado do storage. */
  isLoading: boolean
  login: (token: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [token, setToken] = useState<string | null>(null)

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadToken = async () => {
      const savedToken = await getToken()
      setToken(savedToken)
      setIsLoading(false)
    }

    loadToken()
  }, [])

  const login = async (newToken: string) => {
    await saveToken(newToken)
    setToken(newToken)
  }

  const logout = async () => {
    await removeToken()
    setToken(null)
  }

  // Faz logout automático quando qualquer chamada à API responder 401
  // (token expirado ou inválido), levando o usuário de volta ao login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout()
    })

    return () => setUnauthorizedHandler(null)
  }, [])

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, isLoading, login, logout }}>
      { children }
    </AuthContext.Provider>
  )
}
