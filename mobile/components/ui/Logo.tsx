import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme } from '@/theme/useTheme'
import { brandGradient, radius } from '@/theme/tokens'

/**
 * Marca iFoodies. O gesto-assinatura é o pingo do "i" em manga — presente no
 * wordmark e no símbolo, e ecoado pela trilha de pedido como marcador de
 * etapa atual.
 *
 * `Wordmark` — "iFoodies" por extenso, para heróis e cabeçalhos.
 * `Mark` — o símbolo quadrado "iF" para avatar, favicon e espaços pequenos
 * (a fonte vetorial está em assets/brand/ifoodies-mark.svg).
 */

export function Wordmark({
  size = 28,
  color,
}: {
  size?: number
  /** Cor do texto. Default: tinta do tema (use "#FFFFFF" sobre o degradê). */
  color?: string
}) {
  const { colors } = useTheme()
  const fg = color ?? colors.ink

  return (
    <View style={styles.row} accessibilityRole="image" accessibilityLabel="iFoodies">
      <View>
        {/* O "i" sem pingo (glifo ı) recebe um pingo desenhado, em manga. */}
        <Text
          style={{
            fontFamily: 'Unbounded-Bold',
            fontSize: size,
            lineHeight: Math.round(size * 1.25),
            color: fg,
          }}
        >
          ı
        </Text>
        <View
          style={[
            styles.dot,
            {
              width: Math.max(5, Math.round(size * 0.22)),
              height: Math.max(5, Math.round(size * 0.22)),
              borderRadius: radius.pill,
              backgroundColor: colors.accent,
              top: Math.round(size * 0.08),
            },
          ]}
        />
      </View>
      <Text
        style={{
          fontFamily: 'Unbounded-Bold',
          fontSize: size,
          lineHeight: Math.round(size * 1.25),
          color: fg,
          letterSpacing: -0.5,
        }}
      >
        Foodies
      </Text>
    </View>
  )
}

export function Mark({ size = 44 }: { size?: number }) {
  const { colors } = useTheme()
  const fontSize = Math.round(size * 0.42)

  return (
    <LinearGradient
      colors={brandGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.3),
        alignItems: 'center',
        justifyContent: 'center',
      }}
      accessibilityRole="image"
      accessibilityLabel="Símbolo iFoodies"
    >
      <View style={styles.row}>
        <View>
          <Text
            style={{
              fontFamily: 'Unbounded-Bold',
              fontSize,
              lineHeight: Math.round(fontSize * 1.3),
              color: '#FFFFFF',
            }}
          >
            ı
          </Text>
          <View
            style={[
              styles.dot,
              {
                width: Math.max(3, Math.round(size * 0.1)),
                height: Math.max(3, Math.round(size * 0.1)),
                borderRadius: radius.pill,
                backgroundColor: colors.accent,
                top: Math.round(size * 0.03),
              },
            ]}
          />
        </View>
        <Text
          style={{
            fontFamily: 'Unbounded-Bold',
            fontSize,
            lineHeight: Math.round(fontSize * 1.3),
            color: '#FFFFFF',
          }}
        >
          F
        </Text>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  dot: {
    position: 'absolute',
    alignSelf: 'center',
  },
})
