<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Conta de staff/admin (acessa o painel Filament em /admin). Sem
        // prontuário, pois não é aluno.
        User::firstOrCreate(
            ['email' => 'admin@ifoodies.test'],
            [
                'name' => 'Admin iFoodies',
                'password' => Hash::make('password'),
            ],
        );

        // Aluno de teste, para logar no app mobile.
        User::firstOrCreate(
            ['email' => 'aluno@ifoodies.test'],
            [
                'name' => 'Aluno Teste',
                'student_id' => 'SP20260001',
                'password' => Hash::make('password'),
            ],
        );

        $this->call(MenuSeeder::class);
    }
}
