<?php

namespace App\Console\Commands;

use App\Actions\ExpireAbandonedOrders as ExpirarPedidos;
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

    public function handle(ExpirarPedidos $expirar): int
    {
        // `forcar`: rodado à mão ou por agendador, ignora o intervalo de um
        // minuto que existe para o caminho movido a tráfego.
        $total = $expirar(forcar: true);

        $this->info($total === 0 ? 'Nenhum pedido para expirar.' : $total.' pedido(s) expirado(s).');

        return self::SUCCESS;
    }
}
