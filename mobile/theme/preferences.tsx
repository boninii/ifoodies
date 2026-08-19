import React from 'react'
import { type as baseType, type TypeScale } from './tokens'

/**
 * O app tem um tema só: o claro. Não há troca nem preferência persistida —
 * decisão de produto, para a interface ser sempre a mesma no balcão.
 *
 * Este provider segue existindo como ponto único de acesso à tipografia,
 * o que mantém as telas desacopladas dos tokens.
 */
export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

/** Tipografia do sistema. */
export function useType(): TypeScale {
  return baseType
}
