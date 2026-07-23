import {
  ElmsSans_400Regular,
  ElmsSans_500Medium,
  ElmsSans_600SemiBold,
  ElmsSans_700Bold,
} from '@expo-google-fonts/elms-sans'
import { Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces'
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
        // Sans de texto (corpo, labels, botões)
        'ElmsSans': ElmsSans_400Regular,
        'ElmsSans-Medium': ElmsSans_500Medium,
        'ElmsSans-SemiBold': ElmsSans_600SemiBold,
        'ElmsSans-Bold': ElmsSans_700Bold,
        // Serif de marca (títulos, categorias e nomes de produto)
        'Fraunces': Fraunces_600SemiBold,
        'Fraunces-Bold': Fraunces_700Bold,
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