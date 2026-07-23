import { useColorScheme } from 'react-native'
import { palettes, type ColorScheme, type Palette } from './tokens'

/**
 * Tema claro/escuro seguindo a preferência do sistema. Android e iOS tratam o
 * tema escuro como cidadão de primeira classe, então ele não é um "invert
 * rápido": as duas paletas foram escritas e conferidas separadamente.
 */
export function useTheme(): { colors: Palette; scheme: ColorScheme } {
  const scheme: ColorScheme = useColorScheme() === 'dark' ? 'dark' : 'light'
  return { colors: palettes[scheme], scheme }
}
