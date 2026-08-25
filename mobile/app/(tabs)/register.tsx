import React, { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { api } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/theme/useTheme'
import { useType } from '@/theme/preferences'
import { spacing } from '@/theme/tokens'
import { AuthScreen } from '@/components/ui/Screen'
import { Button, Field } from '@/components/ui/primitives'

type FieldErrors = {
  name?: string
  email?: string
  student_id?: string
  password?: string
  general?: string
}

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [studentId, setStudentId] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const { login, isAuthenticated, isLoading } = useAuth()
  const { colors } = useTheme()
  const type = useType()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace('/produtos')
  }, [isAuthenticated, isLoading, router])

  const handleRegister = async () => {
    setErrors({})

    const missing: FieldErrors = {}
    if (!name.trim()) missing.name = 'Informe seu nome.'
    if (!email.trim()) missing.email = 'Informe seu e-mail.'
    if (!studentId.trim()) missing.student_id = 'Informe seu prontuário.'
    if (!password) missing.password = 'Crie uma senha de ao menos 8 caracteres.'

    if (Object.keys(missing).length) {
      setErrors(missing)
      return
    }

    setSubmitting(true)
    try {
      const { ok, data } = await api<{
        message: string
        token: string
        errors?: Record<string, string[]>
      }>('/register', {
        method: 'POST',
        auth: false,
        body: {
          name,
          email,
          student_id: studentId,
          password,
          password_confirmation: password,
        },
      })

      if (ok) {
        await login(data.token)
        router.replace('/produtos')
        return
      }

      // A API devolve os erros por campo; cada um volta ao seu próprio campo
      // em vez de virar um alerta genérico.
      const apiErrors = data.errors ?? {}
      setErrors({
        name: apiErrors.name?.[0],
        email: apiErrors.email?.[0],
        student_id: apiErrors.student_id?.[0],
        password: apiErrors.password?.[0],
        general: Object.keys(apiErrors).length ? undefined : 'Não foi possível concluir o cadastro.',
      })
    } catch {
      setErrors({ general: 'Sem conexão com a cantina. Verifique sua internet e tente de novo.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthScreen title="Bora furar a fila" tagline="Crie a conta com seu prontuário — é ele que identifica você na retirada.">
      <Field
        label="Nome"
        value={name}
        onChangeText={setName}
        placeholder="Seu nome completo"
        autoCapitalize="words"
        autoCorrect={false}
        error={errors.name}
      />

      <Field
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        placeholder="voce@aluno.ifsp.edu.br"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        error={errors.email}
      />

      <Field
        label="Prontuário"
        value={studentId}
        onChangeText={setStudentId}
        placeholder="SP0000000"
        autoCapitalize="characters"
        autoCorrect={false}
        error={errors.student_id}
      />

      <Field
        label="Senha"
        value={password}
        onChangeText={setPassword}
        placeholder="Ao menos 8 caracteres"
        secureTextEntry
        revealable
        autoCapitalize="none"
        autoCorrect={false}
        error={errors.password}
      />

      {errors.general ? (
        <Text style={[type.bodySmall, { color: colors.struck, marginBottom: spacing.md }]}>
          {errors.general}
        </Text>
      ) : null}

      <Button
        label={submitting ? 'Criando…' : 'Criar conta'}
        onPress={handleRegister}
        loading={submitting}
      />

      <View style={styles.footer}>
        <Text style={[type.body, { color: colors.inkMuted }]}>Já tem conta? </Text>
        <Link href="/login" asChild>
          <Pressable hitSlop={8} accessibilityRole="link">
            <Text style={[type.title, { color: colors.primary }]}>Entrar</Text>
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
