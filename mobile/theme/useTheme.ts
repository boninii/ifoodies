import { useColorScheme } from 'react-native'
import { palettes, type ColorScheme, type Palette } from './tokens'
import { usePreferences } from './preferences'

/**
 * Tema resolvido a partir da preferência do usuário (Perfil → Aparência).
 * O padrão de produto é CLARO; "sistema" é opt-in, assim como o escuro.
 */
export function useTheme(): { colors: Palette; scheme: ColorScheme } {
  const system = useColorScheme()
  const { themePreference } = usePreferences()

  const scheme: ColorScheme =
    themePreference === 'system' ? (system === 'dark' ? 'dark' : 'light') : themePreference

  return { colors: palettes[scheme], scheme }
}
