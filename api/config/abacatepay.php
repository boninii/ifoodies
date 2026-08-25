<?php

/**
 * Integração AbacatePay (Pix).
 *
 * A integração fica DESLIGADA até as credenciais serem configuradas no .env:
 *   ABACATEPAY_ENABLED=true
 *   ABACATEPAY_API_KEY=abc_...        (painel AbacatePay → API Keys)
 *   ABACATEPAY_WEBHOOK_SECRET=...     (definido ao cadastrar o webhook)
 *
 * O webhook deve ser cadastrado no painel apontando para:
 *   https://SEU-DOMINIO/api/webhooks/abacatepay?webhookSecret=SEU_SEGREDO
 *
 * A API é a v2: as chaves atuais respondem 401 "API key version mismatch"
 * nos endpoints /v1. Chave abc_dev_… é sandbox e não move dinheiro real.
 */
return [
    'enabled' => env('ABACATEPAY_ENABLED', false),
    'api_key' => env('ABACATEPAY_API_KEY'),
    'base_url' => env('ABACATEPAY_BASE_URL', 'https://api.abacatepay.com/v2'),
    'webhook_secret' => env('ABACATEPAY_WEBHOOK_SECRET'),

    // Validade da cobrança Pix, em segundos (default: 30 min — um pedido de
    // cantina que não foi pago em meia hora não vai mais ser retirado).
    'pix_expires_in' => (int) env('ABACATEPAY_PIX_EXPIRES_IN', 1800),
];
