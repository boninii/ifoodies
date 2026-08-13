import { Sora_400Regular, Sora_600SemiBold, Sora_700Bold } from '@expo-google-fonts/sora'
import { Unbounded_700Bold } from '@expo-google-fonts/unbounded'
import * as Font from 'expo-font'
import { Stack } from 'expo-router'
import { useEffect, useState } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from '@/context/AuthProvider'

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false)

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        // Corpo e interface (Sora: geométrica, legível, tabular nos números)
        'Sora': Sora_400Regular,
        'Sora-SemiBold': Sora_600SemiBold,
        'Sora-Bold': Sora_700Bold,
        // Voz da marca (Unbounded: wordmark e títulos de tela)
        'Unbounded-Bold': Unbounded_700Bold,
      })
      setFontsLoaded(true)
    }

    loadFonts()
  }, [])

  if (!fontsLoaded) return null

  return (
    <SafeAreaProvider>
      <AuthProvider>
        {/* As telas desenham o próprio cabeçalho (o "quadro"), então o
            header nativo fica desligado — mas o gesto de voltar do sistema
            continua vivo, que é o que Android e iOS garantem ao usuário. */}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ title: 'Início' }} />
          <Stack.Screen name="login" options={{ title: 'Entrar' }} />
          <Stack.Screen name="produtos" options={{ title: 'Cardápio' }} />
          <Stack.Screen name="register" options={{ title: 'Criar conta' }} />
          <Stack.Screen name="perfil" options={{ title: 'Perfil' }} />
          <Stack.Screen name="carrinho" options={{ title: 'Carrinho' }} />
          <Stack.Screen name="pedidos" options={{ title: 'Pedidos' }} />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  )
}