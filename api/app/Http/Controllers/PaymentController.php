<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\AbacatePayClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    /**
     * Cria a cobrança Pix (AbacatePay) de um pedido do próprio usuário.
     * Enquanto a integração estiver desligada, responde 503 — o app mostra
     * "em breve" e o pagamento segue no balcão.
     */
    public function store(Request $request, Order $order, AbacatePayClient $client): JsonResponse
    {
        abort_unless($order->user_id === $request->user()->id, 404);

        if (! $client->enabled()) {
            return response()->json([
                'error' => 'Pagamento no app ainda não está disponível. Pague no balcão ao retirar.',
            ], 503);
        }

        if ($order->paid_at !== null) {
            return response()->json(['error' => 'Este pedido já foi pago.'], 422);
        }

        if (! in_array($order->status, ['open', 'awaiting_payment'], true)) {
            return response()->json(['error' => 'Este pedido não está mais aguardando pagamento.'], 422);
        }

        $pix = $client->createPixQrCode(
            amountInCents: (int) round(((float) $order->total_value) * 100),
            description: "iFoodies — pedido #{$order->id}",
            customer: [
                'name' => $request->user()->name,
                'email' => $request->user()->email,
            ],
            metadata: ['order_id' => (string) $order->id],
        );

        $order->update([
            'payment_method' => 'pix',
            'payment_id' => $pix['id'] ?? null,
            'status' => 'awaiting_payment',
        ]);

        return response()->json([
            'payment_id' => $pix['id'] ?? null,
            'brcode' => $pix['brCode'] ?? null,
            'brcode_base64' => $pix['brCodeBase64'] ?? null,
            'amount' => $pix['amount'] ?? null,
            'expires_at' => $pix['expiresAt'] ?? null,
        ], 201);
    }

    /**
     * Consulta o pagamento de um pedido. Se o gateway confirmar PAID e o
     * webhook ainda não tiver chegado, aprova aqui mesmo — o aluno não pode
     * ficar preso em "aguardando" por atraso de webhook.
     */
    public function show(Request $request, Order $order, AbacatePayClient $client): JsonResponse
    {
        abort_unless($order->user_id === $request->user()->id, 404);

        if ($order->paid_at !== null) {
            return response()->json(['status' => $order->status, 'paid' => true]);
        }

        if ($order->payment_id && $client->enabled()) {
            $data = $client->checkPixQrCode($order->payment_id);

            if (($data['status'] ?? null) === 'PAID') {
                $order->update(['status' => 'approved', 'paid_at' => now()]);

                return response()->json(['status' => 'approved', 'paid' => true]);
            }
        }

        return response()->json(['status' => $order->status, 'paid' => false]);
    }
}
