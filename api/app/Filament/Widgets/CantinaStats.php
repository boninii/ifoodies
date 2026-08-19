<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use App\Models\Product;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

/**
 * A visão do balcão ao abrir o painel: o que está na fila agora, o que já
 * pode ser retirado e o que precisa de reposição.
 */
class CantinaStats extends StatsOverviewWidget
{
    // A fila é a primeira coisa que o balcão precisa ver — sem lazy load.
    protected static bool $isLazy = false;

    protected ?string $pollingInterval = '15s';

    protected function getStats(): array
    {
        $inQueue = Order::whereNotIn('status', ['ready', 'canceled'])->count();
        $readyNow = Order::where('status', 'ready')->count();
        $todayTotal = Order::whereDate('created_at', today())
            ->where('status', '!=', 'canceled')
            ->sum('total_value');
        $soldOut = Product::where('stock', '<=', 0)->count();

        return [
            Stat::make('Na fila agora', (string) $inQueue)
                ->description('Pedidos aguardando preparo')
                ->color($inQueue > 0 ? 'warning' : 'success'),
            Stat::make('Prontos para retirada', (string) $readyNow)
                ->description('Aguardando o aluno no balcão')
                ->color($readyNow > 0 ? 'primary' : 'gray'),
            Stat::make('Vendas de hoje', 'R$ '.number_format((float) $todayTotal, 2, ',', '.'))
                ->description('Pedidos de hoje, exceto cancelados')
                ->color('success'),
            Stat::make('Produtos esgotados', (string) $soldOut)
                ->description($soldOut > 0 ? 'Reponha o estoque para voltarem ao cardápio' : 'Cardápio completo disponível')
                ->color($soldOut > 0 ? 'danger' : 'success'),
        ];
    }
}
