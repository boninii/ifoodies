<?php

use Illuminate\Support\Facades\Broadcast;

/**
 * Cada aluno escuta só a própria fila. O canal é privado: o Echo pede
 * autorização em /api/broadcasting/auth com o Bearer token, e é este
 * callback que decide.
 */
Broadcast::channel('orders.{userId}', function ($user, int $userId): bool {
    return (int) $user->id === $userId;
});
