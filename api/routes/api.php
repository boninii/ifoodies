<?php

use App\Http\Controllers\AbacatePayWebhookController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

// Todas as rotas do app vivem sob /api/cantina (a base URL configurada no
// mobile em EXPO_PUBLIC_API_URL).
Route::prefix('cantina')->group(function () {
    // Públicas. O throttle:auth é apertado (5/min por e-mail+IP) porque são
    // as únicas portas onde se adivinha senha ou se cria conta em massa.
    Route::middleware('throttle:auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    });

    // Autenticadas (Bearer token via Sanctum)
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);

        Route::get('/menu', [MenuController::class, 'index']);

        Route::post('/orders', [OrderController::class, 'store']);
        Route::get('/orders/user', [OrderController::class, 'userOrders']);

        // Pagamento Pix via AbacatePay (503 enquanto a integração está desligada)
        Route::post('/orders/{order}/pay', [PaymentController::class, 'store']);
        Route::get('/orders/{order}/payment', [PaymentController::class, 'show']);

        Route::get('/profile', [ProfileController::class, 'show']);
        Route::patch('/profile', [ProfileController::class, 'update']);
        Route::post('/profile/change-password', [ProfileController::class, 'changePassword']);
    });
});

// Webhook da AbacatePay — fora do grupo cantina e sem auth de usuário:
// quem autentica é o webhookSecret validado no controller.
Route::post('/webhooks/abacatepay', AbacatePayWebhookController::class);
