<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS)
    |--------------------------------------------------------------------------
    |
    | O padrão do framework libera qualquer origem ('*'). Como a autenticação
    | é por Bearer token e não por cookie, isso não expõe a conta de ninguém,
    | mas também não há motivo para deixar aberto: em produção, liste os
    | domínios que realmente consomem a API em CORS_ALLOWED_ORIGINS.
    |
    | O app nativo não manda Origin e não é afetado por nada disto — quem
    | depende do CORS é a versão web do Expo.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter(explode(',', (string) env('CORS_ALLOWED_ORIGINS', '*'))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
