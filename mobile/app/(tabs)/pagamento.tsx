import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import * as Clipboard from 'expo-clipboard'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native'
import { Button, Notice } from '@/components/ui/primitives'
import { Screen } from '@/components/ui/Screen'
import { useAuth } from '@/hooks/useAuth'
import { createPixCharge, getPaymentStatus, type PixCharge } from '@/services/payments'
import { listenToOrders } from '@/services/realtime'
import { useTheme } from '@/theme/useTheme'
import { useType } from '@/theme/preferences'
import { money, radius, spacing } from '@/theme/tokens'

/**
 * Pagamento por Pix.
 *
 * O pedido JÁ EXISTE quando esta tela abre — ela é sobre pagar, não sobre
 * pedir. Por isso sair daqui não cancela nada: o aluno pode fechar e pagar
 * no balcão, e é o que o rodapé diz.
 *
 * A confirmação chega por dois caminhos, de propósito: o WebSocket avisa no
 * instante em que o pedido vira `approved`, e a consulta periódica pergunta
 * direto ao gateway. Um webhook atrasado não deixa ninguém preso na tela.
 */
const POLL_MS = 5000

function useContagem(expiraEm?: string) {
  const [restante, setRestante] = useState<number | null>(null)

  useEffect(() => {
    if (!expiraEm) return
    const alvo = new Date(expiraEm).getTime()
    if (Number.isNaN(alvo)) return

    const tick = () => setRestante(Math.max(0, Math.floor((alvo - Date.now()) / 1000)))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiraEm])

  if (restante === null) return null
  const min = Math.floor(restante / 60)
  const seg = restante % 60
  return `${min}:${String(seg).padStart(2, '0')}`
}

