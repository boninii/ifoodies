import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { useFocusEffect, useRouter } from 'expo-router'
import { api } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/theme/useTheme'
import { useType } from '@/theme/preferences'
import { money, radius, spacing } from '@/theme/tokens'
import { Screen } from '@/components/ui/Screen'
import { BandHeader, Button, Empty, Notice, Price, Stepper } from '@/components/ui/primitives'

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
  const type = useType()
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

      {products.map((item) => (
        <View key={item.id}>
          <View style={[styles.row, { backgroundColor: colors.surface }]}>
            <View style={styles.rowTop}>
              <Text style={[type.title, { color: colors.ink, flex: 1 }]} numberOfLines={2}>
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

              {/* Só a lixeira: o rótulo vive no accessibilityLabel, então
                  leitor de tela continua anunciando qual item é removido. */}
              <Pressable
                onPress={() => remove(item.id)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={`Remover ${item.name}`}
                style={styles.remove}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.struck} />
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

      {/* Card somatório: o total ganha destaque açaí-névoa com numeral grande. */}
      <View style={[styles.sum, { backgroundColor: colors.primarySoft }]}>
        <Text style={[type.title, { color: colors.ink }]}>Total</Text>
        <Text style={[type.numeralLarge, { color: colors.primary }]}>{money(total)}</Text>
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
          O pagamento por Pix dentro do app está chegando. Por enquanto, envie o pedido e
          pague no balcão ao retirar.
        </Notice>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  row: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    gap: spacing.md,
    borderRadius: radius.sm,
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
    // Alinha com a altura do contador; o hitSlop de 12 mantém o alvo de toque.
    minHeight: 32,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sum: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.sm,
  },
  payment: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    gap: spacing.lg,
    borderRadius: radius.sm,
  },
  methods: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  method: {
    flex: 1,
    minHeight: 56,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    opacity: 0.55,
  },
})
