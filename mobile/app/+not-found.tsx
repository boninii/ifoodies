import { Stack, useRouter } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { useTheme } from '@/theme/useTheme'
import { spacing } from '@/theme/tokens'
import { Button, Empty } from '@/components/ui/primitives'

export default function NotFoundScreen() {
  const { colors } = useTheme()
  const router = useRouter()

  return (
    <>
      <Stack.Screen options={{ title: 'Página não encontrada' }} />
      <View style={[styles.container, { backgroundColor: colors.ground }]}>
        <Empty
          title="Esta tela não existe"
          body="O endereço que você abriu não faz parte do app."
          action={<Button label="Ir para o cardápio" onPress={() => router.replace('/produtos')} />}
        />
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
})
