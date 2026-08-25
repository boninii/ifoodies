<?php

namespace App\Actions;

use App\Models\Order;
use Illuminate\Support\Facades\Cache;

/**
 * Cancela pedidos cujo Pix foi gerado e nunca pago, devolvendo o estoque.
 *
 * Por que isto não é um WebSocket: o socket empurra quando ALGO acontece.
 * Aqui o gatilho é o contrário — ninguém pagou, e o tempo passou. Não existe
 * evento de "não-pagamento" para transmitir.
 *
 * E por que também não precisa de cron: em vez de um relógio externo, quem
 * dispara é o próprio movimento do sistema. Toda requisição passa por aqui,
 * mas o trabalho de verdade acontece no máximo uma vez por minuto — o resto
 * é uma leitura de cache. Numa cantina em funcionamento sobra movimento: o
 * painel do balcão sonda a cada 10s e cada aluno abrindo o cardápio conta.
 *
 * O custo dessa escolha, dito na cara: sem NENHUM movimento, nada expira.
 * De madrugada um Pix abandonado continua segurando estoque até a primeira
 * pessoa mexer no sistema no dia seguinte — que é exatamente quando aquele
 * estoque volta a importar.
 */
class ExpireAbandonedOrders
{
    /** Espaço mínimo entre duas execuções de verdade. */
    private const INTERVALO_SEGUNDOS = 60;

    /**
     * @return int Quantos pedidos foram expirados.
     */
    public function __invoke(bool $forcar = false): int
    {
        // `add` é atômico: só o primeiro a chegar no minuto passa.
        if (! $forcar && ! Cache::add('orders:expire-lock', true, self::INTERVALO_SEGUNDOS)) {
            return 0;
        }

        // A validade do Pix mais uma folga. Cancelar um pagamento que ainda
        // podia ser feito seria pior do que segurar o estoque um pouco mais.
        $limite = now()->subSeconds((int) config('abacatepay.pix_expires_in') + 300);

        $abandonados = Order::where('status', 'awaiting_payment')
            ->whereNull('paid_at')
            ->where('updated_at', '<', $limite)
            ->with('products')
            ->get();

        foreach ($abandonados as $order) {
            // O update dispara o gatilho do model: devolve o estoque e avisa
            // o app do aluno pelo WebSocket.
            $order->update(['status' => 'canceled']);
        }

        return $abandonados->count();
    }
}
