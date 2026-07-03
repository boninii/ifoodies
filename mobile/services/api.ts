import { getToken } from '@/services/auth'

/**
 * URL base da API (Laravel). Vem de variável de ambiente pública do Expo
 * (`EXPO_PUBLIC_API_URL`) e cai num default caso o `.env` não exista, para
 * que o projeto rode logo após o clone.
 */
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://cantinaapi.dingols.com.br/api/cantina'

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
