<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Marca que o estoque deste pedido já voltou para a prateleira.
            //
            // Sem esta marca, devolver estoque seria uma operação perigosa de
            // repetir: dois caminhos chamando a devolução do mesmo pedido
            // criariam produto do nada. Com ela, a segunda chamada não faz
            // nada — e é o banco, não a boa vontade do código, que garante.
            $table->timestamp('stock_returned_at')->nullable()->after('delivered_at');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('stock_returned_at');
        });
    }
};
