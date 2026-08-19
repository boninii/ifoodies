import React, { useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import { api } from '@/services/api'
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
  products: OrderProduct[]
}

/** De quanto em quanto tempo a tela busca o status, com pedido em andamento. */
const POLL_INTERVAL_MS = 15000

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
        <View style={[styles.readyBand, { backgroundColor: colors.accent }]}>
          <Text style={[type.label, { color: colors.onAccent }]}>
            Pronto! Retire no balcão
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
  const { token, isAuthenticated, isLoading } = useAuth()
  const { colors } = useTheme()
  const type = useType()
  const router = useRouter()

  const [orders, setOrders] = useState<Order[]>([])
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')

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

  const activeCount = orders.filter(
    (o) => o.status !== 'ready' && o.status !== 'canceled',
  ).length

  // O intervalo é criado uma vez; o ref diz a ele se ainda há o que esperar.
  const hasActive = useRef(false)
  hasActive.current = activeCount > 0

  /**
   * A tela se atualiza sozinha: recarrega ao ganhar foco e, enquanto houver
   * pedido em andamento, repete a cada 15s. Sem pedido ativo não há o que
   * buscar, e fora de foco não gasta bateria nem dados do aluno.
   */
  useFocusEffect(
    useCallback(() => {
      fetchOrders()

      const id = setInterval(() => {
        if (hasActive.current) fetchOrders({ silent: true })
      }, POLL_INTERVAL_MS)

      return () => clearInterval(id)
    }, [fetchOrders]),
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
              Esta tela se atualiza sozinha enquanto você espera.
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
