<?php

namespace App\Jobs;

use App\Models\Order;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

/**
 * Gatilho adormecido: agendado no instante em que o Pix nasce, acorda
 * quando ele expira.
 *
 * A validade do Pix é conhecida na hora da criação, então não há por que
 * ficar varrendo o banco atrás de pedidos vencidos — basta marcar a hora.
 *
 * Precisa de um worker de fila no ar (`php artisan queue:work`). Sem worker,
 * o job fica parado na tabela e quem faz a faxina é o caminho movido a
 * tráfego (App\Http\Middleware\ExpireAbandonedOrders). Os dois são seguros de
 * rodar juntos: o primeiro que chegar cancela, o segundo não acha nada.
 */
class ExpirePixCharge implements ShouldQueue
{
    use Queueable;

    /**
     * @param  string  $paymentId  A cobrança que este job veio expirar. Se o
     *                             aluno gerar outra para o mesmo pedido, este
     *                             job perde a validade — a nova tem prazo
     *                             próprio e um job próprio.
     */
    public function __construct(
        public int $orderId,
        public string $paymentId,
    ) {}

    public function handle(): void
    {
        $order = Order::with('products')->find($this->orderId);

        if (! $order) {
            return;
        }

        // Pagou, ou o balcão já mexeu no pedido: não é mais assunto nosso.
        if ($order->status !== 'awaiting_payment' || $order->paid_at !== null) {
            return;
        }

        // Uma cobrança mais nova assumiu o lugar desta.
        if ($order->payment_id !== $this->paymentId) {
            return;
        }

        // Dispara o gatilho do model: devolve o estoque e avisa o aluno pelo
        // WebSocket, que aí sim tem um evento de verdade para transmitir.
        $order->update(['status' => 'canceled']);
    }
}
