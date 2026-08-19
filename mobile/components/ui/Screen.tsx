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
import { useType } from '@/theme/preferences'
import { CONTENT_MAX_WIDTH, radius, spacing } from '@/theme/tokens'
import { TabBar } from './TabBar'
import { Wordmark } from './Logo'

/**
 * Shell das telas autenticadas. Respeita safe area nos dois SOs e, em telas
 * largas (web/tablet), centraliza o conteúdo em uma coluna de 600px.
 */
export function Screen({
  title,
  subtitle,
  children,
  footer,
  mastheadExtra,
  scroll = true,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  /** Ação fixa no rodapé, acima da navegação (ex.: enviar pedido). */
  footer?: React.ReactNode
  /** Ação extra no cabeçalho, à direita do título (ex.: filtro). */
  mastheadExtra?: React.ReactNode
  scroll?: boolean
}) {
  const { colors } = useTheme()
  const type = useType()
  const insets = useSafeAreaInsets()

  const body = (
    <View style={[styles.column, !scroll && styles.flex]}>
      <View style={styles.masthead}>
        <View style={styles.mastheadRow}>
          <Text style={[type.display, styles.mastheadTitle, { color: colors.ink }]}>
            {title}
          </Text>
          {mastheadExtra ? <View style={styles.mastheadActions}>{mastheadExtra}</View> : null}
        </View>
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
        barStyle="dark-content"
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
 * Shell das telas de entrada (login e cadastro). O herói é o degradê verde
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
  const type = useType()
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.root, { backgroundColor: colors.ground }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.gradient[0]} />

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
            colors={colors.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.hero, { paddingTop: insets.top + spacing.xxl }]}
          >
            <View style={styles.column}>
              <Wordmark size={30} color={colors.onPrimary} />
              <Text style={[type.headline, { color: colors.onPrimary, marginTop: spacing.xl }]}>
                {title}
              </Text>
              <Text
                style={[
                  type.body,
                  { color: colors.onPrimary, opacity: 0.85, marginTop: spacing.xs },
                ]}
              >
                {tagline}
              </Text>
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
  mastheadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  mastheadTitle: {
    flexShrink: 1,
  },
  mastheadActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  authCardWrap: {
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.xl,
  },
  authCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
})
