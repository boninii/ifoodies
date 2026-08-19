import { api } from '@/services/api'

/**
 * Pagamento no app via AbacatePay (Pix).
 *
 * A integração está PREPARADA mas desligada: o backend expõe os endpoints e
 * responde 503 enquanto `ABACATEPAY_ENABLED=false` no servidor. Quando as
 * credenciais forem configuradas lá, basta virar `PAYMENTS_ENABLED` para
 * true que a UI de pagamento passa a chamar estes serviços.
 */
export const PAYMENTS_ENABLED = false

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
