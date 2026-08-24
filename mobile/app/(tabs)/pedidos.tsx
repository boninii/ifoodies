import React, { useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import { api } from '@/services/api'
import { listenToOrders } from '@/services/realtime'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/theme/useTheme'
import { useType } from '@/theme/preferences'
import { money, radius, spacing } from '@/theme/tokens'
import { Screen } from '@/components/ui/Screen'
import { BandHeader, Button, Empty } from '@/components/ui/primitives'
import { StatusTrack } from '@/components/ui/StatusTrack'

interface OrderProduct {
  id: number
  name: string
  pivot: {
    quantity: number
    value_unitary: string
  }
}

interface Order {
  id: number
  total_value: string
  status: string
  created_at: string
  pickup_code: string | null
  delivered_at: string | null
  products: OrderProduct[]
}

/**
 * Rede de segurança do tempo real.
 *
 * Com o WebSocket ligado, o servidor avisa na hora e não há por que ficar
 * perguntando — daí o intervalo longo. Sem ele (socket caiu, servidor
 * Reverb fora do ar), a tela volta a sondar de perto para não deixar o
 * aluno sem saber que o lanche ficou pronto.
 */
const POLL_WITH_SOCKET_MS = 60000
const POLL_WITHOUT_SOCKET_MS = 15000

/** Estados em que o pedido ainda exige atenção do aluno. */
const ACTIVE = (status: string) => status !== 'delivered' && status !== 'canceled'

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

/**
 * Card de pedido: código e total no topo, a trilha abaixo e os itens como
 * sub-linhas. Quando fica pronto, o card ganha a faixa verde-folha — o
 * momento de celebração, com o texto legível por cima.
 */
function OrderBand({ order }: { order: Order }) {
  const { colors } = useTheme()
  const type = useType()
  const ready = order.status === 'ready'
  const delivered = order.status === 'delivered'

  return (
    <View
      style={[
        styles.order,
        { backgroundColor: colors.surface },
        ready && { borderWidth: 2, borderColor: colors.accent },
      ]}
    >
      <View style={styles.orderTop}>
        <View>
          <Text style={[type.eyebrow, { color: colors.inkMuted }]}>Pedido</Text>
          <Text style={[type.numeralLarge, { color: colors.ink }]}>
            #{String(order.id).padStart(3, '0')}
          </Text>
        </View>

        <View style={styles.orderMeta}>
          <Text style={[type.micro, { color: colors.inkMuted }]}>
            {formatDate(order.created_at)} · {formatTime(order.created_at)}
          </Text>
          <Text style={[type.numeralLarge, { color: colors.ink, marginTop: 2 }]}>
            {money(order.total_value)}
          </Text>
        </View>
      </View>

      {ready ? (
        <>
          <View style={[styles.readyBand, { backgroundColor: colors.accent }]}>
            <Text style={[type.label, { color: colors.onAccent }]}>
              Pronto! Retire no balcão
            </Text>
          </View>

          {/* O código é a prova de que o pedido é seu. O prontuário não
              serve: qualquer colega sabe o dos outros. */}
          {order.pickup_code ? (
            <View
              style={[
                styles.codeBox,
                { backgroundColor: colors.primarySoft, borderColor: colors.primary },
              ]}
            >
              <Text style={[type.eyebrow, { color: colors.primary }]}>Código de retirada</Text>
              <Text
                style={[type.numeralLarge, styles.code, { color: colors.ink }]}
                accessibilityLabel={`Código de retirada: ${order.pickup_code.split('').join(' ')}`}
              >
                {order.pickup_code}
              </Text>
              <Text style={[type.bodySmall, { color: colors.inkMuted }]}>
                Mostre este código no balcão. Ele vale uma vez só.
              </Text>
            </View>
          ) : null}
        </>
      ) : null}

      {delivered && order.delivered_at ? (
        <View style={[styles.deliveredBand, { backgroundColor: colors.primarySoft }]}>
          <Text style={[type.label, { color: colors.primaryDeep }]}>
            Retirado em {formatDate(order.delivered_at)} às {formatTime(order.delivered_at)}
          </Text>
        </View>
      ) : null}

      <StatusTrack status={order.status} />

      <View style={styles.items}>
        {order.products.map((p) => (
          <View key={p.id} style={styles.item}>
            <Text style={[type.numeral, { color: colors.inkMuted, minWidth: 28 }]}>
              {p.pivot.quantity}×
            </Text>
            <Text style={[type.body, { color: colors.ink, flex: 1 }]} numberOfLines={1}>
              {p.name}
            </Text>
            <Text style={[type.numeral, { color: colors.inkMuted }]}>
              {money(p.pivot.value_unitary)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}

export default function Pedidos() {
  const { token, userId, isAuthenticated, isLoading } = useAuth()
  const { colors } = useTheme()
  const type = useType()
  const router = useRouter()

  const [orders, setOrders] = useState<Order[]>([])
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [live, setLive] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login')
  }, [isAuthenticated, isLoading, router])

  /**
   * `silent` = recarga de fundo: não pisca o estado de carregando nem
   * derruba a lista por uma falha momentânea de rede.
   */
  const fetchOrders = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!token) return
      if (!opts?.silent) setLoadState('loading')
      try {
        const { ok, data } = await api<{ orders: Order[] }>('/orders/user')
        if (ok && Array.isArray(data?.orders)) {
          setOrders(data.orders)
          setLoadState('ready')
        } else if (!opts?.silent) {
          setLoadState('error')
        }
      } catch {
        if (!opts?.silent) setLoadState('error')
      }
    },
    [token],
  )

  const activeCount = orders.filter((o) => ACTIVE(o.status)).length

  // O intervalo é criado uma vez; o ref diz a ele se ainda há o que esperar.
  const hasActive = useRef(false)
  hasActive.current = activeCount > 0

  /**
   * Enquanto a tela está aberta, o servidor empurra cada mudança de status
   * pelo WebSocket. A sondagem periódica continua existindo só como reserva.
   */
  useFocusEffect(
    useCallback(() => {
      fetchOrders()

      const subscription =
        token && userId
          ? listenToOrders(userId, token, (event) => {
              setOrders((prev) => {
                const conhecido = prev.some((o) => o.id === event.id)

                // Pedido que a tela ainda não tinha (feito em outro
                // aparelho): busca a lista inteira em vez de inventar.
                if (!conhecido) {
                  fetchOrders({ silent: true })
                  return prev
                }

                return prev.map((o) =>
                  o.id === event.id
                    ? {
                        ...o,
                        status: event.status,
                        pickup_code: event.pickup_code,
                        delivered_at: event.delivered_at,
                      }
                    : o,
                )
              })
            })
          : null

      setLive(!!subscription)

      const id = setInterval(
        () => {
          if (hasActive.current) fetchOrders({ silent: true })
        },
        subscription ? POLL_WITH_SOCKET_MS : POLL_WITHOUT_SOCKET_MS,
      )

      return () => {
        clearInterval(id)
        subscription?.unsubscribe()
        setLive(false)
      }
    }, [fetchOrders, token, userId]),
  )

  const body = () => {
    if (loadState === 'loading') {
      return (
        <View style={styles.state}>
          <Text style={[type.body, { color: colors.inkMuted }]}>Carregando seus pedidos…</Text>
        </View>
      )
    }

    if (loadState === 'error') {
      return (
        <Empty
          title="Não deu para carregar"
          body="Seus pedidos não responderam. Verifique a conexão e tente de novo."
          action={<Button label="Tentar de novo" onPress={fetchOrders} />}
        />
      )
    }

    if (!orders.length) {
      return (
        <Empty
          title="Nenhum pedido ainda"
          body="Quando você enviar um pedido, ele aparece aqui com o status até ficar pronto."
          action={<Button label="Ver cardápio" onPress={() => router.replace('/produtos')} />}
        />
      )
    }

    return (
      <>
        <BandHeader
          label={activeCount ? 'Em andamento' : 'Histórico'}
          trailing={`${orders.length}`}
        />
        {orders.map((order) => (
          <OrderBand key={order.id} order={order} />
        ))}

        {activeCount ? (
          <View style={styles.foot}>
            <Text style={[type.bodySmall, { color: colors.inkMuted }]}>
              {live
                ? 'A cantina avisa aqui na hora em que o status mudar.'
                : 'Esta tela se atualiza sozinha enquanto você espera.'}
            </Text>
          </View>
        ) : null}
      </>
    )
  }

  return (
    <Screen
      title="Pedidos"
      subtitle={
        activeCount
          ? `${activeCount} em andamento agora.`
          : 'Seu histórico de retiradas na cantina.'
      }
    >
      {body()}
    </Screen>
  )
}

const styles = StyleSheet.create({
  order: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderMeta: {
    alignItems: 'flex-end',
  },
  readyBand: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  codeBox: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  code: {
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: 6,
    marginVertical: spacing.xs,
  },
  deliveredBand: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  items: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  state: {
    padding: spacing.xl,
  },
  foot: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
})