export default function Pagamento() {
  const { order } = useLocalSearchParams<{ order?: string }>()
  const orderId = Number(order)

  const { token, userId, isAuthenticated, isLoading } = useAuth()
  const { colors } = useTheme()
  const type = useType()
  const router = useRouter()

  const [cobranca, setCobranca] = useState<PixCharge | null>(null)
  const [estado, setEstado] = useState<'criando' | 'aguardando' | 'pago' | 'indisponivel'>('criando')
  const [recado, setRecado] = useState('')
  const [copiado, setCopiado] = useState(false)

  const contagem = useContagem(cobranca?.expires_at)
  const pago = useRef(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login')
  }, [isAuthenticated, isLoading, router])

  const confirmar = useCallback(() => {
    if (pago.current) return
    pago.current = true
    setEstado('pago')
  }, [])

  // Cria a cobrança uma vez, assim que a tela abre.
  useEffect(() => {
    if (!token || !Number.isFinite(orderId)) return

    let vivo = true
    createPixCharge(orderId)
      .then(({ ok, status, data }) => {
        if (!vivo) return
        if (ok) {
          setCobranca(data)
          setEstado('aguardando')
          return
        }
        // 503 = integração desligada no servidor. Não é erro do aluno.
        setEstado('indisponivel')
        setRecado(
          status === 503
            ? data?.error ?? 'O pagamento pelo app está indisponível agora.'
            : data?.error ?? 'Não foi possível gerar o Pix deste pedido.',
        )
      })
      .catch(() => {
        if (!vivo) return
        setEstado('indisponivel')
        setRecado('Sem conexão com a cantina. Seu pedido foi registrado — pague no balcão.')
      })

    return () => {
      vivo = false
    }
  }, [token, orderId])

  // Dois caminhos para a confirmação: o empurrão do servidor e a pergunta ao
  // gateway. O que chegar primeiro encerra a espera.
  useEffect(() => {
    if (estado !== 'aguardando' || !token) return

    const assinatura = userId
      ? listenToOrders(userId, token, (evento) => {
          if (evento.id === orderId && evento.status === 'approved') confirmar()
        })
      : null

    const id = setInterval(async () => {
      try {
        const { ok, data } = await getPaymentStatus(orderId)
        if (ok && data?.paid) confirmar()
      } catch {
        // Falha momentânea de rede: a próxima volta tenta de novo.
      }
    }, POLL_MS)

    return () => {
      clearInterval(id)
      assinatura?.unsubscribe()
    }
  }, [estado, token, userId, orderId, confirmar])

  const copiar = async () => {
    if (!cobranca?.brcode) return
    await Clipboard.setStringAsync(cobranca.brcode)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

  const corpo = () => {
    if (estado === 'criando') {
      return (
        <View style={styles.centro}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[type.body, { color: colors.inkMuted, marginTop: spacing.md }]}>
            Gerando seu Pix…
          </Text>
        </View>
      )
    }

    if (estado === 'indisponivel') {
      return (
        <View style={styles.bloco}>
          <Notice label="Pagamento no app indisponível" tone="pending">
            {recado}
          </Notice>
          <Button label="Ver meus pedidos" onPress={() => router.replace('/pedidos')} />
        </View>
      )
    }

    if (estado === 'pago') {
      return (
        <View style={styles.bloco}>
          <View style={[styles.sucesso, { backgroundColor: colors.primarySoft }]}>
            <MaterialCommunityIcons name="check-circle" size={48} color={colors.primary} />
            <Text style={[type.headline, { color: colors.ink, marginTop: spacing.md }]}>
              Pagamento confirmado
            </Text>
            <Text
              style={[type.body, { color: colors.inkMuted, marginTop: spacing.xs, textAlign: 'center' }]}
            >
              A cantina já está com o seu pedido. Acompanhe o preparo na tela de pedidos —
              o código de retirada aparece lá quando ficar pronto.
            </Text>
          </View>
          <Button label="Acompanhar pedido" onPress={() => router.replace('/pedidos')} />
        </View>
      )
    }

    return (
      <View style={styles.bloco}>
        {cobranca?.brcode_base64 ? (
          <View style={[styles.qrCaixa, { backgroundColor: '#FFFFFF', borderColor: colors.rule }]}>
            <Image
              source={{ uri: cobranca.brcode_base64 }}
              style={styles.qr}
              resizeMode="contain"
              accessibilityLabel="QR code do Pix"
            />
          </View>
        ) : null}

        <View style={[styles.codigoCaixa, { backgroundColor: colors.primarySoft }]}>
          <Text style={[type.eyebrow, { color: colors.primary }]}>Pix copia e cola</Text>
          <Text
            style={[type.bodySmall, { color: colors.ink, marginTop: spacing.xs }]}
            numberOfLines={3}
            selectable
          >
            {cobranca?.brcode}
          </Text>
        </View>

        <Button
          label={copiado ? 'Código copiado!' : 'Copiar código Pix'}
          onPress={copiar}
          variant={copiado ? 'quiet' : 'primary'}
        />

        <View style={styles.espera}>
          <ActivityIndicator color={colors.primary} size="small" />
          <Text style={[type.bodySmall, { color: colors.inkMuted, flex: 1 }]}>
            Assim que o banco confirmar, esta tela muda sozinha.
            {contagem ? ` O código expira em ${contagem}.` : ''}
          </Text>
        </View>

        <Text
          style={[type.micro, { color: colors.inkMuted, textAlign: 'center', marginTop: spacing.md }]}
        >
          Se preferir, feche esta tela e pague no balcão — seu pedido já está registrado.
        </Text>
      </View>
    )
  }

  return (
    <Screen
      title="Pagamento"
      subtitle={
        Number.isFinite(orderId)
          ? `Pedido #${String(orderId).padStart(3, '0')}${cobranca ? ` · ${money(cobranca.amount / 100)}` : ''}`
          : 'Pedido não encontrado.'
      }
    >
      {corpo()}
    </Screen>
  )
}

const styles = StyleSheet.create({
  centro: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  bloco: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  qrCaixa: {
    alignSelf: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  qr: {
    width: 220,
    height: 220,
  },
  codigoCaixa: {
    padding: spacing.md,
    borderRadius: radius.sm,
  },
  espera: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  sucesso: {
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: radius.md,
  },
})
