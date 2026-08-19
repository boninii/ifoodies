<?php

namespace App\Filament\Resources\Orders\Schemas;

use App\Models\Product;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

/**
 * Pedido feito no balcão (aluno sem celular, por exemplo). Os itens seguem a
 * mesma regra do app: preço congelado e estoque baixado na criação — a
 * lógica vive em CreateOrder::handleRecordCreation.
 */
class OrderForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('user_id')
                    ->label('Aluno')
                    ->relationship('user', 'name')
                    ->searchable()
                    ->preload()
                    ->required(),
                Repeater::make('items')
                    ->label('Itens')
                    ->schema([
                        Select::make('product_id')
                            ->label('Produto')
                            ->options(
                                Product::query()
                                    ->where('stock', '>', 0)
                                    ->orderBy('name')
                                    ->pluck('name', 'id'),
                            )
                            ->searchable()
                            ->required()
                            ->distinct(),
                        TextInput::make('quantity')
                            ->label('Quantidade')
                            ->numeric()
                            ->minValue(1)
                            ->default(1)
                            ->required(),
                    ])
                    ->columns(2)
                    ->minItems(1)
                    ->addActionLabel('Adicionar item')
                    ->required(),
            ]);
    }
}
