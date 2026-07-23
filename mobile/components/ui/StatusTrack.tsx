import React from 'react'
import { AccessibilityInfo, Animated, StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/theme/useTheme'
import { spacing, type } from '@/theme/tokens'

/**
 * Componente-assinatura: o ciclo do pedido desenhado como faixas horizontais
 * consecutivas, lidas como períodos de um dia no quadro de horários.
 *
 * Etapas cumpridas são campo verde cheio; futuras são fio vazio. Cancelado
 * substitui a trilha inteira por uma faixa riscada.
 *
 * Os estados vêm do backend e não podem ser inventados aqui:
 * open · awaiting_payment · approved · in_preparation · ready · canceled
 */

const STEPS = [
  { key: 'open', short: 'Aberto' },
  { key: 'approved', short: 'Aprovado' },
  { key: 'in_preparation', short: 'Preparo' },
  { key: 'ready', short: 'Pronto' },
] as const

/** Em qual degrau da trilha cada status do backend cai. */
const STEP_INDEX: Record<string, number> = {
  open: 0,
  awaiting_payment: 0,
  approved: 1,
  in_preparation: 2,
  ready: 3,
}

export const STATUS_LABEL: Record<string, string> = {
  open: 'Aberto',
  awaiting_payment: 'Aguardando pagamento',
  approved: 'Aprovado',
  in_preparation: 'Em preparação',
  ready: 'Pronto para retirada',
  canceled: 'Cancelado',
}

export function StatusTrack({ status }: { status: string }) {
  const { colors } = useTheme()
  const canceled = status === 'canceled'
  const reached = STEP_INDEX[status] ?? 0

  const [reduceMotion, setReduceMotion] = React.useState(true)
  const progress = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    let alive = true
    AccessibilityInfo.isReduceMotionEnabled().then((on) => {
      if (alive) setReduceMotion(on)
    })
    return () => {
      alive = false
    }
  }, [])

  // O único momento de movimento autorado do app: a trilha preenche até onde
  // o pedido chegou. Com Reduce Motion, aparece já preenchida.
  React.useEffect(() => {
    if (canceled) return
    if (reduceMotion) {
      progress.setValue(1)
      return
    }
    Animated.timing(progress, {
      toValue: 1,
      duration: 520,
      useNativeDriver: false,
    }).start()
  }, [canceled, reduceMotion, progress, status])

  if (canceled) {
    return (
      <View accessibilityLabel="Pedido cancelado">
        <View style={[styles.canceledBand, { backgroundColor: colors.struck }]}>
          <Text style={[type.label, { color: colors.onGreen }]}>Cancelado</Text>
        </View>
      </View>
    )
  }

  return (
    <View accessibilityLabel={`Status do pedido: ${STATUS_LABEL[status] ?? status}`}>
      <View style={styles.track}>
        {STEPS.map((step, i) => {
          const done = i <= reached
          const width = progress.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
          })

          return (
            <View key={step.key} style={styles.segmentWrap}>
              <View style={[styles.segment, { borderColor: colors.rule }]}>
                {done ? (
                  <Animated.View
                    style={[
                      StyleSheet.absoluteFill,
                      { backgroundColor: colors.ifGreen, width },
                    ]}
                  />
                ) : null}
              </View>
            </View>
          )
        })}
      </View>

      <View style={styles.track}>
        {STEPS.map((step, i) => (
          <View key={step.key} style={styles.segmentWrap}>
            <Text
              style={[
                type.label,
                {
                  color: i <= reached ? colors.ink : colors.inkMuted,
                  fontSize: 10,
                  letterSpacing: 0.6,
                },
              ]}
              numberOfLines={1}
            >
              {step.short}
            </Text>
          </View>
        ))}
      </View>

      {status === 'awaiting_payment' ? (
        <Text style={[type.bodySmall, { color: colors.pending, marginTop: spacing.sm }]}>
          Aguardando pagamento no balcão.
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  segmentWrap: {
    flex: 1,
  },
  segment: {
    height: 8,
    borderWidth: StyleSheet.hairlineWidth * 2,
    overflow: 'hidden',
  },
  canceledBand: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
})
