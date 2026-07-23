import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { useFocusEffect, useRouter } from 'expo-router'
import { api } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/theme/useTheme'
import { money, spacing, type } from '@/theme/tokens'
import { Screen } from '@/components/ui/Screen'
import { BandHeader, Button, Empty, Notice, Price, Rule, Stepper } from '@/components/ui/primitives'

// Mesma chave usada pelo cardápio: uma única fonte de verdade do carrinho.
const STORAGE_KEY = '@pedido'

type CartProduct = {
  id: number
  name: string
  description?: string
  quantity: number
  price: number
  /** Estoque no momento em que o item entrou no carrinho. */
  stock: number
}

/** Formas de pagamento desenhadas, porém ainda sem integração no backend. */
const PAYMENT_METHODS = [
  { key: 'pix', label: 'Pix', icon: 'qrcode' as const },
  { key: 'card', label: 'Cartão', icon: 'credit-card-outline' as const },
]

export default function Carrinho() {
  const { isAuthenticated, isLoading } = useAuth()
  const { colors } = useTheme()
  const router = useRouter()

  const [products, setProducts] = useState<CartProduct[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login')
  }, [isAuthenticated, isLoading, router])

  // Recarrega ao focar: o aluno pode ter mexido no cardápio e voltado.
  useFocusEffect(
    useCallback(() => {
      let alive = true
      AsyncStorage.getItem(STORAGE_KEY)
        .then((stored) => {
          if (alive && stored) setProducts(JSON.parse(stored))
        })
        .catch(() => {})
      return () => {
        alive = false
      }
    }, []),
  )

  const persist = async (next: CartProduct[]) => {
    setProducts(next)
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Falha de storage não deve derrubar a tela; o estado em memória segue.
    }
  }

  const changeQuantity = (id: number, delta: number) => {
    const next = products.map((p) => {
      if (p.id !== id) return p
      const q = p.quantity + delta
      if (q < 1) return p
      if (q > p.stock) return p
      return { ...p, quantity: q }
    })
    persist(next)
  }

  const remove = (id: number) => persist(products.filter((p) => p.id !== id))

  const { count, total } = useMemo(
    () =>
      products.reduce(
        (acc, p) => ({
          count: acc.count + p.quantity,
          total: acc.total + Number(p.price) * p.quantity,
        }),
        { count: 0, total: 0 },
      ),
    [products],
  )

  const submit = async () => {
    setSubmitting(true)
    try {
      const body = { products: products.map((p) => ({ id: p.id, quantity: p.quantity })) }
      const { ok } = await api('/orders', { method: 'POST', body })

      if (ok) {
        await AsyncStorage.removeItem(STORAGE_KEY)
        setProducts([])
        router.replace('/pedidos')
      } else {
        Alert.alert(
          'Pedido não enviado',
          'Algum item pode ter esgotado enquanto você escolhia. Volte ao cardápio e confira.',
        )
      }
    } catch {
      Alert.alert('Sem conexão', 'Não foi possível falar com a cantina. Tente de novo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!products.length) {
    return (
      <Screen title="Carrinho">
        <Empty
          title="Nada selecionado"
          body="Escolha itens no cardápio e eles aparecem aqui para revisão."
          action={<Button label="Ver cardápio" onPress={() => router.replace('/produtos')} />}
        />
      </Screen>
    )
  }

  return (
    <Screen
      title="Carrinho"
      subtitle="Revise antes de enviar para a cantina."
      footer={
        <Button
          label={submitting ? 'Enviando…' : 'Enviar pedido'}
          onPress={submit}
          loading={submitting}
          accessibilityLabel={`Enviar pedido de ${count} itens, total ${money(total)}`}
        />
      }
    >
      <BandHeader label="Itens" trailing={`${count}`} />

      {products.map((item, i) => (
        <View key={item.id}>
          {i > 0 ? <Rule inset={spacing.lg} /> : null}

          <View style={[styles.row, { backgroundColor: colors.surface }]}>
            <View style={styles.rowTop}>
              <Text style={[type.headline, { color: colors.ink, flex: 1 }]} numberOfLines={2}>
                {item.name}
              </Text>
              <Price value={Number(item.price) * item.quantity} />
            </View>

            <View style={styles.rowBottom}>
              <Stepper
                value={item.quantity}
                max={item.stock}
                itemName={item.name}
                onIncrease={() => changeQuantity(item.id, 1)}
                onDecrease={() => changeQuantity(item.id, -1)}
              />

              <Pressable
                onPress={() => remove(item.id)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={`Remover ${item.name}`}
                style={styles.remove}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.struck} />
                <Text style={[type.label, { color: colors.struck }]}>Remover</Text>
              </Pressable>
            </View>

            {item.quantity >= item.stock ? (
              <Text style={[type.bodySmall, { color: colors.pending, marginTop: spacing.sm }]}>
                Você já pegou tudo o que resta deste item.
              </Text>
            ) : null}
          </View>
        </View>
      ))}

      {/* Linha somatória: lida como o rodapé de uma tabela, não como card. */}
      <View style={[styles.sum, { backgroundColor: colors.greenWash }]}>
        <Text style={[type.title, { color: colors.ink }]}>Total</Text>
        <Text style={[type.numeralLarge, { color: colors.ink }]}>{money(total)}</Text>
      </View>

      <BandHeader label="Pagamento" />

      <View style={[styles.payment, { backgroundColor: colors.surface }]}>
        <View style={styles.methods}>
          {PAYMENT_METHODS.map((m) => (
            <View
              key={m.key}
              // Desenhado, mas explicitamente inativo: não é um botão.
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={[styles.method, { borderColor: colors.rule }]}
            >
              <MaterialCommunityIcons name={m.icon} size={22} color={colors.inkMuted} />
              <Text style={[type.label, { color: colors.inkMuted }]}>{m.label}</Text>
            </View>
          ))}
        </View>

        <Notice label="Em breve">
          Pagar pelo app ainda não está disponível. Por enquanto, envie o pedido e pague no
          balcão ao retirar.
        </Notice>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  remove: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.sm,
  },
  sum: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginTop: spacing.xs,
  },
  payment: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  methods: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  method: {
    flex: 1,
    minHeight: 56,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    opacity: 0.55,
  },
})
