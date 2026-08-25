<?php

namespace App\Console\Commands;

use App\Models\Order;
use Illuminate\Console\Command;

/**
 * Encerra pedidos cujo Pix foi gerado e nunca pago.
 *
 * Sem isto, um aluno que gera o QR e desiste deixa o pedido preso em
 * "aguardando pagamento" para sempre — e, pior, segurando o estoque. O
 * produto sumia do cardápio por causa de uma venda que nunca aconteceu.
 *
 * Cancelar devolve os itens à prateleira pelo gatilho do próprio model, e o
 * app do aluno recebe a mudança na hora pelo WebSocket.
 *
 * Só toca em `awaiting_payment`: um pedido em `open` é de quem escolheu
 * pagar no balcão, é uma venda legítima esperando preparo, e quem decide
 * abandoná-lo é a cantina.
 */
class ExpireUnpaidOrders extends Command
{
    protected $signature = 'orders:expire-unpaid';

    protected $description = 'Cancela pedidos com Pix gerado e não pago além da validade, devolvendo o estoque';

    public function handle(): int
    {
        // A validade do Pix mais uma folga: cancelar um pagamento que ainda
        // podia ser feito seria pior do que segurar o estoque um pouco mais.
        $limite = now()->subSeconds((int) config('abacatepay.pix_expires_in') + 300);

        $abandonados = Order::where('status', 'awaiting_payment')
            ->whereNull('paid_at')
            ->where('updated_at', '<', $limite)
            ->with('products')
            ->get();

        if ($abandonados->isEmpty()) {
            $this->info('Nenhum pedido para expirar.');

            return self::SUCCESS;
        }

        foreach ($abandonados as $order) {
            $order->update(['status' => 'canceled']);

            $this->line(sprintf(
                '  #%s expirado — %s item(ns) devolvido(s) ao estoque.',
                str_pad((string) $order->id, 3, '0', STR_PAD_LEFT),
                $order->products->sum('pivot.quantity'),
            ));
        }

        $this->info($abandonados->count().' pedido(s) expirado(s).');

        return self::SUCCESS;
    }
}
