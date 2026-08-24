<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Avisa o app do aluno que o status do pedido dele mudou.
 *
 * É o oposto do polling: em vez de o app perguntar de tempos em tempos, o
 * servidor empurra a mudança pelo WebSocket (Reverb) no instante em que ela
 * acontece. Disparado pelo próprio model (Order::booted), então vale para
 * qualquer caminho — painel, API, webhook de pagamento ou retirada.
 *
 * `ShouldBroadcastNow` e não `ShouldBroadcast`: a transmissão sai na hora,
 * sem passar pela fila. Uma cantina não tem volume que justifique manter um
 * worker de fila no ar só para isto, e um worker parado significaria aluno
 * esperando por um aviso que nunca chegaria.
 */
class OrderStatusChanged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Order $order) {}

    /**
     * Canal privado do dono do pedido: ninguém escuta a fila de outro aluno.
     */
    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('orders.'.$this->order->user_id);
    }

    public function broadcastAs(): string
    {
        return 'order.status';
    }

    /**
     * O mínimo para a tela se atualizar sem uma nova ida à API.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->order->id,
            'status' => $this->order->status,
            'pickup_code' => $this->order->pickup_code,
            'delivered_at' => $this->order->delivered_at?->toIso8601String(),
        ];
    }
}
