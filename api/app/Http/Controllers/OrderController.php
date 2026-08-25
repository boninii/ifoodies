<?php

namespace App\Http\Controllers;

use App\Models\Order;
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
     * Lista os pedidos do usuário autenticado (mais recentes primeiro).
     *
     * A resposta é montada campo a campo, e não devolvendo o model inteiro.
     * Antes iam junto `user_id`, `payment_id` (id do gateway), timestamps do
     * pivot, `category_id` e `stock` de cada produto — nada disso cruzava
     * usuários, mas é superfície interna exposta sem motivo, e cresce sozinha
     * a cada coluna nova no banco.
     */
    public function userOrders(Request $request): JsonResponse
    {
        $orders = $request->user()->orders()
            ->with('products')
            ->latest()
            ->get()
            ->map(fn (Order $order): array => [
                'id' => $order->id,
                'status' => $order->status,
                'total_value' => $order->total_value,
                'created_at' => $order->created_at,
                // Só faz sentido enquanto serve para retirar; depois disso é
                // um código queimado que não precisa sair daqui.
                'pickup_code' => $order->awaitingPickup() ? $order->pickup_code : null,
                'delivered_at' => $order->delivered_at,
                'products' => $order->products->map(fn (Product $product): array => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'pivot' => [
                        'quantity' => $product->pivot->quantity,
                        'value_unitary' => $product->pivot->value_unitary,
                    ],
                ]),
            ]);

        return response()->json(['orders' => $orders]);
    }
}
