import React from 'react'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/theme/useTheme'
import { usePreferences } from '@/theme/preferences'
import { radius, spacing } from '@/theme/tokens'

/**
 * Controle fixo de tamanho de letra, presente no cabeçalho de toda tela
 * autenticada: diminuir · voltar ao padrão · aumentar. O "A" do meio mostra
 * o estado e, tocado, restaura o tamanho original.
 */
export function FontSizeControl() {
  const { colors } = useTheme()
  const { fontStep, increaseFont, decreaseFont, resetFont } = usePreferences()

  const atMin = fontStep === 0
  const atMax = fontStep === 2

  return (
    <View
      style={[styles.wrap, { backgroundColor: colors.surface, borderColor: colors.rule }]}
      accessibilityRole="toolbar"
      accessibilityLabel="Tamanho da letra"
    >
      <Pressable
        onPress={atMin ? undefined : decreaseFont}
        disabled={atMin}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="Diminuir letra"
        style={styles.button}
      >
        <MaterialCommunityIcons
          name="format-font-size-decrease"
          size={16}
          color={atMin ? colors.rule : colors.ink}
        />
      </Pressable>

      <Pressable
        onPress={fontStep === 0 ? undefined : resetFont}
        disabled={fontStep === 0}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="Tamanho padrão da letra"
        style={styles.button}
      >
        <Text
          style={{
            fontFamily: 'Montserrat-Bold',
            fontSize: 13,
            color: fontStep === 0 ? colors.inkMuted : colors.primary,
          }}
        >
          A
        </Text>
      </Pressable>

      <Pressable
        onPress={atMax ? undefined : increaseFont}
        disabled={atMax}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="Aumentar letra"
        style={styles.button}
      >
        <MaterialCommunityIcons
          name="format-font-size-increase"
          size={16}
          color={atMax ? colors.rule : colors.ink}
        />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth * 2,
    paddingHorizontal: spacing.xs,
  },
  button: {
    minWidth: 34,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
