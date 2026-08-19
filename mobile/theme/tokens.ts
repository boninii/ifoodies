/**
 * Tokens da identidade iFoodies — "Verde Vivo".
 *
 * O produto é vendido para Institutos Federais, e IF é verde — mas o verde
 * daqui é vivo e macio, não militar: kelly (#2B7E23) para ação sobre
 * superfícies mint tingidas. A separação entre card e fundo é TONAL (fundo
 * tingido + card branco), não por borda — bordas de 1px em tudo era o que
 * deixava a interface dura.
 *
 * Regras que este arquivo carrega (ver DESIGN.md):
 * - `primary` carrega texto `onPrimary` em qualquer tamanho (5,1:1 no claro).
 * - `accent` nunca assume a cor do texto por cima: sempre `onAccent`.
 * - Tema CLARO é o padrão obrigatório; o escuro é opt-in nas configurações.
 * - Sombra existe só no CTA flutuante e em modal (`shadow.*`).
 * - Unbounded é a voz de TODOS os títulos; Figtree faz o resto.
 */

import type { TextStyle, ViewStyle } from 'react-native'

export type ColorScheme = 'light' | 'dark'

export type Palette = {
  /** Verde kelly — cor de ação. Botões, foco, links, trilha. */
  primary: string
  /** Estado pressionado do primário e fim de degradê. */
  primaryDeep: string
  /** Lavagem mint — superfícies tingidas: chips, tonal, painéis. */
  primarySoft: string
  /** Tinta mint mais presente — seleção, stepper ativo. */
  primaryTint: string
  /** Verde folha — o pingo do "i". Selos, marcador de etapa, "Pronto!". */
  accent: string
  /** Papel mint — fundo geral tingido; é ele que faz o card flutuar sem borda. */
  ground: string
  /** Superfície de card. */
  surface: string
  /** Traço suave esverdeado — só onde borda é affordance (campos de form). */
  rule: string
  /** Contorno do card de produto: verde de ação a 80%, definido no design. */
  cardBorder: string
  /** Texto primário. */
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
  primary: '#2B7E23',
  primaryDeep: '#1E5C18',
  primarySoft: '#EAF6E2',
  primaryTint: '#D3EDC2',
  accent: '#8BD264',
  ground: '#F1F7EC',
  surface: '#FFFFFF',
  rule: '#DCE9D4',
  cardBorder: 'rgba(43, 126, 35, 0.8)',
  ink: '#223021',
  inkMuted: '#5A6B53',
  struck: '#C74A38',
  pending: '#96650B',
  onPrimary: '#FFFFFF',
  onAccent: '#1B2A16',
  gradient: ['#2B7E23', '#1B5716'],
}

const dark: Palette = {
  primary: '#7EC95B',
  primaryDeep: '#67B148',
  primarySoft: '#22331F',
  primaryTint: '#2C4327',
  accent: '#2F7526',
  ground: '#111A11',
  surface: '#1B271B',
  rule: '#2E3D2C',
  cardBorder: 'rgba(126, 201, 91, 0.4)',
  ink: '#EAF2E5',
  inkMuted: '#A5B49C',
  struck: '#E98474',
  pending: '#D9A93F',
  onPrimary: '#101A0E',
  onAccent: '#EAF2E5',
  gradient: ['#8AD163', '#57A03C'],
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

/** Geometria macia: cantos generosos, ações em pílula. */
export const radius = {
  sm: 12,
  md: 16,
  lg: 24,
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
 * Card comum não tem sombra — profundidade é tom sobre tom.
 */
export const shadow: Record<'floating' | 'modal', ViewStyle> = {
  floating: {
    shadowColor: '#1E5C18',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },
  modal: {
    shadowColor: '#111A11',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.32,
    shadowRadius: 28,
    elevation: 16,
  },
}

/**
 * Tipografia do sistema. Unbounded é a voz de TODOS os títulos (títulos que
 * eram <16px descem 1px ao virar Unbounded — daí o eyebrow em 10). A Figtree
 * — geométrica de terminais macios — faz corpo, rótulos e números.
 * Consumida nas telas via `useType()` (theme/preferences.tsx).
 */
export const type = {
  /** Título de tela e wordmark. */
  display: {
    fontFamily: 'Unbounded-Bold',
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.4,
  },
  /** Título de seção/categoria e nome de produto no popup. */
  headline: {
    fontFamily: 'Unbounded-SemiBold',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  /** Título pequeno (era micro 11 → Unbounded 10): "Categorias", "Pedido"… */
  eyebrow: {
    fontFamily: 'Unbounded-SemiBold',
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.4,
  },
  title: {
    fontFamily: 'Figtree-Bold',
    fontSize: 16,
    lineHeight: 21,
  },
  body: {
    fontFamily: 'Figtree',
    fontSize: 14,
    lineHeight: 21,
  },
  bodySmall: {
    fontFamily: 'Figtree',
    fontSize: 13,
    lineHeight: 19,
  },
  /** Rótulos de botão e campo. Sentence case — sem gritar em caixa alta. */
  label: {
    fontFamily: 'Figtree-Bold',
    fontSize: 13,
    lineHeight: 17,
    letterSpacing: 0.1,
  },
  /** Selos e contadores minúsculos. */
  micro: {
    fontFamily: 'Figtree-Bold',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.2,
  },
  // Numerais tabulares: preço embaixo de preço alinha (Regra do Numeral).
  numeral: {
    fontFamily: 'Figtree-Bold',
    fontSize: 16,
    lineHeight: 20,
    fontVariant: ['tabular-nums'],
  },
  numeralLarge: {
    fontFamily: 'Figtree-Bold',
    fontSize: 20,
    lineHeight: 25,
    fontVariant: ['tabular-nums'],
  },
  /** Sinais − e + do contador. */
  stepperSign: {
    fontFamily: 'Figtree-Bold',
    fontSize: 16,
    lineHeight: 16,
  },
  /** Quantidade dentro do contador. */
  stepperValue: {
    fontFamily: 'Figtree-Bold',
    fontSize: 14,
    lineHeight: 15,
    fontVariant: ['tabular-nums'],
  },
} satisfies Record<string, TextStyle>

export type TypeScale = typeof type

/** Formata em Real, sempre com dois dígitos, para alinhar tabular. */
export function money(value: number | string): string {
  const n = typeof value === 'string' ? parseFloat(value) : value
  return `R$ ${(Number.isFinite(n) ? n : 0).toFixed(2).replace('.', ',')}`
}
