<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

// Todas as rotas do app vivem sob /api/cantina (a base URL configurada no
// mobile em EXPO_PUBLIC_API_URL).
Route::prefix('cantina')->group(function () {
    // Públicas
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Autenticadas (Bearer token via Sanctum)
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);

        Route::get('/menu', [MenuController::class, 'index']);

        Route::post('/orders', [OrderController::class, 'store']);
        Route::get('/orders/user', [OrderController::class, 'userOrders']);

        Route::get('/profile', [ProfileController::class, 'show']);
        Route::patch('/profile', [ProfileController::class, 'update']);
        Route::post('/profile/change-password', [ProfileController::class, 'changePassword']);
    });
});
