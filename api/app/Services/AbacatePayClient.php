<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Cliente HTTP da AbacatePay (Pix), API v2.
 *
 * A v1 usava /pixQrCode/*; as chaves atuais (abc_dev_… / abc_live_…) são da
 * v2 e respondem 401 "API key version mismatch" nos endpoints antigos. A v2
 * concentra tudo em /transparents com um envelope { method, data }.
 *
 * Endpoints usados (Bearer token):
 * - POST /transparents/create            → cria a cobrança e devolve
 *   { id, amount, status, devMode, brCode, brCodeBase64, expiresAt } em `data`
 * - GET  /transparents/check?id=         → status atual (PENDING | PAID |
 *   EXPIRED | CANCELLED) em `data`
 * - POST /transparents/simulate-payment?id= → só em devMode: marca como paga
 *
 * O `customer` é opcional e exige CPF e telefone quando enviado — o app não
 * pede nenhum dos dois ao aluno, então a cobrança vai sem ele.
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

    /** True quando a chave é de sandbox: nenhuma cobrança move dinheiro real. */
    public function devMode(): bool
    {
        return str_starts_with((string) config('abacatepay.api_key'), 'abc_dev_');
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

        $data = [
            'amount' => $amountInCents,
            'expiresIn' => (int) config('abacatepay.pix_expires_in'),
            'description' => $description,
        ];

        if ($customer !== []) {
            $data['customer'] = $customer;
        }
        if ($metadata !== []) {
            $data['metadata'] = $metadata;
        }

        $response = $this->http()
            ->post('/transparents/create', ['method' => 'PIX', 'data' => $data])
            ->throw();

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

        $response = $this->http()->get('/transparents/check', ['id' => $id])->throw();

        return $response->json('data') ?? [];
    }

    /**
     * Marca a cobrança como paga — só existe em devMode. É o que permite
     * testar o fluxo inteiro sem um Pix de verdade.
     *
     * @return array{status: string}
     */
    public function simulatePayment(string $id): array
    {
        $this->assertEnabled();

        if (! $this->devMode()) {
            throw new RuntimeException('Simular pagamento só funciona com chave de desenvolvimento.');
        }

        // O id vai na query string; o corpo precisa existir mas fica vazio.
        $response = $this->http()
            ->post('/transparents/simulate-payment?id='.urlencode($id), [])
            ->throw();

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
