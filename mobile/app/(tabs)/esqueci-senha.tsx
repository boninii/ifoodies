import React, { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { api } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/theme/useTheme'
import { useType } from '@/theme/preferences'
import { spacing } from '@/theme/tokens'
import { AuthScreen } from '@/components/ui/Screen'
import { Button, Field, Notice } from '@/components/ui/primitives'

/**
 * Recuperação de senha em duas etapas na mesma tela: pede o e-mail, recebe
 * um código de 6 dígitos e cria a senha nova.
 *
 * É código, e não link: o aluno abre o e-mail no mesmo celular em que o app
 * está aberto, e digitar 6 dígitos é mais simples do que fazer um link
 * voltar para dentro do app.
 */
export default function EsqueciSenha() {
  const [etapa, setEtapa] = useState<'email' | 'codigo'>('email')

  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')

  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [enviando, setEnviando] = useState(false)

  const { login } = useAuth()
  const { colors } = useTheme()
  const type = useType()
  const router = useRouter()

  const pedirCodigo = async () => {
    setErro('')

    if (!email.trim()) {
      setErro('Informe o e-mail da sua conta.')
      return
    }

    setEnviando(true)
    try {
      const { ok } = await api<{ message: string }>('/forgot-password', {
        method: 'POST',
        auth: false,
        body: { email },
      })

      if (ok) {
        setEtapa('codigo')
        setAviso('Se este e-mail estiver cadastrado, o código chegou na caixa de entrada. Ele vale por 15 minutos.')
      } else {
        setErro('Muitas tentativas seguidas. Espere um minuto e tente de novo.')
      }
    } catch {
      setErro('Sem conexão com a cantina. Verifique sua internet e tente de novo.')
    } finally {
      setEnviando(false)
    }
  }

  const redefinir = async () => {
    setErro('')

    if (!codigo.trim() || !senha || !confirmacao) {
      setErro('Preencha o código e a nova senha.')
      return
    }
    if (senha !== confirmacao) {
      setErro('A nova senha e a confirmação estão diferentes. Digite as duas iguais.')
      return
    }

    setEnviando(true)
    try {
      const { ok, data } = await api<{
        token: string
        error?: string
        errors?: Record<string, string[]>
      }>('/reset-password', {
        method: 'POST',
        auth: false,
        body: {
          email,
          code: codigo,
          password: senha,
          password_confirmation: confirmacao,
        },
      })

      if (ok) {
        await login(data.token)
        router.replace('/produtos')
        return
      }

      setErro(data.error ?? data.errors?.password?.[0] ?? 'Não foi possível redefinir a senha.')
    } catch {
      setErro('Sem conexão com a cantina. Verifique sua internet e tente de novo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthScreen
      title="Recuperar acesso"
      tagline={
        etapa === 'email'
          ? 'Informe seu e-mail e a gente manda um código.'
          : 'Digite o código que chegou no e-mail e crie a senha nova.'
      }
    >
      {aviso ? (
        <Notice label="Código enviado" tone="neutral">
          {aviso}
        </Notice>
      ) : null}

      <Field
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        placeholder="voce@aluno.ifsp.edu.br"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={etapa === 'email'}
        error={etapa === 'email' ? erro : undefined}
      />

      {etapa === 'codigo' ? (
        <>
          <Field
            label="Código do e-mail"
            value={codigo}
            onChangeText={setCodigo}
            placeholder="000000"
            keyboardType="number-pad"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={6}
          />

          <Field
            label="Nova senha"
            value={senha}
            onChangeText={setSenha}
            placeholder="Ao menos 8 caracteres"
            secureTextEntry
            revealable
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Field
            label="Confirme a nova senha"
            value={confirmacao}
            onChangeText={setConfirmacao}
            placeholder="Repita a senha"
            secureTextEntry
            revealable
            autoCapitalize="none"
            autoCorrect={false}
            error={erro}
          />
        </>
      ) : null}

      <Button
        label={
          enviando
            ? 'Enviando…'
            : etapa === 'email'
              ? 'Enviar código'
              : 'Redefinir senha'
        }
        onPress={etapa === 'email' ? pedirCodigo : redefinir}
        loading={enviando}
      />

      {etapa === 'codigo' ? (
        <Pressable
          onPress={() => {
            setEtapa('email')
            setAviso('')
            setErro('')
          }}
          hitSlop={8}
          accessibilityRole="button"
          style={styles.voltar}
        >
          <Text style={[type.label, { color: colors.primary }]}>Usar outro e-mail</Text>
        </Pressable>
      ) : null}

      <View style={styles.footer}>
        <Text style={[type.body, { color: colors.inkMuted }]}>Lembrou a senha? </Text>
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
  voltar: {
    alignSelf: 'center',
    minHeight: 44,
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: spacing.xl,
  },
})
