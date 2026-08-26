<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

/**
 * Semeia o banco apenas quando ele está vazio.
 *
 * Roda no boot do container, e é por isso que a condição importa: um
 * `db:seed` a cada deploy ressuscitaria produtos que a cantina apagou de
 * propósito. Sem usuário nenhum, porém, o sistema é inútil — não há como nem
 * entrar no painel.
 */
class SeedIfEmpty extends Command
{
    protected $signature = 'db:seed-if-empty';

    protected $description = 'Popula o banco com os dados de exemplo, só se não houver nenhum usuário';

    public function handle(): int
    {
        if (User::query()->exists()) {
            $this->info('Banco já tem dados — nada a semear.');

            return self::SUCCESS;
        }

        $this->info('Banco vazio: semeando dados de exemplo…');
        $this->call('db:seed', ['--force' => true]);

        return self::SUCCESS;
    }
}
