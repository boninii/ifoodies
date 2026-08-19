<?php

namespace App\Filament\Resources\Products\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class ProductForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('category_id')
                    ->label('Categoria')
                    ->relationship('category', 'name')
                    ->required(),
                TextInput::make('name')
                    ->label('Nome')
                    ->required()
                    ->maxLength(255),
                Textarea::make('description')
                    ->label('Descrição')
                    ->helperText('Aparece no cardápio do app; o texto completo abre no detalhe do produto.')
                    ->rows(3)
                    ->required(),
                TextInput::make('price')
                    ->label('Preço')
                    ->required()
                    ->numeric()
                    ->minValue(0)
                    ->prefix('R$'),
                // O app consome a imagem por URL (CDN/host externo) — não há
                // upload de arquivo neste projeto.
                TextInput::make('image')
                    ->label('URL da imagem')
                    ->url()
                    ->placeholder('https://…')
                    ->helperText('Cole o endereço de uma foto quadrada do produto.'),
                TextInput::make('stock')
                    ->label('Estoque')
                    ->helperText('O app usa este número como quantidade máxima por pedido; zero aparece como esgotado.')
                    ->required()
                    ->numeric()
                    ->minValue(0)
                    ->default(0),
            ]);
    }
}
