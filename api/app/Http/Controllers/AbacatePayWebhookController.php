<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Webhook da AbacatePay. Cadastrar no painel como:
 *   https://SEU-DOMINIO/api/webhooks/abacatepay?webhookSecret=SEU_SEGREDO
 *
 * A AbacatePay autentica pelo query param `webhookSecret`, que deve bater
 * com ABACATEPAY_WEBHOOK_SECRET. O envelope da v2 é
 *   { id, event, apiVersion, devMode, data: { … } }
 * e o evento que interessa é o de cobrança paga.
 *
 * Este é um reforço, não o caminho principal: o app também consulta o status
 * ativamente (PaymentController::show), então um webhook atrasado ou perdido
 * não deixa o aluno preso em "aguardando".
 */
class AbacatePayWebhookController extends Controller
{
    /** Eventos que significam "cobrança paga", entre v1 e v2. */
    private const PAID_EVENTS = [
        'transparent.completed',
        'checkout.completed',
        'billing.paid',
        'pixQrCode.paid',
    ];

    public function __invoke(Request $request): JsonResponse
    {
        $secret = config('abacatepay.webhook_secret');

        abort_unless(
            filled($secret) && hash_equals((string) $secret, (string) $request->query('webhookSecret')),
            403,
        );

        $event = (string) $request->input('event');

        // Eventos que não são de pagamento (reembolso, disputa) são aceitos
        // sem ação: responder erro faria a AbacatePay reenviar para sempre.
        if ($event !== '' && ! in_array($event, self::PAID_EVENTS, true)) {
            return response()->json(['received' => true]);
        }

        $order = $this->resolveOrder($request);

        if (! $order) {
            // Só o suficiente para investigar. O payload inteiro traria
            // dados do pagador vindos do gateway para dentro do nosso log.
            Log::info('Webhook AbacatePay sem pedido correspondente.', [
                'event' => $event,
                'log_id' => $request->input('id'),
                'data_id' => $request->input('data.id'),
                'chaves_recebidas' => array_keys((array) $request->input('data', [])),
            ]);

            return response()->json(['received' => true]);
        }

        if ($order->paid_at === null) {
            // Dispara OrderStatusChanged pelo model: o app do aluno vê a
            // confirmação sem precisar perguntar.
            $order->update(['status' => 'approved', 'paid_at' => now()]);
        }

        return response()->json(['received' => true]);
    }

    /**
     * Acha o pedido pelo id da cobrança ou, se ele vier num caminho que não
     * conhecemos, pelo metadata.order_id que nós mesmos enviamos na criação.
     */
    private function resolveOrder(Request $request): ?Order
    {
        $paymentId = $request->input('data.id')
            ?? $request->input('data.pixQrCode.id')
            ?? $request->input('data.payment.id')
            ?? $request->input('data.transaction.id');

        if ($paymentId && $order = Order::where('payment_id', $paymentId)->first()) {
            return $order;
        }

        $orderId = $request->input('data.metadata.order_id')
            ?? $request->input('data.pixQrCode.metadata.order_id');

        return $orderId ? Order::find($orderId) : null;
    }
}
