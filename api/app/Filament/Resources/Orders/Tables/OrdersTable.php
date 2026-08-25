<?php

namespace App\Filament\Resources\Orders\Tables;

use App\Actions\ConfirmOrderPickup;
use App\Models\Order;
use Filament\Actions\Action;
use Filament\Actions\ViewAction;
use Filament\Notifications\Notification;
use Filament\Tables\Columns\SelectColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class OrdersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn ($query) => $query->with(['user', 'products']))
            // A fila se atualiza sozinha. O aluno recebe a mudança na hora
            // pelo WebSocket; aqui um poll curto basta.
            ->poll('10s')
            ->columns([
                TextColumn::make('id')
                    ->label('Pedido')
                    ->formatStateUsing(fn (int $state): string => '#'.str_pad((string) $state, 3, '0', STR_PAD_LEFT))
                    ->sortable(),
                TextColumn::make('user.name')
                    ->label('Aluno')
                    ->searchable(),
                // O balcão pode conferir por aqui quando o aluno já falou o
                // código antes de chegar a vez dele.
                TextColumn::make('pickup_code')
                    ->label('Código')
                    ->badge()
                    ->color(fn (Order $record): string => $record->awaitingPickup() ? 'success' : 'gray')
                    ->copyable()
                    ->searchable()
                    ->placeholder('—'),
                TextColumn::make('items')
                    ->label('Itens')
                    ->state(fn (Order $record): string => $record->products
                        ->map(fn ($p) => "{$p->pivot->quantity}× {$p->name}")
                        ->join(', '))
                    ->limit(45)
                    ->wrap(),
                // O trabalho do balcão acontece aqui: trocar o status direto
                // na fila, sem abrir página nenhuma.
                //
                // "Retirado" só entra na lista quando o pedido JÁ está
                // retirado — aí para conseguir exibir o rótulo certo, com o
                // select travado. Nos demais, ele fica fora: quem encerra um
                // pedido é o código do aluno, não um clique.
                //
                // Sem esse cuidado, um pedido retirado caía na primeira
                // opção da lista e aparecia como "Aberto" para o balcão.
                SelectColumn::make('status')
                    ->label('Status')
                    ->options(fn (Order $record): array => $record->status === 'delivered'
                        ? Order::STATUSES
                        : collect(Order::STATUSES)->except('delivered')->all())
                    ->disabled(fn (Order $record): bool => $record->status === 'delivered')
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
                // A tela do balcão é sobre o que ainda dá trabalho. Retirado
                // e cancelado saem da frente por padrão, sem sumir de vez.
                SelectFilter::make('situacao')
                    ->label('Mostrar')
                    ->options([
                        'ativos' => 'Fila ativa',
                        'prontos' => 'Prontos para retirada',
                        'encerrados' => 'Encerrados',
                        'todos' => 'Todos',
                    ])
                    ->default('ativos')
                    ->selectablePlaceholder(false)
                    ->query(fn (Builder $query, array $data): Builder => match ($data['value'] ?? 'ativos') {
                        'prontos' => $query->where('status', 'ready'),
                        'encerrados' => $query->whereIn('status', ['delivered', 'canceled']),
                        'todos' => $query,
                        default => $query->whereNotIn('status', ['delivered', 'canceled']),
                    }),
                SelectFilter::make('status')
                    ->label('Status exato')
                    ->options(Order::STATUSES),
            ])
            ->recordActions([
                ViewAction::make(),
                static::retiradaSemCodigoAction(),
            ])
            ->toolbarActions([
                // Pedido não se apaga: veio do aluno e é histórico.
            ]);
    }

    /**
     * Saída de emergência: celular descarregado, app não abre, aluno sem o
     * código. O atendente responde por ela, então é uma ação separada, com
     * confirmação e nome que diz exatamente o que está acontecendo.
     */
    private static function retiradaSemCodigoAction(): Action
    {
        return Action::make('retiradaSemCodigo')
            ->label('Retirada sem código')
            ->color('gray')
            ->link()
            ->visible(fn (Order $record): bool => $record->awaitingPickup())
            ->requiresConfirmation()
            ->modalHeading('Registrar retirada sem o código?')
            ->modalDescription('Use só quando o aluno não conseguir mostrar o código. Confirme antes que ele é mesmo o dono do pedido.')
            ->modalSubmitActionLabel('Sim, entreguei')
            ->action(function (Order $record, ConfirmOrderPickup $confirmarRetirada): void {
                $confirmarRetirada($record->pickup_code);

                Notification::make()
                    ->success()
                    ->title('Retirada registrada')
                    ->body('Pedido #'.str_pad((string) $record->id, 3, '0', STR_PAD_LEFT).' encerrado.')
                    ->send();
            });
    }
}
