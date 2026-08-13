/**
 * Tokens da identidade iFoodies — "Açaí & Manga".
 *
 * A marca é própria, não institucional: o roxo vem do açaí (comida real de
 * estudante brasileiro) e o amarelo vem da manga. O pingo do "i" de iFoodies
 * é sempre manga — é o gesto-assinatura da marca, e reaparece como marcador
 * de etapa atual na trilha de pedido.
 *
 * Regras que este arquivo carrega (ver DESIGN.md):
 * - `primary` (#6C2BD9, 7,0:1 com branco) carrega texto branco em qualquer
 *   tamanho; `primaryDeep` é o estado pressionado e o fim dos degradês.
 * - `accent` (manga) nunca carrega texto branco — sempre `ink` por cima.
 * - Profundidade é tom sobre tom; sombra existe só no CTA flutuante e em
 *   modal (tokens `shadow.*`), nunca espalhada em card.
 */

import type { TextStyle, ViewStyle } from 'react-native'

export type ColorScheme = 'light' | 'dark'

export type Palette = {
  /** Roxo açaí — cor principal da marca. Botões, foco, indicadores, trilha. */
  primary: string
  /** Açaí escuro — pressed, degradê, campos de ênfase máxima. */
  primaryDeep: string
  /** Névoa de açaí — superfícies tingidas: chips, linha de soma, seleção. */
  primarySoft: string
  /** Manga — o pingo do "i". Destaques, "pronto para retirar", selos. */
  accent: string
  /** Papel lavanda — fundo geral, levemente tingido de roxo. Nunca creme. */
  ground: string
  /** Superfície de card, um degrau acima do fundo. */
  surface: string
  /** Traço de contorno de cards e campos. */
  rule: string
  /** Texto primário (tinta ameixa). */
  ink: string
  /** Texto secundário. */
  inkMuted: string
  /** Morango — exclusivo de perda: esgotado, cancelado, erro, sair. */
  struck: string
  /** Espera que depende de terceiros (aguardando pagamento, em preparo). */
  pending: string
  /** Texto sobre campo roxo. */
  onPrimary: string
  /** Texto sobre campo manga. */
  onAccent: string
}

const light: Palette = {
  primary: '#6C2BD9',
  primaryDeep: '#4A1FA3',
  primarySoft: '#F1EAFE',
  accent: '#FFB300',
  ground: '#F7F5FC',
  surface: '#FFFFFF',
  rule: '#E6E1F2',
  ink: '#191331',
  inkMuted: '#5C5478',
  struck: '#D6284A',
  pending: '#9A6108',
  onPrimary: '#FFFFFF',
  onAccent: '#191331',
}

const dark: Palette = {
  primary: '#7C3AED',
  primaryDeep: '#5B21C7',
  primarySoft: '#2A1D49',
  accent: '#FFC53D',
  ground: '#120C1E',
  surface: '#1C1430',
  rule: '#332A4E',
  ink: '#F2EDFB',
  inkMuted: '#A79BC8',
  struck: '#FF7B93',
  pending: '#E8B04B',
  onPrimary: '#FFFFFF',
  onAccent: '#191331',
}

export const palettes: Record<ColorScheme, Palette> = { light, dark }

/** Degradê da marca (heróis de auth e CTA flutuante). Início → fim. */
export const brandGradient: [string, string] = ['#7C3AED', '#4A1FA3']

/** Escala 4/8/12/16/24/40. Grupos apertados por dentro, separação por fora. */
export const spacing = {
  hair: 1,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 40,
} as const

/** Geometria amigável: cards arredondados, ações em pílula. */
export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  pill: 999,
} as const

/**
 * Alvo de toque mínimo. 48 atende Android (48dp) e iOS (44pt) com uma medida.
 */
export const TOUCH_TARGET = 48

/** Largura máxima do conteúdo em telas largas (web/tablet). */
export const CONTENT_MAX_WIDTH = 600

/**
 * As duas únicas sombras do sistema: o CTA flutuante e modais.
 * Card comum não tem sombra — profundidade é tom + traço.
 */
export const shadow: Record<'floating' | 'modal', ViewStyle> = {
  floating: {
    shadowColor: '#2A1D49',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },
  modal: {
    shadowColor: '#120C1E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.32,
    shadowRadius: 28,
    elevation: 16,
  },
}

export const type = {
  /** Voz da marca: títulos de tela e wordmark. Unbounded, larga e jovem. */
  display: {
    fontFamily: 'Unbounded-Bold',
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.4,
  },
  /** Nome de produto e título de seção grande. */
  headline: {
    fontFamily: 'Sora-Bold',
    fontSize: 17,
    lineHeight: 22,
  },
  title: {
    fontFamily: 'Sora-SemiBold',
    fontSize: 16,
    lineHeight: 21,
  },
  body: {
    fontFamily: 'Sora',
    fontSize: 15,
    lineHeight: 22,
  },
  bodySmall: {
    fontFamily: 'Sora',
    fontSize: 13,
    lineHeight: 19,
  },
  /** Rótulos de botão, selo e campo. Sentence case — sem gritar em caixa alta. */
  label: {
    fontFamily: 'Sora-Bold',
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  /** Selos e contadores minúsculos. */
  micro: {
    fontFamily: 'Sora-Bold',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.2,
  },
  // Numerais tabulares: preço embaixo de preço alinha (Regra do Numeral).
  numeral: {
    fontFamily: 'Sora-Bold',
    fontSize: 16,
    lineHeight: 20,
    fontVariant: ['tabular-nums'],
  },
  numeralLarge: {
    fontFamily: 'Sora-Bold',
    fontSize: 20,
    lineHeight: 25,
    fontVariant: ['tabular-nums'],
  },
} satisfies Record<string, TextStyle>

/** Formata em Real, sempre com dois dígitos, para alinhar tabular. */
export function money(value: number | string): string {
  const n = typeof value === 'string' ? parseFloat(value) : value
  return `R$ ${(Number.isFinite(n) ? n : 0).toFixed(2).replace('.', ',')}`
}
