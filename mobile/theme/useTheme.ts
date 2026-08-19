import { palettes, type ColorScheme, type Palette } from './tokens'

/**
 * Tema do app. É sempre o claro — não há troca nem leitura da preferência do
 * sistema (decisão de produto). A paleta escura continua definida em
 * `tokens.ts` para quando/se o escuro voltar a ser oferecido.
 */
export function useTheme(): { colors: Palette; scheme: ColorScheme } {
  return { colors: palettes.light, scheme: 'light' }
}
