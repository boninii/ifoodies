<?php

namespace App\Filament\Resources\Orders\Pages;

use App\Filament\Resources\Orders\OrderResource;
use App\Models\Order;
use App\Models\Product;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CreateOrder extends CreateRecord
{
    protected static string $resource = OrderResource::class;

    /**
     * Mesma regra do app (OrderController@store): congela o preço unitário,
     * baixa o estoque e soma o total, tudo numa transação. Estoque
     * insuficiente aborta com a mensagem no próprio formulário.
     */
    protected function handleRecordCreation(array $data): Model
    {
        return DB::transaction(function () use ($data): Order {
            $order = Order::create([
                'user_id' => $data['user_id'],
                'status' => 'open',
                'total_value' => 0,
            ]);

            $total = 0;
            $attach = [];

            foreach ($data['items'] as $item) {
                $product = Product::lockForUpdate()->findOrFail($item['product_id']);
                $quantity = (int) $item['quantity'];

                if ($product->stock < $quantity) {
                    throw ValidationException::withMessages([
                        'data.items' => "Estoque insuficiente para {$product->name} (restam {$product->stock}).",
                    ]);
                }

                $product->decrement('stock', $quantity);

                $total += (float) $product->price * $quantity;

                $attach[$product->id] = [
                    'quantity' => $quantity,
                    'value_unitary' => $product->price,
                ];
            }

            $order->products()->attach($attach);
            $order->update(['total_value' => $total]);

            return $order;
        });
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
