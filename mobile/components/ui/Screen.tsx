import React from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme/useTheme'
import { spacing, type } from '@/theme/tokens'
import { TabBar } from './TabBar'
import { Rule } from './primitives'

/**
 * Shell das telas autenticadas. Respeita safe area nos dois SOs (notch,
 * Dynamic Island, barra de gestos) e mantém a lista sangrando de ponta a
 * ponta — sem margem lateral, como um quadro afixado na parede.
 */
export function Screen({
  title,
  subtitle,
  children,
  footer,
  scroll = true,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  /** Ação fixa no rodapé, acima da navegação (ex.: finalizar pedido). */
  footer?: React.ReactNode
  scroll?: boolean
}) {
  const { colors, scheme } = useTheme()
  const insets = useSafeAreaInsets()

  const body = (
    <>
      <View style={styles.masthead}>
        <Text style={[type.display, { color: colors.ink }]}>{title}</Text>
        {subtitle ? (
          <Text style={[type.body, { color: colors.inkMuted, marginTop: spacing.xs }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {children}
    </>
  )

  return (
    <View style={[styles.root, { backgroundColor: colors.ground, paddingTop: insets.top }]}>
      <StatusBar
        barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.ground}
      />

      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={{ paddingBottom: spacing.xxl }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {body}
        </ScrollView>
      ) : (
        <View style={styles.flex}>{body}</View>
      )}

      {footer ? (
        <View style={{ backgroundColor: colors.ground }}>
          <Rule />
          <View style={styles.footer}>{footer}</View>
        </View>
      ) : null}

      <TabBar />
      <View style={{ height: insets.bottom, backgroundColor: colors.surface }} />
    </View>
  )
}

/**
 * Shell das telas de entrada (login e cadastro). Sem navegação — quem não
 * está autenticado não tem para onde ir. O campo verde no topo é a marca
 * ocupando região inteira, não um logo solto num fundo branco.
 */
export function AuthScreen({
  title,
  tagline,
  children,
}: {
  title: string
  tagline: string
  children: React.ReactNode
}) {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.root, { backgroundColor: colors.ground }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.greenDeep} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.authMasthead,
              { backgroundColor: colors.greenDeep, paddingTop: insets.top + spacing.xxl },
            ]}
          >
            <Text style={[type.display, { color: colors.onGreen }]}>{title}</Text>
            <Text style={[type.body, { color: colors.onGreen, marginTop: spacing.sm, opacity: 0.9 }]}>
              {tagline}
            </Text>
          </View>

          <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.xl }}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  authMasthead: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  masthead: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
})
