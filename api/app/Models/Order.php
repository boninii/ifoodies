<?php

namespace App\Models;

use App\Events\OrderStatusChanged;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\DB;

// `pickup_code` fica de fora de propósito: quem o define é o hook de criação
// do próprio model, e ninguém deve poder escolher o código de um pedido.
#[Fillable(['user_id', 'status', 'total_value', 'payment_method', 'payment_id', 'paid_at', 'delivered_at', 'stock_returned_at'])]
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
        'delivered' => 'Retirado',
        'canceled' => 'Cancelado',
    ];

    /**
     * Alfabeto do código de retirada: sem 0/O e sem 1/I, que o aluno leria
     * errado e o balcão digitaria errado.
     */
    private const CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

    protected function casts(): array
    {
        return [
            'total_value' => 'decimal:2',
            'paid_at' => 'datetime',
            'delivered_at' => 'datetime',
            'stock_returned_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        // Todo pedido nasce com código, venha do app ou do balcão.
        static::creating(function (Order $order) {
            $order->pickup_code ??= static::generatePickupCode();
        });

        // Uma única porta para o tempo real: qualquer caminho que mude o
        // status (painel, API, webhook de pagamento, retirada) passa por
        // aqui e avisa o app do aluno.
        static::updated(function (Order $order) {
            if (! $order->wasChanged('status')) {
                return;
            }

            // Pedido cancelado devolve os itens para a prateleira. Antes
            // disso, cancelar sumia com o produto do cardápio para sempre:
            // o estoque baixava na criação e nada nunca o repunha.
            if ($order->status === 'canceled') {
                $order->restoreStock();
            }

            OrderStatusChanged::dispatch($order);
        });
    }

    /**
     * Código de 6 caracteres, aleatório e não sequencial. Repete o sorteio
     * na chance remota de colidir com um código ainda em uso.
     */
    public static function generatePickupCode(): string
    {
        do {
            $code = collect(range(1, 6))
                ->map(fn (): string => static::CODE_ALPHABET[random_int(0, strlen(static::CODE_ALPHABET) - 1)])
                ->join('');
        } while (static::where('pickup_code', $code)->exists());

        return $code;
    }

    /**
     * Devolve os itens deste pedido ao estoque.
     *
     * Seguro de chamar mais de uma vez: quem decide é a marca
     * `stock_returned_at`, gravada na mesma transação da devolução. Chamar
     * duas vezes não cria produto do nada.
     *
     * `saveQuietly` no fim de propósito — a marca não é mudança de status e
     * não deve disparar de novo o evento de tempo real.
     */
    public function restoreStock(): bool
    {
        if ($this->stock_returned_at !== null) {
            return false;
        }

        return DB::transaction(function (): bool {
            // Relê com trava: entre a checagem acima e este ponto, outro
            // processo pode ter devolvido.
            $atual = static::whereKey($this->getKey())->lockForUpdate()->first();

            if (! $atual || $atual->stock_returned_at !== null) {
                return false;
            }

            foreach ($this->products as $product) {
                Product::whereKey($product->id)->increment('stock', $product->pivot->quantity);
            }

            $this->stock_returned_at = now();
            $this->saveQuietly();

            return true;
        });
    }

    /**
     * Só faz sentido mostrar o código enquanto ele serve para alguma coisa.
     */
    public function awaitingPickup(): bool
    {
        return $this->status === 'ready';
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
