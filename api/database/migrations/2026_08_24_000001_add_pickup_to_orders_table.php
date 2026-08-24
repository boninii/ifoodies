<?php

use App\Models\Order;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // O código que o aluno mostra no balcão. É ele — e não o
            // prontuário, que é público — quem prova que o pedido é dele.
            $table->string('pickup_code', 6)->nullable()->unique()->after('status');
            $table->timestamp('delivered_at')->nullable()->after('paid_at');
        });

        // Pedidos que já existiam também precisam de código para poderem ser
        // retirados; os encerrados não, porque ninguém mais vai ao balcão.
        Order::query()
            ->whereNull('pickup_code')
            ->whereNotIn('status', ['canceled', 'delivered'])
            ->each(function (Order $order) {
                $order->forceFill(['pickup_code' => Order::generatePickupCode()])->save();
            });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['pickup_code', 'delivered_at']);
        });
    }
};
