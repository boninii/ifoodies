import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { type as baseType, type TypeScale } from './tokens'

/**
 * Preferências de aparência do usuário, persistidas no aparelho:
 *
 * - Tema: o app SEMPRE nasce no claro (decisão de produto) e o aluno pode
 *   trocar para escuro — ou seguir o sistema — nas configurações do Perfil.
 * - Tamanho de fonte: os textos de interface nascem pequenos e um controle
 *   fixo na tela permite aumentar, diminuir e voltar ao padrão. O fator
 *   escala tudo menos a voz da marca (`display`).
 */

export type ThemePreference = 'light' | 'dark' | 'system'

const THEME_KEY = '@ifoodies/tema'
const FONT_KEY = '@ifoodies/fonte'

/** Degraus de escala. O índice 0 é o padrão ("como veio"). */
const FONT_STEPS = [1, 1.15, 1.3] as const
const MIN_STEP = 0
const MAX_STEP = FONT_STEPS.length - 1

type PreferencesValue = {
  themePreference: ThemePreference
  setThemePreference: (p: ThemePreference) => void
  fontStep: number
  fontScale: number
  increaseFont: () => void
  decreaseFont: () => void
  resetFont: () => void
}

const PreferencesContext = createContext<PreferencesValue>({
  themePreference: 'light',
  setThemePreference: () => {},
  fontStep: 0,
  fontScale: 1,
  increaseFont: () => {},
  decreaseFont: () => {},
  resetFont: () => {},
})

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [themePreference, setThemeState] = useState<ThemePreference>('light')
  const [fontStep, setFontStep] = useState(0)

  useEffect(() => {
    AsyncStorage.multiGet([THEME_KEY, FONT_KEY])
      .then(([[, theme], [, font]]) => {
        if (theme === 'light' || theme === 'dark' || theme === 'system') {
          setThemeState(theme)
        }
        const step = Number(font)
        if (Number.isInteger(step) && step >= MIN_STEP && step <= MAX_STEP) {
          setFontStep(step)
        }
      })
      .catch(() => {})
  }, [])

  const setThemePreference = (p: ThemePreference) => {
    setThemeState(p)
    AsyncStorage.setItem(THEME_KEY, p).catch(() => {})
  }

  const changeFont = (step: number) => {
    const clamped = Math.min(MAX_STEP, Math.max(MIN_STEP, step))
    setFontStep(clamped)
    AsyncStorage.setItem(FONT_KEY, String(clamped)).catch(() => {})
  }

  const value = useMemo<PreferencesValue>(
    () => ({
      themePreference,
      setThemePreference,
      fontStep,
      fontScale: FONT_STEPS[fontStep],
      increaseFont: () => changeFont(fontStep + 1),
      decreaseFont: () => changeFont(fontStep - 1),
      resetFont: () => changeFont(0),
    }),
    [themePreference, fontStep],
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences(): PreferencesValue {
  return useContext(PreferencesContext)
}

/**
 * Tipografia com o fator de tamanho aplicado. `display` não escala — é a voz
 * da marca; todo o resto acompanha a escolha do usuário.
 */
export function useType(): TypeScale {
  const { fontScale } = usePreferences()

  return useMemo(() => {
    if (fontScale === 1) return baseType

    const scaled = {} as Record<string, unknown>
    for (const [role, style] of Object.entries(baseType)) {
      if (role === 'display') {
        scaled[role] = style
        continue
      }
      const s = style as { fontSize: number; lineHeight: number }
      scaled[role] = {
        ...style,
        fontSize: Math.round(s.fontSize * fontScale),
        lineHeight: Math.round(s.lineHeight * fontScale),
      }
    }
    return scaled as TypeScale
  }, [fontScale])
}
