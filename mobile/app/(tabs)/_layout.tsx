import {
  Montserrat_400Regular,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat'
import { Unbounded_700Bold } from '@expo-google-fonts/unbounded'
import * as Font from 'expo-font'
import { Stack } from 'expo-router'
import { useEffect, useState } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from '@/context/AuthProvider'
import { PreferencesProvider } from '@/theme/preferences'
import { useTheme } from '@/theme/useTheme'

/**
 * A troca de aba precisa ser instantânea: sem animação de slide e com o
 * fundo do tema no contêiner da rota — a animação padrão piscava um fundo
 * branco entre telas e doía o olho.
 */
function ThemedStack() {
  const { colors } = useTheme()

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'none',
        contentStyle: { backgroundColor: colors.ground },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Início' }} />
      <Stack.Screen name="login" options={{ title: 'Entrar' }} />
      <Stack.Screen name="produtos" options={{ title: 'Cardápio' }} />
      <Stack.Screen name="register" options={{ title: 'Criar conta' }} />
      <Stack.Screen name="perfil" options={{ title: 'Perfil' }} />
      <Stack.Screen name="carrinho" options={{ title: 'Carrinho' }} />
      <Stack.Screen name="pedidos" options={{ title: 'Pedidos' }} />
    </Stack>
  )
}

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false)

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        // Corpo e interface
        'Montserrat': Montserrat_400Regular,
        'Montserrat-SemiBold': Montserrat_600SemiBold,
        'Montserrat-Bold': Montserrat_700Bold,
        // Voz da marca (wordmark e títulos de tela)
        'Unbounded-Bold': Unbounded_700Bold,
      })
      setFontsLoaded(true)
    }

    loadFonts()
  }, [])

  if (!fontsLoaded) return null

  return (
    <SafeAreaProvider>
      <PreferencesProvider>
        <AuthProvider>
          <ThemedStack />
        </AuthProvider>
      </PreferencesProvider>
    </SafeAreaProvider>
  )
}
