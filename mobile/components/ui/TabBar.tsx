import React from 'react'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { usePathname, useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/theme/useTheme'
import { spacing, TOUCH_TARGET, type } from '@/theme/tokens'
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
 * adivinhação, e o aluno está com pressa. O item ativo ganha um campo verde
 * cheio no topo, citando o bloco preenchido do quadro.
 */
export function TabBar() {
  const { colors } = useTheme()
  const router = useRouter()
  const pathname = usePathname()

  return (
    <View style={{ backgroundColor: colors.surface }}>
      <Rule />
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
                  styles.marker,
                  { backgroundColor: active ? colors.ifGreen : 'transparent' },
                ]}
              />
              <MaterialCommunityIcons
                name={d.icon}
                size={22}
                color={active ? colors.ink : colors.inkMuted}
              />
              <Text
                style={[
                  type.label,
                  {
                    color: active ? colors.ink : colors.inkMuted,
                    fontSize: 10,
                    letterSpacing: 0.4,
                    marginTop: spacing.xs,
                  },
                ]}
                numberOfLines={1}
              >
                {d.label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
  },
  item: {
    flex: 1,
    minHeight: TOUCH_TARGET + 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.sm,
  },
  marker: {
    height: 3,
    alignSelf: 'stretch',
    marginBottom: spacing.sm,
  },
})
