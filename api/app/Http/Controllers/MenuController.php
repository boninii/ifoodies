<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\JsonResponse;

class MenuController extends Controller
{
    /**
     * Cardápio completo, agrupado por categoria. O app espera um array de
     * categorias, cada uma com seus produtos. O campo `quantity` de cada
     * produto expõe o estoque (nome usado pelo front).
     */
    public function index(): JsonResponse
    {
        $categories = Category::with('products')->get()->map(fn (Category $category) => [
            'id' => $category->id,
            'name' => $category->name,
            'products' => $category->products->map(fn ($product) => [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'price' => $product->price,
                'image' => $product->image,
                'quantity' => $product->stock,
            ]),
        ]);

        return response()->json($categories);
    }
}
