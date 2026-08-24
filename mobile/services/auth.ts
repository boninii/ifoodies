import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

/**
 * Onde o token de acesso mora.
 *
 * No aparelho ele vai para o armazenamento seguro do sistema (Keychain no
 * iOS, Keystore no Android) — antes ficava em texto puro no AsyncStorage,
 * legível por qualquer um com acesso ao sistema de arquivos do app.
 *
 * Na web o SecureStore não existe; lá o AsyncStorage (localStorage) segue
 * sendo o único caminho, e a versão web é de desenvolvimento mesmo.
 */
const TOKEN_KEY = 'ifoodies_token'

/** Chave antiga, em texto puro. Só existe para migrar quem já estava logado. */
const LEGACY_KEY = 'token'

const secureAvailable = Platform.OS !== 'web'

export const saveToken = async (token: string) => {
  try {
    if (secureAvailable) {
      await SecureStore.setItemAsync(TOKEN_KEY, token)
      return
    }
    await AsyncStorage.setItem(TOKEN_KEY, token)
  }
  catch (error) {
    console.error('Erro ao salvar token:', error)
  }
}

export const getToken = async (): Promise<string | null> => {
  try {
    const token = secureAvailable
      ? await SecureStore.getItemAsync(TOKEN_KEY)
      : await AsyncStorage.getItem(TOKEN_KEY)

    if (token) return token

    return await migrateLegacyToken()
  }
  catch (error) {
    console.error('Erro ao buscar token:', error)
    return null
  }
}

export const removeToken = async () => {
  try {
    if (secureAvailable) {
      await SecureStore.deleteItemAsync(TOKEN_KEY)
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY)
    }
    // Não deixa rastro do formato antigo para trás.
    await AsyncStorage.removeItem(LEGACY_KEY)
  }
  catch (error) {
    console.error('Erro ao remover token:', error)
  }
}

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getToken()
  return !!token
}

/**
 * Quem já estava logado com a versão anterior não pode ser deslogado por
 * causa da mudança: move o token para o lugar seguro e apaga o antigo.
 */
async function migrateLegacyToken(): Promise<string | null> {
  const legacy = await AsyncStorage.getItem(LEGACY_KEY)
  if (!legacy) return null

  await saveToken(legacy)
  await AsyncStorage.removeItem(LEGACY_KEY)

  return legacy
}
