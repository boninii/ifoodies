<?php

namespace App\Filament\Resources\Orders\Tables;

use App\Models\Order;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\SelectColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class OrdersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            // A fila da cantina se atualiza sozinha — o app do aluno sonda o
            // status; a mudança feita aqui chega nele em segundos.
            ->poll('10s')
            ->columns([
                TextColumn::make('id')
                    ->label('Pedido')
                    ->formatStateUsing(fn (int $state): string => '#'.str_pad((string) $state, 3, '0', STR_PAD_LEFT))
                    ->sortable(),
                TextColumn::make('user.name')
                    ->label('Aluno')
                    ->searchable(),
                TextColumn::make('items')
                    ->label('Itens')
                    ->state(fn (Order $record): string => $record->products
                        ->map(fn ($p) => "{$p->pivot->quantity}× {$p->name}")
                        ->join(', '))
                    ->limit(45)
                    ->wrap(),
                // O trabalho do balcão acontece aqui: trocar o status direto
                // na fila, sem abrir página nenhuma.
                SelectColumn::make('status')
                    ->label('Status')
                    ->options(Order::STATUSES)
                    ->selectablePlaceholder(false),
                TextColumn::make('total_value')
                    ->label('Total')
                    ->money('BRL')
                    ->sortable(),
                TextColumn::make('created_at')
                    ->label('Feito em')
                    ->dateTime('d/m · H:i')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('status')
                    ->label('Status')
                    ->options(Order::STATUSES),
            ])
            ->recordActions([
                ViewAction::make(),
            ])
            ->toolbarActions([
                // Pedido não se apaga: veio do aluno e é histórico.
            ]);
    }
}
