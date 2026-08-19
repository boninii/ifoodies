import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { type as baseType, type TypeScale } from './tokens'

/**
 * Preferências de aparência do usuário, persistidas no aparelho.
 *
 * Tema: o app SEMPRE nasce no claro (decisão de produto) e o aluno pode
 * trocar para escuro — ou seguir o sistema — nas configurações do Perfil.
 */

export type ThemePreference = 'light' | 'dark' | 'system'

const THEME_KEY = '@ifoodies/tema'

type PreferencesValue = {
  themePreference: ThemePreference
  setThemePreference: (p: ThemePreference) => void
}

const PreferencesContext = createContext<PreferencesValue>({
  themePreference: 'light',
  setThemePreference: () => {},
})

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [themePreference, setThemeState] = useState<ThemePreference>('light')

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((theme) => {
        if (theme === 'light' || theme === 'dark' || theme === 'system') {
          setThemeState(theme)
        }
      })
      .catch(() => {})
  }, [])

  const setThemePreference = (p: ThemePreference) => {
    setThemeState(p)
    AsyncStorage.setItem(THEME_KEY, p).catch(() => {})
  }

  const value = useMemo<PreferencesValue>(
    () => ({ themePreference, setThemePreference }),
    [themePreference],
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences(): PreferencesValue {
  return useContext(PreferencesContext)
}

/** Tipografia do sistema (hook mantido como ponto único de consumo nas telas). */
export function useType(): TypeScale {
  return baseType
}
