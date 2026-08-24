import { api, setUnauthorizedHandler } from '@/services/api'
import { getToken, removeToken, saveToken } from '@/services/auth'
import React, { createContext, useCallback, useEffect, useState } from 'react'

type AuthContextType = {
  token: string | null
  /** Id do aluno logado — identifica o canal privado do tempo real. */
  userId: number | null
  isAuthenticated: boolean
  /** True enquanto o token salvo ainda está sendo carregado do storage. */
  isLoading: boolean
  login: (token: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  userId: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [token, setToken] = useState<string | null>(null)

  const [userId, setUserId] = useState<number | null>(null)

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

  /**
   * Sair de verdade: além de apagar o token do aparelho, avisa a API para
   * revogá-lo. Sem esse aviso o token continuava valendo no servidor para
   * sempre — sair do app não encerrava a sessão, só a escondia.
   *
   * A limpeza local acontece mesmo se a chamada falhar (sem rede, servidor
   * fora): quem pediu para sair, sai.
   */
  const logout = useCallback(async () => {
    try {
      await api('/logout', { method: 'POST' })
    } catch {
      // Sem conexão: o token expira sozinho pela validade do Sanctum.
    }

    await removeToken()
    setToken(null)
    setUserId(null)
  }, [])

  // Descobre quem é o dono da sessão para poder assinar o canal privado.
  useEffect(() => {
    if (!token) return

    let alive = true
    api<{ id: number }>('/profile')
      .then(({ ok, data }) => {
        if (alive && ok && data?.id) setUserId(data.id)
      })
      .catch(() => {})

    return () => {
      alive = false
    }
  }, [token])

  // Faz logout automático quando qualquer chamada à API responder 401
  // (token expirado ou inválido), levando o usuário de volta ao login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      // Aqui o token já é inválido: não adianta chamar /logout.
      removeToken()
      setToken(null)
      setUserId(null)
    })

    return () => setUnauthorizedHandler(null)
  }, [])

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider value={{ token, userId, isAuthenticated, isLoading, login, logout }}>
      { children }
    </AuthContext.Provider>
  )
}
