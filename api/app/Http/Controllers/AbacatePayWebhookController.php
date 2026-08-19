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
 * A AbacatePay autentica o webhook pelo query param `webhookSecret`, que deve
 * bater com ABACATEPAY_WEBHOOK_SECRET. Evento relevante: cobrança paga —
 * o pedido correspondente (conciliado pelo payment_id) vira `approved`.
 */
class AbacatePayWebhookController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $secret = config('abacatepay.webhook_secret');

        abort_unless(
            filled($secret) && hash_equals((string) $secret, (string) $request->query('webhookSecret')),
            403,
        );

        // O id da cobrança pode vir em formatos diferentes conforme o evento
        // (billing.paid, pixQrCode.paid); procura nos caminhos conhecidos.
        $paymentId = $request->input('data.pixQrCode.id')
            ?? $request->input('data.payment.id')
            ?? $request->input('data.id');

        if (! $paymentId) {
            Log::info('AbacatePay webhook sem id de cobrança.', ['payload' => $request->all()]);

            return response()->json(['received' => true]);
        }

        $order = Order::where('payment_id', $paymentId)->first();

        if ($order && $order->paid_at === null) {
            $order->update(['status' => 'approved', 'paid_at' => now()]);
        }

        return response()->json(['received' => true]);
    }
}
