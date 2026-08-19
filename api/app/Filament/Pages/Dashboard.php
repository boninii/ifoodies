<?php

namespace App\Filament\Pages;

use BackedEnum;
use Filament\Pages\Dashboard as BaseDashboard;

/**
 * Painel de Controle sem ícone: o menu vive na barra superior, só texto.
 * O override é no MÉTODO porque a classe-mãe define o ícone por método,
 * que venceria a propriedade.
 */
class Dashboard extends BaseDashboard
{
    public static function getNavigationIcon(): string|BackedEnum|null
    {
        return null;
    }
}
