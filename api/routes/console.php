<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Tokens vencidos não servem para autenticar, mas continuam ocupando a
// tabela. Limpa os que passaram da validade há mais de um dia.
Schedule::command('sanctum:prune-expired --hours=24')->daily();

// Pix gerado e nunca pago prende o estoque de um produto que continua na
// prateleira. De cinco em cinco minutos porque o intervalo do aluno é curto:
// meia hora de estoque preso já é meia hora de venda perdida.
Schedule::command('orders:expire-unpaid')->everyFiveMinutes()->withoutOverlapping();
