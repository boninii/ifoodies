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
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme/useTheme'
import { brandGradient, CONTENT_MAX_WIDTH, radius, spacing, type } from '@/theme/tokens'
import { TabBar } from './TabBar'
import { Wordmark } from './Logo'

/**
 * Shell das telas autenticadas. Respeita safe area nos dois SOs e, em telas
 * largas (web/tablet), centraliza o conteúdo em uma coluna de 600px — em vez
 * de esticar uma tela de celular.
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
  /** Ação fixa no rodapé, acima da navegação (ex.: enviar pedido). */
  footer?: React.ReactNode
  scroll?: boolean
}) {
  const { colors, scheme } = useTheme()
  const insets = useSafeAreaInsets()

  const body = (
    <View style={styles.column}>
      <View style={styles.masthead}>
        <Text style={[type.display, { color: colors.ink }]}>{title}</Text>
        {subtitle ? (
          <Text style={[type.body, { color: colors.inkMuted, marginTop: spacing.xs }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
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
        <View style={styles.footerWrap} pointerEvents="box-none">
          <View style={[styles.column, styles.footer]}>{footer}</View>
        </View>
      ) : null}

      <TabBar />
      <View style={{ height: insets.bottom, backgroundColor: colors.surface }} />
    </View>
  )
}

/**
 * Shell das telas de entrada (login e cadastro). O herói é o degradê açaí
 * com o wordmark — a marca ocupa a primeira dobra, e o formulário vem num
 * card que sobrepõe o herói.
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
      <StatusBar barStyle="light-content" backgroundColor={brandGradient[0]} />

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
          <LinearGradient
            colors={brandGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.hero, { paddingTop: insets.top + spacing.xxl }]}
          >
            <View style={styles.column}>
              <Wordmark size={30} color="#FFFFFF" />
              <Text style={[type.headline, styles.heroTitle]}>{title}</Text>
              <Text style={[type.body, styles.heroTagline]}>{tagline}</Text>
            </View>
          </LinearGradient>

          {/* O card do formulário morde o herói: a transição marca a passagem
              da marca para a tarefa. */}
          <View style={[styles.column, styles.authCardWrap]}>
            <View style={[styles.authCard, { backgroundColor: colors.surface }]}>{children}</View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  column: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
  },
  masthead: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  footerWrap: {
    width: '100%',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  hero: {
    paddingBottom: spacing.xxl + spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  heroTitle: {
    color: '#FFFFFF',
    marginTop: spacing.xl,
  },
  heroTagline: {
    color: '#FFFFFF',
    opacity: 0.85,
    marginTop: spacing.xs,
  },
  authCardWrap: {
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.xl,
  },
  authCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
})
