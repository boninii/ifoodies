import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { api } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/theme/useTheme'
import { brandGradient, money, radius, shadow, spacing, type } from '@/theme/tokens'
import { Screen } from '@/components/ui/Screen'
import { Badge, BandHeader, Button, Empty, Price, Stepper } from '@/components/ui/primitives'

interface Product {
  id: number
  name: string
  description: string
  price: number
  image: string
  /** Estoque disponível — o app usa como quantidade máxima selecionável. */
  quantity: number
}

interface Category {
  id: number
  name: string
  products: Product[]
}

const STORAGE_KEY = '@pedido'

/**
 * Card de produto: superfície arredondada sobre o papel lavanda, foto com
 * canto próprio, preço tabular e o contador em pílula. Esgotado rebaixa o
 * card e ganha selo — sem fingir disponibilidade.
 */
function ProductCard({
  item,
  quantity,
  onIncrease,
  onDecrease,
}: {
  item: Product
  quantity: number
  onIncrease: () => void
  onDecrease: () => void
}) {
  const { colors } = useTheme()
  const soldOut = item.quantity <= 0
  const lowStock = !soldOut && item.quantity <= 5

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.rule },
        soldOut && { opacity: 0.72 },
      ]}
      accessibilityLabel={
        soldOut ? `${item.name}, esgotado` : `${item.name}, ${money(item.price)}`
      }
    >
      {item.image ? (
        <Image
          source={{ uri: item.image }}
          style={[styles.thumb, { opacity: soldOut ? 0.35 : 1 }]}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <View style={[styles.thumb, { backgroundColor: colors.primarySoft }]} />
      )}

      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <View style={styles.cardNames}>
            <Text
              style={[type.headline, { color: soldOut ? colors.inkMuted : colors.ink }]}
              numberOfLines={2}
            >
              {item.name}
            </Text>
            <Text
              style={[type.bodySmall, { color: colors.inkMuted, marginTop: 2 }]}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          </View>

          <Price value={item.price} muted={soldOut} />
        </View>

        <View style={styles.cardBottom}>
          {soldOut ? (
            <Badge label="Esgotado" tone="struck" />
          ) : lowStock ? (
            <Badge label={`Só restam ${item.quantity}`} tone="accent" />
          ) : (
            <Text style={[type.micro, { color: colors.inkMuted }]}>
              {item.quantity} disponíveis
            </Text>
          )}

          {soldOut ? null : (
            <Stepper
              value={quantity}
              max={item.quantity}
              itemName={item.name}
              onIncrease={onIncrease}
              onDecrease={onDecrease}
            />
          )}
        </View>
      </View>
    </View>
  )
}

export default function Produtos() {
  const { token, isAuthenticated, isLoading } = useAuth()
  const { colors } = useTheme()
  const router = useRouter()

  const [categories, setCategories] = useState<Category[]>([])
  const [quantities, setQuantities] = useState<Record<number, number>>({})
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login')
  }, [isAuthenticated, isLoading, router])

  const fetchMenu = useCallback(async () => {
    if (!token) return
    setLoadState('loading')
    try {
      const { ok, data } = await api<Category[]>('/menu')
      if (ok && Array.isArray(data)) {
        setCategories(data)
        setLoadState('ready')
      } else {
        setLoadState('error')
      }
    } catch {
      setLoadState('error')
    }
  }, [token])

  useEffect(() => {
    fetchMenu()
  }, [fetchMenu])

  const selected = useMemo(
    () =>
      Object.entries(quantities)
        .filter(([, q]) => q > 0)
        .map(([id, q]) => ({ id: Number(id), quantity: q })),
    [quantities],
  )

  const { count, total } = useMemo(() => {
    const all = categories.flatMap((c) => c.products)
    return selected.reduce(
      (acc, s) => {
        const p = all.find((x) => x.id === s.id)
        return {
          count: acc.count + s.quantity,
          total: acc.total + (p ? Number(p.price) * s.quantity : 0),
        }
      },
      { count: 0, total: 0 },
    )
  }, [selected, categories])

  const increase = (item: Product) =>
    setQuantities((prev) => {
      const current = prev[item.id] ?? 0
      if (current >= item.quantity) return prev
      return { ...prev, [item.id]: current + 1 }
    })

  const decrease = (id: number) =>
    setQuantities((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 0) - 1) }))

  const goToCart = async () => {
    const all = categories.flatMap((c) => c.products)
    const payload = selected.map((s) => {
      const p = all.find((x) => x.id === s.id)
      return {
        id: s.id,
        name: p?.name,
        description: p?.description,
        quantity: s.quantity,
        price: p?.price,
        stock: p?.quantity,
      }
    })

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    router.push('/carrinho')
  }

  const body = () => {
    if (loadState === 'loading') {
      return (
        <View style={styles.state}>
          <Text style={[type.body, { color: colors.inkMuted }]}>Carregando o cardápio…</Text>
        </View>
      )
    }

    if (loadState === 'error') {
      return (
        <Empty
          title="Não deu para carregar"
          body="O cardápio não respondeu. Verifique sua conexão e tente de novo."
          action={<Button label="Tentar de novo" onPress={fetchMenu} />}
        />
      )
    }

    if (!categories.length) {
      return (
        <Empty
          title="Cardápio vazio"
          body="A cantina ainda não publicou itens hoje. Volte daqui a pouco."
        />
      )
    }

    return categories.map((category) => (
      <View key={category.id}>
        <BandHeader label={category.name} trailing={`${category.products.length}`} />
        {category.products.map((item) => (
          <ProductCard
            key={item.id}
            item={item}
            quantity={quantities[item.id] ?? 0}
            onIncrease={() => increase(item)}
            onDecrease={() => decrease(item.id)}
          />
        ))}
      </View>
    ))
  }

  return (
    <Screen
      title="Cardápio"
      subtitle="Peça agora e retire pronto no balcão."
      footer={
        count > 0 ? (
          <Pressable
            onPress={goToCart}
            accessibilityRole="button"
            accessibilityLabel={`Revisar pedido, ${count} itens, total ${money(total)}`}
            style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.97 : 1 }] }, shadow.floating]}
          >
            <LinearGradient
              colors={brandGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cta}
            >
              <Text style={[type.label, { color: colors.onPrimary }]}>
                Revisar {count} {count === 1 ? 'item' : 'itens'}
              </Text>
              <Text style={[type.numeral, { color: colors.onPrimary }]}>{money(total)}</Text>
            </LinearGradient>
          </Pressable>
        ) : null
      }
    >
      {body()}
    </Screen>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  thumb: {
    width: 76,
    height: 76,
    borderRadius: radius.md,
  },
  cardBody: {
    flex: 1,
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cardNames: {
    flex: 1,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cta: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
  },
  state: {
    padding: spacing.xl,
  },
})
