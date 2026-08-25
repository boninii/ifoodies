<?php

namespace App\Filament\Resources\Products\Schemas;

use Filament\Forms\Components\FileUpload;
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
                // Upload para storage/app/public/produtos; a API monta a URL
                // completa para o app. Produtos antigos com URL externa
                // continuam válidos (a API preserva http/https).
                FileUpload::make('image')
                    ->label('Foto do produto')
                    ->image()
                    // Lista explicita em vez de confiar so no ->image(): o
                    // arquivo vai para um diretorio servido diretamente.
                    ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                    ->disk('public')
                    ->directory('produtos')
                    ->visibility('public')
                    ->maxSize(2048)
                    ->imageEditor()
                    ->helperText('Prefira foto quadrada; máximo de 2 MB.'),
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
