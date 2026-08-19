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
import { useType } from '@/theme/preferences'
import { money, radius, spacing, TOUCH_TARGET } from '@/theme/tokens'

/* ------------------------------------------------------------------ *
 * Traço separador. 1px; profundidade no iFoodies é tom, não sombra.
 * ------------------------------------------------------------------ */
export function Rule({ inset = 0 }: { inset?: number }) {
  const { colors } = useTheme()
  const type = useType()
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
 * Cabeçalho de seção: título em tinta + contador em pílula açaí-névoa.
 * ------------------------------------------------------------------ */
export function BandHeader({ label, trailing }: { label: string; trailing?: string }) {
  const { colors } = useTheme()
  const type = useType()
  return (
    <View style={styles.bandHeader}>
      <Text style={[type.headline, { color: colors.ink }]} numberOfLines={1}>
        {label}
      </Text>
      {trailing ? (
        <View style={[styles.countPill, { backgroundColor: colors.primarySoft }]}>
          <Text style={[type.micro, { color: colors.primary }]}>{trailing}</Text>
        </View>
      ) : null}
    </View>
  )
}

/* ------------------------------------------------------------------ *
 * Botão em pílula. Aperto encolhe de leve (0.97) — feedback tátil sem
 * exagero. Desabilitado exige motivo dito por extenso.
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
  const type = useType()
  const isOff = disabled || loading

  const field =
    variant === 'primary'
      ? colors.primary
      : variant === 'destructive'
        ? colors.struck
        : colors.primarySoft

  const fg = variant === 'quiet' ? colors.primary : colors.onPrimary

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
            backgroundColor: isOff
              ? colors.rule
              : pressed && variant === 'primary'
                ? colors.primaryDeep
                : pressed && variant === 'quiet'
                  ? colors.primaryTint
                  : field,
            transform: [{ scale: pressed ? 0.97 : 1 }],
            opacity: pressed && variant === 'destructive' ? 0.85 : 1,
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
 * Campo de formulário. Arredondado, foco em açaí 2px — sem glow.
 * Erro nomeia o problema E a recuperação.
 * ------------------------------------------------------------------ */
export function Field({
  label,
  error,
  style,
  ...inputProps
}: TextInputProps & { label: string; error?: string }) {
  const { colors } = useTheme()
  const type = useType()
  const [focused, setFocused] = React.useState(false)

  const border = error ? colors.struck : focused ? colors.primary : colors.rule

  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={[type.micro, { color: colors.inkMuted, marginBottom: spacing.sm }]}>
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
 * Contador de quantidade em pílula — o elemento que se manipula.
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
  const type = useType()
  const atMax = typeof max === 'number' && value >= max

  return (
    <View
      style={[
        styles.stepper,
        { backgroundColor: value > 0 ? colors.primaryTint : colors.primarySoft },
      ]}
    >
      <Pressable
        onPress={value > 0 ? onDecrease : undefined}
        disabled={value === 0}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Diminuir ${itemName}`}
        style={styles.stepperButton}
      >
        <Text
          style={[type.stepperSign, { color: value === 0 ? colors.inkMuted : colors.primary }]}
        >
          −
        </Text>
      </Pressable>

      <Text
        style={[type.stepperValue, styles.stepperValue, { color: colors.ink }]}
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
        <Text style={[type.stepperSign, { color: atMax ? colors.inkMuted : colors.primary }]}>
          +
        </Text>
      </Pressable>
    </View>
  )
}

/* ------------------------------------------------------------------ *
 * Preço. Sempre tabular e alinhado à direita (Regra do Numeral).
 * ------------------------------------------------------------------ */
export function Price({ value, muted }: { value: number | string; muted?: boolean }) {
  const { colors } = useTheme()
  const type = useType()
  return (
    <Text style={[type.numeral, { color: muted ? colors.inkMuted : colors.ink, textAlign: 'right' }]}>
      {money(value)}
    </Text>
  )
}

/* ------------------------------------------------------------------ *
 * Selo pequeno (esgotado, em breve, estoque baixo).
 * ------------------------------------------------------------------ */
export function Badge({
  label,
  tone = 'neutral',
  block = false,
}: {
  label: string
  tone?: 'accent' | 'struck' | 'neutral'
  /** Ocupa toda a largura disponível, com o texto centralizado. */
  block?: boolean
}) {
  const { colors } = useTheme()
  const type = useType()
  const bg =
    tone === 'accent' ? colors.accent : tone === 'struck' ? colors.struck : colors.primarySoft
  const fg =
    tone === 'accent' ? colors.onAccent : tone === 'struck' ? colors.onPrimary : colors.primary

  return (
    <View style={[styles.badge, block && styles.badgeBlock, { backgroundColor: bg }]}>
      <Text style={[type.micro, { color: fg }, block && styles.badgeBlockText]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  )
}

/* ------------------------------------------------------------------ *
 * Aviso em card tingido. Para o que é verdade mas ainda não funciona
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
  const type = useType()
  const accentColor =
    tone === 'pending' ? colors.pending : tone === 'struck' ? colors.struck : colors.inkMuted

  return (
    <View style={[styles.notice, { backgroundColor: colors.primarySoft }]}>
      <Text style={[type.micro, { color: accentColor, marginBottom: spacing.xs }]}>{label}</Text>
      <Text style={[type.bodySmall, { color: colors.inkMuted }]}>{children}</Text>
    </View>
  )
}

/* ------------------------------------------------------------------ *
 * Estado vazio: um convite para agir, não um beco.
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
  const type = useType()
  return (
    <View style={styles.empty}>
      <Text style={[type.headline, { color: colors.ink, marginBottom: spacing.sm, textAlign: 'center' }]}>
        {title}
      </Text>
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  countPill: {
    minWidth: 28,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  button: {
    minHeight: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  field: {
    minHeight: 52,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
  },
  stepperButton: {
    width: TOUCH_TARGET - 8,
    // 32 de altura visual; o hitSlop de 8 devolve os 48dp de alvo de toque.
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    minWidth: 24,
    textAlign: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  badgeBlock: {
    alignSelf: 'stretch',
    paddingHorizontal: spacing.xs,
  },
  badgeBlockText: {
    width: '100%',
    textAlign: 'center',
  },
  notice: {
    borderRadius: radius.md,
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
