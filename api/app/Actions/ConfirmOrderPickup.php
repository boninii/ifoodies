<?php

namespace App\Actions;

use App\Models\Order;
use Illuminate\Validation\ValidationException;

/**
 * Dá baixa na retirada a partir do código que o aluno mostra no balcão.
 *
 * Uma porta só, para o painel e para qualquer futura leitora: valida o
 * código, confere que o pedido está mesmo pronto e o encerra. O código é de
 * uso único — depois de retirado, ele não abre mais nada.
 *
 * Estoque não é tocado aqui: ele já foi baixado quando o pedido nasceu.
 */
class ConfirmOrderPickup
{
    public function __invoke(string $code): Order
    {
        $code = strtoupper(trim($code));

        $order = Order::where('pickup_code', $code)->first();

        if (! $order) {
            $this->fail('Código não encontrado. Confira as 6 letras/números na tela do aluno.');
        }

        if ($order->status === 'delivered') {
            $this->fail(sprintf(
                'Este pedido já foi retirado em %s.',
                $order->delivered_at?->format('d/m \à\s H:i') ?? 'outro momento',
            ));
        }

        if ($order->status === 'canceled') {
            $this->fail('Este pedido foi cancelado.');
        }

        if (! $order->awaitingPickup()) {
            $this->fail(sprintf(
                'O pedido #%s ainda não está pronto (está em "%s").',
                str_pad((string) $order->id, 3, '0', STR_PAD_LEFT),
                Order::STATUSES[$order->status] ?? $order->status,
            ));
        }

        // O update dispara OrderStatusChanged pelo model: o app do aluno vê
        // "Retirado" antes de ele sair do balcão.
        $order->update([
            'status' => 'delivered',
            'delivered_at' => now(),
        ]);

        return $order;
    }

    private function fail(string $message): never
    {
        throw ValidationException::withMessages(['code' => $message]);
    }
}
