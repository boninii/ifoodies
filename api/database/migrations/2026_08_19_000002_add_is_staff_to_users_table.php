<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Quem pode entrar no painel /admin. Alunos (registro pelo app)
            // nascem sempre como false; o valor não é atribuível em massa.
            $table->boolean('is_staff')->default(false)->after('student_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('is_staff');
        });
    }
};
