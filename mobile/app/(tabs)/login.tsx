import React, { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { api } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/theme/useTheme'
import { spacing, type } from '@/theme/tokens'
import { AuthScreen } from '@/components/ui/Screen'
import { Button, Field } from '@/components/ui/primitives'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { login, isAuthenticated, isLoading } = useAuth()
  const { colors } = useTheme()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace('/produtos')
  }, [isAuthenticated, isLoading, router])

  const handleLogin = async () => {
    setError('')

    if (!email.trim() || !password) {
      setError('Preencha e-mail e senha para entrar.')
      return
    }

    setSubmitting(true)
    try {
      const { ok, data } = await api<{ message: string; error: string; token: string }>('/login', {
        method: 'POST',
        auth: false,
        body: { email, password },
      })

      if (ok) {
        await login(data.token)
        router.replace('/produtos')
      } else {
        setError(data.error ?? 'Não foi possível entrar. Confira e-mail e senha.')
      }
    } catch {
      setError('Sem conexão com a cantina. Verifique sua internet e tente de novo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthScreen title="iFoodies" tagline="A cantina do IFSP sem fila.">
      <Field
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        placeholder="voce@aluno.ifsp.edu.br"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="emailAddress"
      />

      <Field
        label="Senha"
        value={password}
        onChangeText={setPassword}
        placeholder="Sua senha"
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="password"
        error={error}
      />

      <Pressable
        onPress={() => setShowPassword((v) => !v)}
        hitSlop={8}
        accessibilityRole="switch"
        accessibilityState={{ checked: showPassword }}
        accessibilityLabel="Mostrar senha"
        style={styles.toggle}
      >
        <Text style={[type.label, { color: colors.greenDeep }]}>
          {showPassword ? 'Ocultar senha' : 'Mostrar senha'}
        </Text>
      </Pressable>

      <Button
        label={submitting ? 'Entrando…' : 'Entrar'}
        onPress={handleLogin}
        loading={submitting}
      />

      <View style={styles.footer}>
        <Text style={[type.body, { color: colors.inkMuted }]}>Ainda não tem conta? </Text>
        <Link href="/register" asChild>
          <Pressable hitSlop={8} accessibilityRole="link">
            <Text style={[type.title, { color: colors.greenDeep }]}>Cadastre-se</Text>
          </Pressable>
        </Link>
      </View>
    </AuthScreen>
  )
}

const styles = StyleSheet.create({
  toggle: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: spacing.xl,
  },
})
