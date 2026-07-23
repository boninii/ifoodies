import React from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native'
import { useTheme } from '@/theme/useTheme'
import { money, radius, spacing, TOUCH_TARGET, type } from '@/theme/tokens'

/* ------------------------------------------------------------------ *
 * Fio de régua — o separador estrutural do sistema. 1px, nunca sombra.
 * ------------------------------------------------------------------ */
export function Rule({ inset = 0 }: { inset?: number }) {
  const { colors } = useTheme()
  return (
    <View
      style={{
        height: StyleSheet.hairlineWidth * 2,
        backgroundColor: colors.rule,
        marginLeft: inset,
      }}
    />
  )
}

/* ------------------------------------------------------------------ *
 * Cabeçalho de faixa — o que dá o ritmo de "quadro" à tela.
 * Campo verde profundo (6,58:1 com branco) porque carrega texto pequeno.
 * ------------------------------------------------------------------ */
export function BandHeader({ label, trailing }: { label: string; trailing?: string }) {
  const { colors } = useTheme()
  return (
    <View style={[styles.bandHeader, { backgroundColor: colors.greenDeep }]}>
      <Text style={[type.label, { color: colors.onGreen }]} numberOfLines={1}>
        {label}
      </Text>
      {trailing ? (
        <Text style={[type.label, { color: colors.onGreen }]}>{trailing}</Text>
      ) : null}
    </View>
  )
}

/* ------------------------------------------------------------------ *
 * Botão. Canto 2px, altura 52, sem sombra, sem escala no press.
 * Desabilitado exige motivo dito por extenso (prop `disabledReason`).
 * ------------------------------------------------------------------ */
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  disabledReason,
  loading,
  accessibilityLabel,
}: {
  label: string
  onPress?: () => void
  variant?: 'primary' | 'quiet' | 'destructive'
  disabled?: boolean
  disabledReason?: string
  loading?: boolean
  accessibilityLabel?: string
}) {
  const { colors } = useTheme()
  const isOff = disabled || loading

  const field =
    variant === 'primary'
      ? colors.greenDeep
      : variant === 'destructive'
        ? colors.struck
        : colors.surface

  const fg = variant === 'quiet' ? colors.ink : colors.onGreen

  return (
    <View>
      <Pressable
        onPress={isOff ? undefined : onPress}
        disabled={isOff}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled: !!isOff, busy: !!loading }}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: isOff ? colors.rule : field,
            borderColor: variant === 'quiet' ? colors.rule : 'transparent',
            borderWidth: variant === 'quiet' ? StyleSheet.hairlineWidth * 2 : 0,
            opacity: pressed ? 0.82 : 1,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={isOff ? colors.inkMuted : fg} />
        ) : (
          <Text style={[type.label, { color: isOff ? colors.inkMuted : fg }]}>{label}</Text>
        )}
      </Pressable>

      {isOff && disabledReason ? (
        <Text style={[type.bodySmall, { color: colors.inkMuted, marginTop: spacing.sm }]}>
          {disabledReason}
        </Text>
      ) : null}
    </View>
  )
}

/* ------------------------------------------------------------------ *
 * Campo de formulário. Reto, fio de 1px; foco troca o fio para verde.
 * Erro nomeia o problema E a recuperação.
 * ------------------------------------------------------------------ */
export function Field({
  label,
  error,
  style,
  ...inputProps
}: TextInputProps & { label: string; error?: string }) {
  const { colors } = useTheme()
  const [focused, setFocused] = React.useState(false)

  const border = error ? colors.struck : focused ? colors.ifGreen : colors.rule

  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={[type.label, { color: colors.inkMuted, marginBottom: spacing.sm }]}>
        {label}
      </Text>

      <TextInput
        {...inputProps}
        onFocus={(e) => {
          setFocused(true)
          inputProps.onFocus?.(e)
        }}
        onBlur={(e) => {
          setFocused(false)
          inputProps.onBlur?.(e)
        }}
        placeholderTextColor={colors.inkMuted}
        accessibilityLabel={label}
        style={[
          styles.field,
          type.body,
          {
            backgroundColor: colors.surface,
            borderColor: border,
            borderWidth: focused || error ? 2 : StyleSheet.hairlineWidth * 2,
            color: colors.ink,
          },
          style,
        ]}
      />

      {error ? (
        <Text style={[type.bodySmall, { color: colors.struck, marginTop: spacing.xs }]}>
          {error}
        </Text>
      ) : null}
    </View>
  )
}

