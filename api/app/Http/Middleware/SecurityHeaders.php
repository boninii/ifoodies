<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Cabeçalhos de segurança em toda resposta — API e painel.
 *
 * Sobre a CSP: aqui ela cobre APENAS `frame-ancestors`, que é o equivalente
 * moderno do X-Frame-Options. Uma CSP completa (script-src, style-src)
 * quebraria o Filament, que depende de script e estilo inline do Alpine e do
 * Livewire. Meia CSP que funciona vale mais do que uma inteira que obriga a
 * desligar tudo no primeiro erro.
 *
 * O HSTS só sai em conexão segura: mandá-lo por http é inócuo, e pior,
 * mandá-lo cedo demais tranca o domínio em https antes de o certificado
 * existir.
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Clickjacking: o painel é uma aplicação de sessão por cookie, então
        // embutir /admin num iframe é ataque real, não hipótese.
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('Content-Security-Policy', "frame-ancestors 'none'");

        // Impede o navegador de "adivinhar" o tipo de um arquivo servido —
        // relevante porque as fotos de produto vêm de upload.
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        if ($request->isSecure()) {
            $response->headers->set(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains',
            );
        }

        // Entregar a versão exata do PHP só ajuda quem procura um alvo.
        //
        // `header_remove` e não `$response->headers->remove`: quem põe esse
        // cabeçalho é o próprio PHP (expose_php), fora do objeto de resposta
        // do framework. Tirá-lo do Symfony não faz efeito nenhum.
        if (! headers_sent()) {
            header_remove('X-Powered-By');
        }

        return $response;
    }
}
