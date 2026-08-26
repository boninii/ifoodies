<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    /**
     * Popula o cardápio com categorias e produtos típicos de uma cantina.
     * As imagens vêm do Unsplash (host externo) — o app renderiza pela URL.
     */
    public function run(): void
    {
        $menu = [
            'Salgados' => [
                ['Coxinha de Frango', 'Massa crocante recheada com frango desfiado.', 7.50, 40, 'photo-1585109649139-366815a0d713'],
                ['Pão de Queijo', 'Quentinho, feito com queijo minas.', 4.00, 60, 'photo-1596797038530-2c107229654b'],
                ['Empada de Palmito', 'Massa amanteigada com recheio cremoso de palmito.', 8.00, 25, 'photo-1568051243858-533a607809a5'],
                ['Enroladinho de Salsicha', 'Salsicha envolvida em massa dourada.', 6.50, 35, 'photo-1601050690597-df0568f70950'],
            ],
            'Lanches' => [
                ['X-Salada', 'Hambúrguer, queijo, alface e tomate no pão brioche.', 15.90, 20, 'photo-1568901346375-23c9450c58cd'],
                ['Misto Quente', 'Presunto e queijo na chapa.', 9.00, 30, 'photo-1528735602780-2552fd46c7af'],
                ['Cachorro-Quente', 'Salsicha, purê, batata palha e molho da casa.', 12.00, 22, 'photo-1612392062798-2dd6c9f2f1a5'],
            ],
            'Bebidas' => [
                ['Suco de Laranja', 'Natural, feito na hora (500ml).', 8.00, 50, 'photo-1621506289937-a8e4df240d0b'],
                ['Refrigerante Lata', 'Cola, guaraná ou limão (350ml).', 6.00, 80, 'photo-1622483767028-3f66f32aef97'],
                ['Água Mineral', 'Sem gás (500ml).', 3.50, 100, 'photo-1560023907-5f339617ea30'],
                ['Café Expresso', 'Grãos torrados na hora.', 4.50, 70, 'photo-1510591509098-f4fdc6d0ff04'],
            ],
            'Doces' => [
                ['Brigadeiro Gourmet', 'Chocolate belga com granulado.', 5.00, 45, 'photo-1558961363-fa8fdf82db35'],
                ['Fatia de Bolo de Cenoura', 'Com cobertura de chocolate.', 7.00, 18, 'photo-1621303837174-89787a7d4729'],
                ['Cookie de Chocolate', 'Crocante por fora, macio por dentro.', 6.00, 30, 'photo-1499636136210-6f4ee915583e'],
            ],
        ];

        foreach ($menu as $categoryName => $products) {
            $category = Category::firstOrCreate(['name' => $categoryName]);

            foreach ($products as [$name, $description, $price, $stock, $photoId]) {
                // Procura pelo nome e só cria o que falta: assim rodar o
                // seeder de novo não duplica o cardápio.
                Product::firstOrCreate(
                    ['name' => $name],
                    [
                        'category_id' => $category->id,
                        'description' => $description,
                        'price' => $price,
                        'stock' => $stock,
                        'image' => "https://images.unsplash.com/{$photoId}?w=300&q=80&auto=format&fit=crop",
                    ],
                );
            }
        }
    }
}
