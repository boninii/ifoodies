<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    /**
     * Cria um pedido para o usuário autenticado a partir de uma lista de
     * { id, quantity }. Congela o preço unitário, baixa o estoque e calcula
     * o total — tudo dentro de uma transação.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'products' => ['required', 'array', 'min:1'],
            'products.*.id' => ['required', 'integer', 'exists:products,id'],
            'products.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $user = $request->user();

        $order = DB::transaction(function () use ($data, $user) {
            $order = $user->orders()->create([
                'status' => 'open',
                'total_value' => 0,
            ]);

            $total = 0;
            $attach = [];

            foreach ($data['products'] as $item) {
                $product = Product::lockForUpdate()->findOrFail($item['id']);

                if ($product->stock < $item['quantity']) {
                    throw ValidationException::withMessages([
                        'products' => "Estoque insuficiente para {$product->name}.",
                    ]);
                }

                $product->decrement('stock', $item['quantity']);

                $total += (float) $product->price * $item['quantity'];

                $attach[$product->id] = [
                    'quantity' => $item['quantity'],
                    'value_unitary' => $product->price,
                ];
            }

            $order->products()->attach($attach);
            $order->update(['total_value' => $total]);

            return $order;
        });

        return response()->json([
            'message' => 'Pedido criado com sucesso!',
            'order_id' => $order->id,
        ], 201);
    }

    /**
     * Lista os pedidos do usuário autenticado (mais recentes primeiro), com
     * os produtos e o pivot { quantity, value_unitary } que o app exibe.
     */
    public function userOrders(Request $request): JsonResponse
    {
        $orders = $request->user()->orders()
            ->with('products')
            ->latest()
            ->get();

        return response()->json(['orders' => $orders]);
    }
}
