<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Cliente HTTP da AbacatePay (Pix).
 *
 * Endpoints usados (API v1, Bearer token):
 * - POST /pixQrCode/create  → cria a cobrança { amount em centavos, expiresIn,
 *   description, customer?, metadata? } e devolve { id, brCode, brCodeBase64,
 *   amount, status, expiresAt } dentro de `data`.
 * - GET  /pixQrCode/check?id= → devolve o status atual (PENDING | PAID |
 *   EXPIRED | CANCELLED) dentro de `data`.
 *
 * Confirmação de pagamento em produção chega pelo webhook
 * (AbacatePayWebhookController); o check existe para consulta ativa.
 */
class AbacatePayClient
{
    /** A integração só funciona com a flag ligada E a chave presente. */
    public function enabled(): bool
    {
        return (bool) config('abacatepay.enabled') && filled(config('abacatepay.api_key'));
    }

    protected function http(): PendingRequest
    {
        return Http::withToken(config('abacatepay.api_key'))
            ->baseUrl(rtrim((string) config('abacatepay.base_url'), '/'))
            ->acceptJson()
            ->timeout(15);
    }

    /**
     * Cria uma cobrança Pix. `$amountInCents` é o total em centavos.
     *
     * @return array{id: string, brCode: string, brCodeBase64: ?string, amount: int, status: string, expiresAt: ?string}
     */
    public function createPixQrCode(
        int $amountInCents,
        string $description,
        array $customer = [],
        array $metadata = [],
    ): array {
        $this->assertEnabled();

        $payload = [
            'amount' => $amountInCents,
            'expiresIn' => (int) config('abacatepay.pix_expires_in'),
            'description' => $description,
        ];

        if ($customer !== []) {
            $payload['customer'] = $customer;
        }
        if ($metadata !== []) {
            $payload['metadata'] = $metadata;
        }

        $response = $this->http()->post('/pixQrCode/create', $payload)->throw();

        return $response->json('data') ?? [];
    }

    /**
     * Consulta o status de uma cobrança Pix.
     *
     * @return array{status: string}
     */
    public function checkPixQrCode(string $id): array
    {
        $this->assertEnabled();

        $response = $this->http()->get('/pixQrCode/check', ['id' => $id])->throw();

        return $response->json('data') ?? [];
    }

    protected function assertEnabled(): void
    {
        if (! $this->enabled()) {
            throw new RuntimeException(
                'AbacatePay desligado: configure ABACATEPAY_ENABLED e ABACATEPAY_API_KEY no .env.',
            );
        }
    }
}
