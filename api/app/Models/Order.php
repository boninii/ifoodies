<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['user_id', 'status', 'total_value', 'payment_method', 'payment_id', 'paid_at'])]
class Order extends Model
{
    /**
     * Estados possíveis de um pedido. Devem casar com o STATUS_MAP do app
     * mobile (mobile/app/(tabs)/pedidos.tsx).
     */
    public const STATUSES = [
        'open' => 'Aberto',
        'awaiting_payment' => 'Aguardando pagamento',
        'approved' => 'Aprovado',
        'in_preparation' => 'Em preparação',
        'ready' => 'Pronto',
        'canceled' => 'Cancelado',
    ];

    protected function casts(): array
    {
        return [
            'total_value' => 'decimal:2',
            'paid_at' => 'datetime',
        ];
    }

    /**
     * Usuário dono do pedido.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Produtos do pedido, com quantidade e preço unitário no pivot.
     *
     * @return BelongsToMany<Product, $this>
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class)
            ->withPivot(['quantity', 'value_unitary'])
            ->withTimestamps();
    }
}
