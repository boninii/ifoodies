import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { api } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/theme/useTheme'
import { useType } from '@/theme/preferences'
import { money, radius, shadow, spacing, TOUCH_TARGET } from '@/theme/tokens'
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

type Filter = 'all' | number
type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name']

/** Ícone por categoria, inferido do nome (as categorias vêm da API). */
function categoryIcon(name: string): IconName {
  const n = name.toLowerCase()
  if (n.includes('salgad')) return 'food-croissant'
  if (n.includes('lanche') || n.includes('burg') || n.includes('sanduíche')) return 'hamburger'
  if (n.includes('bebida') || n.includes('suco') || n.includes('café')) return 'cup-outline'
  if (n.includes('doce') || n.includes('sobremesa') || n.includes('bolo')) return 'cupcake'
  return 'tag-outline'
}

/**
 * Painel de filtragem por categoria: abre pelo ícone de filtro no cabeçalho
 * e SOBREPÕE os cards — não rouba largura da lista. Cada categoria tem ícone
 * e rótulo; tocar filtra e fecha.
 */
function CategoryPanel({
  categories,
  selected,
  onSelect,
  onClose,
}: {
  categories: Category[]
  selected: Filter
  onSelect: (f: Filter) => void
  onClose: () => void
}) {
  const { colors } = useTheme()
  const type = useType()

  const items: { key: Filter; label: string; icon: IconName }[] = [
    { key: 'all', label: 'Tudo', icon: 'silverware-variant' },
    ...categories.map((c) => ({ key: c.id as Filter, label: c.name, icon: categoryIcon(c.name) })),
  ]

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Toque fora fecha. */}
      <Pressable
        style={[StyleSheet.absoluteFill, styles.scrim]}
        onPress={onClose}
        accessibilityLabel="Fechar filtro de categorias"
      />

      <View
        style={[styles.panel, { backgroundColor: colors.surface }, shadow.modal]}
      >
        <Text style={[type.eyebrow, { color: colors.inkMuted, marginBottom: spacing.sm }]}>
          Categorias
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {items.map((item) => {
            const active = selected === item.key
            return (
              <Pressable
                key={String(item.key)}
                onPress={() => {
                  onSelect(item.key)
                  onClose()
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Categoria ${item.label}`}
                style={[
                  styles.panelItem,
                  {
                    backgroundColor: active ? colors.primary : 'transparent',
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={20}
                  color={active ? colors.onPrimary : colors.primary}
                />
                <Text
                  style={[type.label, { color: active ? colors.onPrimary : colors.ink, flex: 1 }]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>
    </View>
  )
}

/**
 * Card enxuto: foto, nome, preço e o contador. Descrição e detalhes moram no
 * popup — tocar no card abre. Assim o texto do produto nunca é cortado por
 * falta de espaço.
 */
function ProductCard({
  item,
  quantity,
  onIncrease,
  onDecrease,
  onOpen,
}: {
  item: Product
  quantity: number
  onIncrease: () => void
  onDecrease: () => void
  onOpen: () => void
}) {
  const { colors } = useTheme()
  const type = useType()
  const soldOut = item.quantity <= 0
  const lowStock = !soldOut && item.quantity <= 5

  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`Ver detalhes de ${item.name}`}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.cardBorder },
        soldOut && { opacity: 0.72 },
        pressed && { backgroundColor: colors.primarySoft },
      ]}
    >
      <View style={styles.thumbWrap}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={[styles.thumb, { opacity: soldOut ? 0.35 : 1 }]}
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View style={[styles.thumb, { backgroundColor: colors.primarySoft }]} />
        )}

        {/* O selo mora sobre a foto: empilhado com o preço ele estouraria a
            altura fixa do card. */}
        {soldOut ? (
          <View style={styles.badgeOverlay}>
            <Badge label="Esgotado" tone="struck" block />
          </View>
        ) : lowStock ? (
          <View style={styles.badgeOverlay}>
            <Badge label={`Restam ${item.quantity}`} tone="accent" block />
          </View>
        ) : null}
      </View>

      <View style={styles.cardBody}>
        <Text
          style={[type.title, { color: soldOut ? colors.inkMuted : colors.ink }]}
          numberOfLines={2}
        >
          {item.name}
        </Text>

        <View style={styles.cardBottom}>
          <Price value={item.price} muted={soldOut} />

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
    </Pressable>
  )
}

/** Popup de detalhes: foto grande, descrição inteira, estoque e contador. */
function ProductDetail({
  item,
  quantity,
  onIncrease,
  onDecrease,
  onClose,
}: {
  item: Product | null
  quantity: number
  onIncrease: () => void
  onDecrease: () => void
  onClose: () => void
}) {
  const { colors } = useTheme()
  const type = useType()

  if (!item) return null
  const soldOut = item.quantity <= 0

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose} accessibilityLabel="Fechar detalhes">
        <Pressable
          style={[styles.modalCard, { backgroundColor: colors.surface }, shadow.modal]}
          onPress={() => {}}
        >
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.modalImage} accessibilityIgnoresInvertColors />
          ) : (
            <View style={[styles.modalImage, { backgroundColor: colors.primarySoft }]} />
          )}

          <View style={styles.modalBody}>
            <Text style={[type.headline, { color: colors.ink }]}>{item.name}</Text>

            <Text style={[type.numeralLarge, { color: colors.primary, marginTop: spacing.xs }]}>
              {money(item.price)}
            </Text>

            <Text style={[type.body, { color: colors.inkMuted, marginTop: spacing.md }]}>
              {item.description}
            </Text>

            <View style={styles.modalMeta}>
              {soldOut ? (
                <Badge label="Esgotado" tone="struck" />
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

            <Button label="Fechar" variant="quiet" onPress={onClose} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

export default function Produtos() {
  const { token, isAuthenticated, isLoading } = useAuth()
  const { colors } = useTheme()
  const type = useType()
  const router = useRouter()

  const [categories, setCategories] = useState<Category[]>([])
  const [quantities, setQuantities] = useState<Record<number, number>>({})
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [filter, setFilter] = useState<Filter>('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const [detail, setDetail] = useState<Product | null>(null)

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

  const visible = useMemo(
    () => (filter === 'all' ? categories : categories.filter((c) => c.id === filter)),
    [categories, filter],
  )

  const filtering = filter !== 'all'

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

    return (
      <View style={styles.listArea}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: spacing.xxl * 2 }}
          showsVerticalScrollIndicator={false}
        >
          {visible.map((category) => (
            <View key={category.id}>
              <BandHeader label={category.name} trailing={`${category.products.length}`} />
              {category.products.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  quantity={quantities[item.id] ?? 0}
                  onIncrease={() => increase(item)}
                  onDecrease={() => decrease(item.id)}
                  onOpen={() => setDetail(item)}
                />
              ))}
            </View>
          ))}
        </ScrollView>

        {/* O painel de categorias sobrepõe os cards quando aberto. */}
        {filterOpen ? (
          <CategoryPanel
            categories={categories}
            selected={filter}
            onSelect={setFilter}
            onClose={() => setFilterOpen(false)}
          />
        ) : null}
      </View>
    )
  }

  return (
    <Screen
      title="Cardápio"
      subtitle="Peça agora e retire pronto no balcão."
      scroll={false}
      mastheadExtra={
        <Pressable
          onPress={() => setFilterOpen((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={
            filtering ? 'Filtro de categorias ativo. Abrir filtro' : 'Filtrar por categoria'
          }
          style={[
            styles.filterButton,
            { backgroundColor: filtering ? colors.primary : colors.primarySoft },
          ]}
        >
          <MaterialCommunityIcons
            name="filter-variant"
            size={20}
            color={filtering ? colors.onPrimary : colors.primary}
          />
        </Pressable>
      }
      footer={
        count > 0 ? (
          <Pressable
            onPress={goToCart}
            accessibilityRole="button"
            accessibilityLabel={`Revisar pedido, ${count} itens, total ${money(total)}`}
            style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.97 : 1 }] }, shadow.floating]}
          >
            <LinearGradient
              colors={colors.gradient}
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

      <ProductDetail
        item={detail}
        quantity={detail ? (quantities[detail.id] ?? 0) : 0}
        onIncrease={() => detail && increase(detail)}
        onDecrease={() => detail && decrease(detail.id)}
        onClose={() => setDetail(null)}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  listArea: {
    flex: 1,
  },
  filterButton: {
    width: TOUCH_TARGET - 8,
    height: TOUCH_TARGET - 8,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrim: {
    backgroundColor: 'rgba(15, 21, 13, 0.35)',
  },
  panel: {
    position: 'absolute',
    left: spacing.lg,
    top: spacing.sm,
    bottom: spacing.xl,
    width: 220,
    maxWidth: '80%',
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  panelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: TOUCH_TARGET,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  card: {
    flexDirection: 'row',
    height: 100,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: 10,
    gap: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  /** Quadrada: ocupa a altura útil do card e o mesmo tanto de largura. */
  thumbWrap: {
    height: '100%',
    aspectRatio: 1,
  },
  thumb: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  badgeOverlay: {
    position: 'absolute',
    left: spacing.xs,
    right: spacing.xs,
    bottom: spacing.xs,
  },
  cardBody: {
    flex: 1,
    justifyContent: 'space-between',
    gap: spacing.xs,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 21, 13, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '86%',
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  modalImage: {
    width: '100%',
    height: 180,
  },
  modalBody: {
    padding: spacing.lg,
  },
  modalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
})
