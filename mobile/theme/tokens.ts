/**
 * Tokens do sistema "Quadro de Horários".
 *
 * Regras que este arquivo carrega (ver DESIGN.md):
 * - Nada levita: não existe token de sombra. Profundidade é fio + tom.
 * - Canto reto é a regra; 2px só em botão/chip.
 * - Texto pequeno nunca vai sobre `ifGreen` (3,49:1); vai sobre `greenDeep`
 *   (6,58:1). Os contrastes foram medidos, não estimados.
 */

import type { TextStyle } from 'react-native'

export type ColorScheme = 'light' | 'dark'

export type Palette = {
  /** Verde institucional oficial do IFSP. Campo grande, grafismo, texto ≥20px. */
  ifGreen: string
  /** Variante que carrega texto pequeno em branco. */
  greenDeep: string
  /** Tom de faixa selecionada / linha de soma. */
  greenWash: string
  /** Fundo geral da tela. */
  ground: string
  /** Superfície de linha, um degrau acima do fundo. */
  surface: string
  /** Fio de régua de 1px — o elemento estrutural mais usado. */
  rule: string
  /** Texto primário. */
  ink: string
  /** Texto secundário. */
  inkMuted: string
  /** Exclusivo de perda: esgotado, cancelado, erro. */
  struck: string
  /** Estados de espera que dependem de terceiros. */
  pending: string
  /** Texto sobre campo verde. */
  onGreen: string
}

const light: Palette = {
  ifGreen: '#2F9E41',
  greenDeep: '#1F6B2C',
  greenWash: '#E4F0E4',
  ground: '#F4F6F3',
  surface: '#FFFFFF',
  rule: '#C9D2C8',
  ink: '#14201A',
  inkMuted: '#4A5A50',
  struck: '#A63A28',
  pending: '#9A6B08',
  onGreen: '#FFFFFF',
}

const dark: Palette = {
  ifGreen: '#3FB854',
  greenDeep: '#2F9E41',
  greenWash: '#17251A',
  ground: '#0E120F',
  surface: '#171D18',
  rule: '#2C352D',
  ink: '#E8EFE7',
  inkMuted: '#9AA89C',
  struck: '#E4785F',
  pending: '#D9A62A',
  onGreen: '#08120A',
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

export const radius = {
  none: 0,
  chip: 2,
  pill: 999,
} as const

/**
 * Alvo de toque mínimo. 48 atende Android (48dp) e iOS (44pt) com uma medida.
 */
export const TOUCH_TARGET = 48

export const type = {
  display: {
    fontFamily: 'Fraunces',
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  headline: {
    fontFamily: 'Fraunces',
    fontSize: 22,
    lineHeight: 26,
  },
  title: {
    fontFamily: 'ElmsSans-SemiBold',
    fontSize: 16,
    lineHeight: 20,
  },
  body: {
    fontFamily: 'ElmsSans',
    fontSize: 15,
    lineHeight: 21,
  },
  bodySmall: {
    fontFamily: 'ElmsSans',
    fontSize: 13,
    lineHeight: 18,
  },
  label: {
    fontFamily: 'ElmsSans-SemiBold',
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  // Numerais tabulares: preço embaixo de preço alinha como horário embaixo
  // de horário (Regra do Numeral Tabular).
  numeral: {
    fontFamily: 'ElmsSans-SemiBold',
    fontSize: 16,
    lineHeight: 20,
    fontVariant: ['tabular-nums'],
  },
  numeralLarge: {
    fontFamily: 'ElmsSans-SemiBold',
    fontSize: 20,
    lineHeight: 24,
    fontVariant: ['tabular-nums'],
  },
} satisfies Record<string, TextStyle>

/** Formata em Real, sempre com dois dígitos, para alinhar tabular. */
export function money(value: number | string): string {
  const n = typeof value === 'string' ? parseFloat(value) : value
  return `R$ ${(Number.isFinite(n) ? n : 0).toFixed(2).replace('.', ',')}`
}
