<?php

namespace App\Filament\Resources\Products\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class ProductsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('image')
                    ->label('')
                    ->circular(),
                TextColumn::make('name')
                    ->label('Produto')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('category.name')
                    ->label('Categoria')
                    ->badge()
                    ->color('primary')
                    ->sortable(),
                TextColumn::make('price')
                    ->label('Preço')
                    ->money('BRL')
                    ->sortable(),
                TextColumn::make('stock')
                    ->label('Estoque')
                    ->badge()
                    // Espelha os selos do app: esgotado é perda, ≤5 é alerta.
                    ->color(fn (int $state): string => match (true) {
                        $state <= 0 => 'danger',
                        $state <= 5 => 'warning',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (int $state): string => $state <= 0 ? 'Esgotado' : (string) $state)
                    ->sortable(),
            ])
            ->defaultSort('name')
            ->filters([
                SelectFilter::make('category_id')
                    ->label('Categoria')
                    ->relationship('category', 'name'),
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
