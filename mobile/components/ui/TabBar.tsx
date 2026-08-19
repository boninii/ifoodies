import React from 'react'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { usePathname, useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/theme/useTheme'
import { useType } from '@/theme/preferences'
import { CONTENT_MAX_WIDTH, radius, spacing, TOUCH_TARGET } from '@/theme/tokens'
import { Rule } from './primitives'

type Destination = {
  route: '/produtos' | '/carrinho' | '/pedidos' | '/perfil'
  label: string
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']
}

/** Quatro destinos: dentro da faixa 3–5 do Material e 2–5 do tab bar do iOS. */
const DESTINATIONS: Destination[] = [
  { route: '/produtos', label: 'Cardápio', icon: 'silverware-variant' },
  { route: '/carrinho', label: 'Carrinho', icon: 'cart-outline' },
  { route: '/pedidos', label: 'Pedidos', icon: 'receipt-text-outline' },
  { route: '/perfil', label: 'Perfil', icon: 'account-outline' },
]

/**
 * Navegação principal. Cada destino tem rótulo visível — ícone sozinho é
 * adivinhação, e o aluno está com pressa. O item ativo senta numa pílula
 * açaí-névoa, com ícone e rótulo em açaí.
 */
export function TabBar() {
  const { colors } = useTheme()
  const type = useType()
  const router = useRouter()
  const pathname = usePathname()

  return (
    <View style={{ backgroundColor: colors.surface }}>
      <Rule />
      <View style={styles.column}>
        <View style={styles.bar}>
          {DESTINATIONS.map((d) => {
            const active = pathname === d.route

            return (
              <Pressable
                key={d.route}
                onPress={() => router.replace(d.route)}
                accessibilityRole="tab"
                accessibilityLabel={d.label}
                accessibilityState={{ selected: active }}
                style={styles.item}
              >
                <View
                  style={[
                    styles.pill,
                    { backgroundColor: active ? colors.primarySoft : 'transparent' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={d.icon}
                    size={22}
                    color={active ? colors.primary : colors.inkMuted}
                  />
                  <Text
                    style={[
                      type.micro,
                      { color: active ? colors.primary : colors.inkMuted, marginTop: 2 },
                    ]}
                    numberOfLines={1}
                  >
                    {d.label}
                  </Text>
                </View>
              </Pressable>
            )
          })}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  column: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
  },
  bar: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  item: {
    flex: 1,
    minHeight: TOUCH_TARGET + 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    alignItems: 'center',
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: 72,
  },
})
