import React, { useEffect, useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { api } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/theme/useTheme'
import { usePreferences, useType, type ThemePreference } from '@/theme/preferences'
import { radius, spacing } from '@/theme/tokens'
import { Screen } from '@/components/ui/Screen'
import { BandHeader, Button, Field } from '@/components/ui/primitives'

type Profile = { name: string; email: string; student_id: string }

export default function Perfil() {
  const { logout, token, isAuthenticated, isLoading } = useAuth()
  const { colors } = useTheme()
  const type = useType()
  const { themePreference, setThemePreference } = usePreferences()
  const router = useRouter()

  const THEME_OPTIONS: { key: ThemePreference; label: string }[] = [
    { key: 'light', label: 'Claro' },
    { key: 'dark', label: 'Escuro' },
    { key: 'system', label: 'Sistema' },
  ]

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [studentId, setStudentId] = useState('')
  const [saving, setSaving] = useState(false)

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [changing, setChanging] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login')
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (!token) return
    let alive = true
    api<Profile>('/profile')
      .then(({ ok, data }) => {
        if (!alive || !ok) return
        setName(data.name ?? '')
        setEmail(data.email ?? '')
        setStudentId(data.student_id ?? '')
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [token])

  const save = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Faltou preencher', 'Nome e e-mail não podem ficar vazios.')
      return
    }

    setSaving(true)
    try {
      const { ok, data } = await api<{ success: string }>('/profile', {
        method: 'PATCH',
        body: { name, email },
      })
      Alert.alert(
        ok ? 'Salvo' : 'Não deu para salvar',
        ok ? data.success : 'Confira os dados e tente de novo.',
      )
    } catch {
      Alert.alert('Sem conexão', 'Não foi possível falar com o servidor.')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    setPasswordError('')

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('Preencha os três campos para trocar a senha.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('A nova senha e a confirmação estão diferentes. Digite as duas iguais.')
      return
    }

    setChanging(true)
    try {
      const { ok } = await api('/profile/change-password', {
        method: 'POST',
        body: {
          old_password: oldPassword,
          password: newPassword,
          password_confirmation: confirmPassword,
        },
      })

      if (ok) {
        setOldPassword('')
        setNewPassword('')
        setConfirmPassword('')
        Alert.alert('Senha atualizada', 'Use a senha nova no próximo login.')
      } else {
        setPasswordError('A senha atual não confere. Tente novamente.')
      }
    } catch {
      setPasswordError('Sem conexão com o servidor. Tente de novo.')
    } finally {
      setChanging(false)
    }
  }

  const signOut = async () => {
    await logout()
    router.replace('/login')
  }

  return (
    <Screen title="Perfil" subtitle="Seus dados na cantina.">
      <BandHeader label="Identificação" />

      <View style={[styles.block, { backgroundColor: colors.surface, borderColor: colors.rule }]}>
        {/* O prontuário identifica o aluno na retirada — é código, não campo. */}
        <View style={[styles.prontuario, { backgroundColor: colors.primarySoft }]}>
          <Text style={[type.micro, { color: colors.primary }]}>Prontuário</Text>
          <Text style={[type.numeralLarge, { color: colors.ink, marginTop: spacing.xs }]}>
            {studentId || '—'}
          </Text>
          <Text style={[type.bodySmall, { color: colors.inkMuted, marginTop: spacing.xs }]}>
            Informe no balcão ao retirar. Não pode ser alterado pelo app.
          </Text>
        </View>
      </View>

      <BandHeader label="Dados" />

      <View style={[styles.block, { backgroundColor: colors.surface, borderColor: colors.rule }]}>
        <Field
          label="Nome"
          value={name}
          onChangeText={setName}
          placeholder="Seu nome completo"
          autoCapitalize="words"
          autoCorrect={false}
        />
        <Field
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          placeholder="voce@exemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Button
          label={saving ? 'Salvando…' : 'Salvar dados'}
          onPress={save}
          loading={saving}
        />
      </View>

      <BandHeader label="Senha" />

      <View style={[styles.block, { backgroundColor: colors.surface, borderColor: colors.rule }]}>
        <Field
          label="Senha atual"
          value={oldPassword}
          onChangeText={setOldPassword}
          placeholder="Sua senha de hoje"
          secureTextEntry
          autoCapitalize="none"
        />
        <Field
          label="Nova senha"
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Ao menos 6 caracteres"
          secureTextEntry
          autoCapitalize="none"
        />
        <Field
          label="Confirmar nova senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Repita a nova senha"
          secureTextEntry
          autoCapitalize="none"
          error={passwordError}
        />
        <Button
          label={changing ? 'Atualizando…' : 'Atualizar senha'}
          variant="quiet"
          onPress={changePassword}
          loading={changing}
        />
      </View>

      <BandHeader label="Aparência" />

      <View style={[styles.block, { backgroundColor: colors.surface, borderColor: colors.rule }]}>
        <Text style={[type.micro, { color: colors.inkMuted, marginBottom: spacing.sm }]}>
          Tema
        </Text>
        <View style={styles.themeRow}>
          {THEME_OPTIONS.map((opt) => {
            const active = themePreference === opt.key
            return (
              <Pressable
                key={opt.key}
                onPress={() => setThemePreference(opt.key)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Tema ${opt.label}`}
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: active ? colors.primary : colors.rule,
                  },
                ]}
              >
                <Text style={[type.label, { color: active ? colors.onPrimary : colors.ink }]}>
                  {opt.label}
                </Text>
              </Pressable>
            )
          })}
        </View>
        <Text style={[type.bodySmall, { color: colors.inkMuted, marginTop: spacing.sm }]}>
          O app abre no tema claro. "Sistema" segue a configuração do aparelho.
        </Text>
      </View>

      <View style={styles.exit}>
        <Button label="Sair da conta" variant="destructive" onPress={signOut} />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  block: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  prontuario: {
    padding: spacing.lg,
    borderRadius: radius.md,
  },
  themeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  themeOption: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exit: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
})
