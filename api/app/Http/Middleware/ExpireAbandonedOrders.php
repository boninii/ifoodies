<?php

namespace App\Http\Middleware;

use App\Actions\ExpireAbandonedOrders as ExpirarPedidos;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Faz o papel do agendador sem agendador: o movimento do sistema é o relógio.
 *
 * Roda em `terminate`, DEPOIS da resposta já ter saído — nenhum aluno espera
 * por isto. E a ação em si só trabalha de verdade uma vez por minuto; nas
 * outras vezes é uma leitura de cache.
 *
 * Falha aqui nunca pode virar erro na tela: o pedido do aluno não tem nada a
 * ver com a faxina do estoque de outra pessoa.
 */
class ExpireAbandonedOrders
{
    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }

    public function terminate(Request $request, Response $response): void
    {
        try {
            app(ExpirarPedidos::class)();
        } catch (\Throwable $e) {
            Log::warning('Falha ao expirar pedidos abandonados.', ['erro' => $e->getMessage()]);
        }
    }
}
