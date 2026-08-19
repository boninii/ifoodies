<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // 'pix' quando pago pelo app (AbacatePay); nulo = pagamento no balcão.
            $table->string('payment_method')->nullable()->after('total_value');
            // Id da cobrança no gateway (ex.: pix_char_...), para conciliar o webhook.
            $table->string('payment_id')->nullable()->index()->after('payment_method');
            $table->timestamp('paid_at')->nullable()->after('payment_id');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['payment_method', 'payment_id', 'paid_at']);
        });
    }
};
