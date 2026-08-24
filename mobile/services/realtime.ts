import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { API_HOST, API_ORIGIN, API_SECURE } from '@/services/api'

/**
 * Tempo real: o servidor avisa, o app não pergunta.
 *
 * Antes a tela de pedidos batia na API a cada 15 segundos para descobrir se
 * algo tinha mudado. Agora o Laravel (Reverb) empurra a mudança de status
 * pelo WebSocket no instante em que ela acontece — o polling ficou só como
 * rede de segurança, num intervalo longo, para o caso de o socket cair.
 *
 * O canal é privado por aluno: a autorização vai em /api/broadcasting/auth
 * com o mesmo Bearer token das outras chamadas.
 */

/** Payload do evento `order.status` publicado por App\Events\OrderStatusChanged. */
export type OrderStatusEvent = {
  id: number
  status: string
  pickup_code: string | null
  delivered_at: string | null
}

const REVERB_KEY = process.env.EXPO_PUBLIC_REVERB_APP_KEY ?? ''

/** Em produção o WebSocket costuma ficar atrás do mesmo proxy da API. */
const REVERB_HOST = process.env.EXPO_PUBLIC_REVERB_HOST ?? API_HOST
const REVERB_PORT = Number(process.env.EXPO_PUBLIC_REVERB_PORT ?? 8080)
const REVERB_SECURE = (process.env.EXPO_PUBLIC_REVERB_SCHEME ?? (API_SECURE ? 'https' : 'http')) === 'https'

/** Sem chave configurada não há tempo real — o app cai no polling e segue. */
export const realtimeEnabled = REVERB_KEY.length > 0

type Subscription = { unsubscribe: () => void }

/**
 * Escuta as mudanças de status dos pedidos de um aluno.
 *
 * Devolve um objeto com `unsubscribe`; chamar isso desliga o socket. Se
 * qualquer coisa falhar (sem chave, sem rede, servidor Reverb desligado), a
 * função devolve null em vez de derrubar a tela — o polling assume.
 */
export function listenToOrders(
  userId: number,
  token: string,
  onChange: (event: OrderStatusEvent) => void,
): Subscription | null {
  if (!realtimeEnabled) return null

  try {
    const echo = new Echo({
      broadcaster: 'reverb',
      // O Echo procura o Pusher em `window` quando não recebe um. No React
      // Native isso é terreno incerto, então entregamos a classe na mão.
      Pusher,
      key: REVERB_KEY,
      wsHost: REVERB_HOST,
      wsPort: REVERB_PORT,
      wssPort: REVERB_PORT,
      forceTLS: REVERB_SECURE,
      enabledTransports: ['ws', 'wss'],
      disableStats: true,
      authEndpoint: `${API_ORIGIN}/api/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    })

    echo.private(`orders.${userId}`).listen('.order.status', (event: OrderStatusEvent) => {
      onChange(event)
    })

    return {
      unsubscribe: () => {
        try {
          echo.leave(`orders.${userId}`)
          echo.disconnect()
        } catch {
          // Desconectar é melhor-esforço: se já caiu, não há o que fazer.
        }
      },
    }
  } catch (error) {
    console.warn('Tempo real indisponível, usando recarga periódica:', error)
    return null
  }
}
