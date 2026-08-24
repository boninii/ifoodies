<?php

namespace App\Filament\Resources\Orders\Schemas;

use App\Models\Order;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class OrderInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextEntry::make('user.name')
                    ->label('Aluno'),
                TextEntry::make('user.student_id')
                    ->label('Prontuário')
                    ->placeholder('—'),
                TextEntry::make('status')
                    ->label('Status')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => Order::STATUSES[$state] ?? $state)
                    ->color(fn (string $state): string => match ($state) {
                        'ready' => 'success',
                        'canceled' => 'danger',
                        'awaiting_payment', 'in_preparation' => 'warning',
                        'approved' => 'primary',
                        'delivered' => 'gray',
                        default => 'gray',
                    }),
                TextEntry::make('pickup_code')
                    ->label('Código de retirada')
                    ->badge()
                    ->copyable()
                    ->placeholder('—')
                    ->helperText('É o que o aluno mostra no balcão. O prontuário não vale como prova: todo mundo sabe o do colega.'),
                TextEntry::make('total_value')
                    ->label('Total')
                    ->money('BRL'),
                TextEntry::make('payment_method')
                    ->label('Pagamento')
                    ->formatStateUsing(fn (?string $state): string => $state === 'pix' ? 'Pix pelo app' : 'No balcão')
                    ->placeholder('No balcão'),
                TextEntry::make('paid_at')
                    ->label('Pago em')
                    ->dateTime('d/m/Y · H:i')
                    ->placeholder('—'),
                TextEntry::make('created_at')
                    ->label('Feito em')
                    ->dateTime('d/m/Y · H:i'),
                TextEntry::make('delivered_at')
                    ->label('Retirado em')
                    ->dateTime('d/m/Y · H:i')
                    ->placeholder('Ainda no balcão'),
            ]);
    }
}
