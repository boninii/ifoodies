<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    /**
     * Cardápio completo, agrupado por categoria. O app espera um array de
     * categorias, cada uma com seus produtos. O campo `quantity` de cada
     * produto expõe o estoque (nome usado pelo front).
     */
    public function index(Request $request): JsonResponse
    {
        $categories = Category::with('products')->get()->map(fn (Category $category) => [
            'id' => $category->id,
            'name' => $category->name,
            'products' => $category->products->map(fn ($product) => [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'price' => $product->price,
                'image' => $this->imageUrl($request, $product->image),
                'quantity' => $product->stock,
            ]),
        ]);

        return response()->json($categories);
    }

    /**
     * URLs externas (seeds antigos) passam intactas; uploads do painel são
     * caminhos relativos em storage e viram URL completa usando o host DESTA
     * requisição — assim a imagem resolve tanto no navegador (localhost)
     * quanto no celular (IP da rede), sem depender de APP_URL.
     */
    private function imageUrl(Request $request, ?string $image): ?string
    {
        if ($image === null || $image === '') {
            return null;
        }

        if (str_starts_with($image, 'http://') || str_starts_with($image, 'https://')) {
            return $image;
        }

        return $request->getSchemeAndHttpHost().'/storage/'.ltrim($image, '/');
    }
}
