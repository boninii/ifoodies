/**
 * Tokens da identidade iFoodies — "Verde IF".
 *
 * O produto é vendido para Institutos Federais, e IF é verde: a paleta parte
 * do verde institucional (floresta #2D5320 → folha #86C55A) sobre papel
 * quase-branco, com o cinza #EAEAEA como traço estrutural. O gesto-assinatura
 * segue sendo o pingo do "i" do wordmark — agora em verde-folha — ecoado no
 * símbolo e no marcador de etapa atual da trilha de pedido.
 *
 * Regras que este arquivo carrega (ver DESIGN.md):
 * - `primary` carrega texto `onPrimary` em qualquer tamanho (8,9:1 no claro).
 * - `accent` nunca assume a cor do texto por cima: sempre `onAccent`.
 * - Tema CLARO é o padrão obrigatório; o escuro é opt-in nas configurações.
 * - Sombra existe só no CTA flutuante e em modal (`shadow.*`).
 */

import type { TextStyle, ViewStyle } from 'react-native'

export type ColorScheme = 'light' | 'dark'

export type Palette = {
  /** Verde floresta — cor de ação. Botões, foco, links, trilha. */
  primary: string
  /** Estado pressionado do primário e fim de degradê. */
  primaryDeep: string
  /** Lavagem verde bem clara — superfícies tingidas. */
  primarySoft: string
  /** Tinta verde média — seleção e contadores com mais presença. */
  primaryTint: string
  /** Verde folha — o pingo do "i". Selos, marcador de etapa, "Pronto!". */
  accent: string
  /** Papel quase-branco esverdeado — fundo geral. */
  ground: string
  /** Superfície de card. */
  surface: string
  /** Cinza estrutural de traços e bordas. */
  rule: string
  /** Texto primário (cinza-verde escuro). */
  ink: string
  /** Texto secundário. */
  inkMuted: string
  /** Exclusivo de perda: esgotado, cancelado, erro, sair. */
  struck: string
  /** Espera que depende de terceiros (pagamento, preparo). */
  pending: string
  /** Texto sobre campo `primary` e sobre o degradê. */
  onPrimary: string
  /** Texto sobre campo `accent`. */
  onAccent: string
  /** Degradê da marca (herói de auth e CTA flutuante). */
  gradient: [string, string]
}

const light: Palette = {
  primary: '#2D5320',
  primaryDeep: '#1F3A16',
  primarySoft: '#EFFAE7',
  primaryTint: '#D3F1B9',
  accent: '#86C55A',
  ground: '#FDFFFB',
  surface: '#FFFFFF',
  rule: '#EAEAEA',
  ink: '#2E332C',
  inkMuted: '#5F6A57',
  struck: '#C03A2F',
  pending: '#9A6108',
  onPrimary: '#FFFFFF',
  onAccent: '#1C2418',
  gradient: ['#3E7527', '#2D5320'],
}

const dark: Palette = {
  primary: '#86C55A',
  primaryDeep: '#6FAE45',
  primarySoft: '#1E2A18',
  primaryTint: '#2A3B20',
  accent: '#2D5320',
  ground: '#0F150D',
  surface: '#182014',
  rule: '#2C3527',
  ink: '#ECF2E6',
  inkMuted: '#A3B098',
  struck: '#EF7B70',
  pending: '#D9A62A',
  onPrimary: '#12190E',
  onAccent: '#ECF2E6',
  gradient: ['#8FCB63', '#65A63F'],
}

export const palettes: Record<ColorScheme, Palette> = { light, dark }

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
    shadowColor: '#1F3A16',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },
  modal: {
    shadowColor: '#0F150D',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.32,
    shadowRadius: 28,
    elevation: 16,
  },
}

/**
 * Tipografia base (escala 1). Os textos de interface são consumidos via
 * `useType()` (theme/preferences.tsx), que aplica o fator de tamanho de
 * fonte escolhido pelo usuário — `display` é voz de marca e não escala.
 */
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
    fontFamily: 'Montserrat-Bold',
    fontSize: 17,
    lineHeight: 22,
  },
  title: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    lineHeight: 21,
  },
  body: {
    fontFamily: 'Montserrat',
    fontSize: 15,
    lineHeight: 22,
  },
  bodySmall: {
    fontFamily: 'Montserrat',
    fontSize: 13,
    lineHeight: 19,
  },
  /** Rótulos de botão, selo e campo. Sentence case — sem gritar em caixa alta. */
  label: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  /** Selos e contadores minúsculos. */
  micro: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.2,
  },
  // Numerais tabulares: preço embaixo de preço alinha (Regra do Numeral).
  numeral: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    lineHeight: 20,
    fontVariant: ['tabular-nums'],
  },
  numeralLarge: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 20,
    lineHeight: 25,
    fontVariant: ['tabular-nums'],
  },
} satisfies Record<string, TextStyle>

export type TypeScale = typeof type

/** Formata em Real, sempre com dois dígitos, para alinhar tabular. */
export function money(value: number | string): string {
  const n = typeof value === 'string' ? parseFloat(value) : value
  return `R$ ${(Number.isFinite(n) ? n : 0).toFixed(2).replace('.', ',')}`
}
