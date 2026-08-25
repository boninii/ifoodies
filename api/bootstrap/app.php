<?php

use App\Http\Middleware\ExpireAbandonedOrders;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    // Canais de broadcast (Reverb). Quem autoriza é o mesmo Bearer token do
    // app, e não a sessão web — por isso a rota vai para
    // /api/broadcasting/auth com o guard do Sanctum.
    ->withBroadcasting(
        __DIR__.'/../routes/channels.php',
        ['prefix' => 'api', 'middleware' => ['auth:sanctum']],
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Sem isto a API aceita tentativas de login infinitas. Os limites
        // estão definidos em AppServiceProvider.
        $middleware->throttleApi();

        // Cabeçalhos de segurança em toda resposta, API e painel.
        $middleware->append(SecurityHeaders::class);

        // Expira Pix abandonado sem depender de cron: quem dá o tique é o
        // movimento do próprio sistema, e o trabalho roda depois da resposta.
        $middleware->append(ExpireAbandonedOrders::class);

        // Atrás de um proxy que termina TLS, sem isto o Laravel acha que a
        // conexão é http: o cookie de sessão perde o Secure e as URLs das
        // fotos saem em http numa página https (mixed content, foto some).
        $middleware->trustProxies(at: '*');

        // O padrão do framework manda o visitante não autenticado para a
        // rota `login`, que não existe aqui (a do painel se chama
        // filament.admin.auth.login). Numa chamada à API sem token e sem
        // `Accept: application/json` — um endereço colado no navegador —
        // isso estourava um 500 com stack trace no lugar de um 401.
        $middleware->redirectGuestsTo(fn (Request $request) => $request->is('api/*')
            ? null
            : route('filament.admin.auth.login'));
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        // Uma chamada à API sem token e sem `Accept: application/json` — um
        // endereço colado no navegador, por exemplo — fazia o Laravel tentar
        // redirecionar para a rota `login`, que não existe neste projeto (a
        // do painel se chama filament.admin.auth.login). O resultado era um
        // 500 com stack trace no lugar de um 401.
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => 'Não autenticado.'], 401);
            }
        });
    })->create();