/* ------------------------------------------------------------------ *
 * Contador de quantidade. Único elemento em pílula do sistema — ele é o
 * que se manipula, e a forma diz isso.
 * ------------------------------------------------------------------ */
export function Stepper({
  value,
  onIncrease,
  onDecrease,
  max,
  itemName,
}: {
  value: number
  onIncrease: () => void
  onDecrease: () => void
  max?: number
  itemName: string
}) {
  const { colors } = useTheme()
  const atMax = typeof max === 'number' && value >= max

  return (
    <View style={[styles.stepper, { borderColor: colors.rule }]}>
      <Pressable
        onPress={value > 0 ? onDecrease : undefined}
        disabled={value === 0}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Diminuir ${itemName}`}
        style={styles.stepperButton}
      >
        <Text
          style={[type.numeralLarge, { color: value === 0 ? colors.rule : colors.ink }]}
        >
          −
        </Text>
      </Pressable>

      <Text
        style={[type.numeral, styles.stepperValue, { color: colors.ink }]}
        accessibilityLabel={`${value} ${itemName}`}
      >
        {value}
      </Text>

      <Pressable
        onPress={atMax ? undefined : onIncrease}
        disabled={atMax}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Aumentar ${itemName}`}
        style={styles.stepperButton}
      >
        <Text style={[type.numeralLarge, { color: atMax ? colors.rule : colors.ifGreen }]}>
          +
        </Text>
      </Pressable>
    </View>
  )
}

/* ------------------------------------------------------------------ *
 * Preço. Sempre tabular e alinhado à direita (Regra do Numeral Tabular).
 * ------------------------------------------------------------------ */
export function Price({ value, muted }: { value: number | string; muted?: boolean }) {
  const { colors } = useTheme()
  return (
    <Text style={[type.numeral, { color: muted ? colors.inkMuted : colors.ink, textAlign: 'right' }]}>
      {money(value)}
    </Text>
  )
}

/* ------------------------------------------------------------------ *
 * Aviso em faixa. Usado para o que é verdade mas ainda não funciona
 * (ex.: pagamento no app) — nunca finge que está pronto.
 * ------------------------------------------------------------------ */
export function Notice({
  label,
  children,
  tone = 'pending',
}: {
  label: string
  children: string
  tone?: 'pending' | 'struck' | 'neutral'
}) {
  const { colors } = useTheme()
  const accent =
    tone === 'pending' ? colors.pending : tone === 'struck' ? colors.struck : colors.inkMuted

  return (
    <View style={[styles.notice, { backgroundColor: colors.surface, borderColor: colors.rule }]}>
      <Text style={[type.label, { color: accent, marginBottom: spacing.xs }]}>{label}</Text>
      <Text style={[type.bodySmall, { color: colors.inkMuted }]}>{children}</Text>
    </View>
  )
}

/* ------------------------------------------------------------------ *
 * Estado vazio. Faixa, não ilustração genérica.
 * ------------------------------------------------------------------ */
export function Empty({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: React.ReactNode
}) {
  const { colors } = useTheme()
  return (
    <View style={styles.empty}>
      <Text style={[type.headline, { color: colors.ink, marginBottom: spacing.sm }]}>{title}</Text>
      <Text
        style={[type.body, { color: colors.inkMuted, marginBottom: spacing.xl, textAlign: 'center' }]}
      >
        {body}
      </Text>
      {action}
    </View>
  )
}

export function Section({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[{ paddingHorizontal: spacing.lg }, style]}>{children}</View>
}

const styles = StyleSheet.create({
  bandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  button: {
    minHeight: 52,
    borderRadius: radius.chip,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  field: {
    minHeight: 52,
    borderRadius: radius.none,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: radius.pill,
  },
  stepperButton: {
    width: TOUCH_TARGET - 8,
    height: TOUCH_TARGET - 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    minWidth: 24,
    textAlign: 'center',
  },
  notice: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: radius.none,
    padding: spacing.lg,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
})
