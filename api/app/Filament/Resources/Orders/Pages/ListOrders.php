<?php

namespace App\Filament\Resources\Orders\Pages;

use App\Actions\ConfirmOrderPickup;
use App\Filament\Resources\Orders\OrderResource;
use App\Models\Order;
use Filament\Actions\Action;
use Filament\Actions\CreateAction;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;
use Illuminate\Validation\ValidationException;

class ListOrders extends ListRecords
{
    protected static string $resource = OrderResource::class;

    protected function getHeaderActions(): array
    {
        return [
            $this->confirmarRetiradaAction(),
            CreateAction::make(),
        ];
    }

    /**
     * O gesto principal do balcão: o aluno chega, fala o código, o atendente
     * digita e o pedido é encerrado.
     *
     * O código é o que prova que o pedido é dele — o prontuário não serve,
     * porque é público e qualquer um saberia o do colega.
     */
    private function confirmarRetiradaAction(): Action
    {
        return Action::make('confirmarRetirada')
            ->label('Registrar retirada')
            ->modalHeading('Registrar retirada')
            ->modalDescription('Peça ao aluno o código de 6 caracteres que aparece no pedido dele.')
            ->modalSubmitActionLabel('Confirmar retirada')
            ->modalWidth('md')
            ->schema([
                TextInput::make('code')
                    ->label('Código do aluno')
                    ->required()
                    // Sem regra de tamanho aqui de propósito: ela rodaria
                    // ANTES do trim e recusaria um código colado com espaço.
                    // Quem julga o código é ConfirmOrderPickup, que aceita
                    // maiúscula/minúscula e responde em português.
                    ->maxLength(20)
                    ->autofocus()
                    ->placeholder('Ex.: K7QF2M')
                    ->extraInputAttributes([
                        'style' => 'text-transform:uppercase;letter-spacing:.35em;font-size:1.25rem;text-align:center;',
                        'autocomplete' => 'off',
                    ]),
            ])
            ->action(function (array $data, ConfirmOrderPickup $confirmarRetirada): void {
                try {
                    $order = $confirmarRetirada($data['code']);
                } catch (ValidationException $e) {
                    Notification::make()
                        ->danger()
                        ->title('Retirada não registrada')
                        ->body($e->validator->errors()->first('code'))
                        ->persistent()
                        ->send();

                    return;
                }

                Notification::make()
                    ->success()
                    ->title('Retirada registrada')
                    ->body(sprintf(
                        'Pedido #%s — %s. Pode entregar.',
                        str_pad((string) $order->id, 3, '0', STR_PAD_LEFT),
                        $order->user->name,
                    ))
                    ->send();
            });
    }

    /**
     * O balcão enxerga a pressão da fila já no título da página.
     */
    public function getTitle(): string
    {
        $prontos = Order::where('status', 'ready')->count();

        return $prontos > 0 ? "Pedidos ({$prontos} prontos)" : 'Pedidos';
    }
}
