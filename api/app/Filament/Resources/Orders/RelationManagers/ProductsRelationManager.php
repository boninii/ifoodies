<?php

namespace App\Filament\Resources\Orders\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

/**
 * Itens do pedido — somente leitura: o conteúdo veio do aluno e o preço
 * unitário está congelado no pivot (histórico).
 */
class ProductsRelationManager extends RelationManager
{
    protected static string $relationship = 'products';

    protected static ?string $title = 'Itens do pedido';

    public function isReadOnly(): bool
    {
        return true;
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('name')
            ->columns([
                TextColumn::make('name')
                    ->label('Produto'),
                TextColumn::make('pivot.quantity')
                    ->label('Qtde'),
                TextColumn::make('pivot.value_unitary')
                    ->label('Preço unitário')
                    ->money('BRL'),
            ])
            ->paginated(false);
    }
}
