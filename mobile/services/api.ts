import Constants from 'expo-constants'
import { Platform } from 'react-native'
import { getToken } from '@/services/auth'

/**
 * URL base da API (Laravel).
 *
 * Em desenvolvimento o host é derivado sozinho — o IP do notebook muda a
 * cada renovação do DHCP, e um IP fixo no .env quebrava a conexão toda vez:
 * - web: mesmo hostname que serve o app (window.location);
 * - nativo (Expo Go): o host do Metro (Constants.expoConfig.hostUri), que é
 *   sempre o IP atual da máquina de desenvolvimento.
 *
 * Em build de produção vale `EXPO_PUBLIC_API_URL`, e só ela. Antes havia um
 * domínio fixo como reserva; um build sem a variável mandava e-mail e senha
 * dos alunos para um endereço herdado de outro projeto. Falhar alto é o
 * comportamento certo aqui.
 */
const API_PORT = 8000
const API_PATH = '/api/cantina'

function resolveDevHost(): string | null {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.hostname
  }
  const hostUri = Constants.expoConfig?.hostUri
  if (hostUri) return hostUri.split(':')[0]
  return null
}

const devHost = __DEV__ ? resolveDevHost() : null

function productionOrigin(): string {
  const url = process.env.EXPO_PUBLIC_API_URL

  if (!url) {
    throw new Error(
      'EXPO_PUBLIC_API_URL não foi definida neste build. Configure a URL da API antes de publicar.',
    )
  }

  return url.replace(/\/api\/cantina\/?$/, '').replace(/\/$/, '')
}

/** Esquema + host + porta da API, sem caminho. O WebSocket parte daqui. */
export const API_ORIGIN = devHost ? `http://${devHost}:${API_PORT}` : productionOrigin()

/** Host puro da API — o Reverb precisa dele sem esquema nem porta. */
export const API_HOST = API_ORIGIN.replace(/^https?:\/\//, '').split(':')[0]

/** True quando a API é servida por HTTPS (define ws x wss no Reverb). */
export const API_SECURE = API_ORIGIN.startsWith('https://')

const BASE_URL = `${API_ORIGIN}${API_PATH}`

/**
 * Handler chamado quando a API responde 401. O AuthProvider registra aqui o
 * seu `logout`, centralizando o tratamento de token expirado/inválido.
 */
let onUnauthorized: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler
}

export type ApiResponse<T> = {
  ok: boolean
  status: number
  data: T
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  /** Anexa o Bearer token automaticamente. Default: true. */
  auth?: boolean
}

/**
 * Cliente HTTP único do app. Monta a URL, injeta os headers padrão e o token,
 * trata 401 e devolve `{ ok, status, data }` já com o JSON parseado.
 */
export async function api<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, auth = true } = options

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }

  if (auth) {
    const token = await getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401) {
    onUnauthorized?.()
  }

  let data = null as T
  try {
    data = (await response.json()) as T
  } catch {
    // Resposta sem corpo JSON (ex.: 204 No Content).
  }

  return { ok: response.ok, status: response.status, data }
}
