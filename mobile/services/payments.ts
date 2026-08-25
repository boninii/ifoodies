import { api } from '@/services/api'

/**
 * Pagamento no app via AbacatePay (Pix).
 *
 * Ligada. O backend cria a cobrança na AbacatePay (API v2) e devolve o
 * copia-e-cola e o QR; a confirmação chega pelo webhook e, como reforço,
 * pela consulta ativa em `/orders/{id}/payment`, que pergunta ao gateway.
 *
 * Se o servidor estiver com `ABACATEPAY_ENABLED=false`, os endpoints
 * respondem 503 e a tela de pagamento mostra o recado de pagar no balcão —
 * o pedido continua valendo de qualquer jeito.
 */
export const PAYMENTS_ENABLED = true

export type PixCharge = {
  payment_id: string
  /** Copia-e-cola do Pix. */
  brcode: string
  /** QR code em base64 (data URI), quando o gateway devolver. */
  brcode_base64?: string
  amount: number
  expires_at?: string
}

export type PaymentStatus = {
  status: string
  paid: boolean
}

/** Cria a cobrança Pix de um pedido já enviado. */
export function createPixCharge(orderId: number) {
  return api<PixCharge & { error?: string }>(`/orders/${orderId}/pay`, { method: 'POST' })
}

/** Consulta se o pedido foi pago (o backend confirma junto ao gateway). */
export function getPaymentStatus(orderId: number) {
  return api<PaymentStatus>(`/orders/${orderId}/payment`)
}
