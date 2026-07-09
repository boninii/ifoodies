<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Cadastra um novo aluno e já devolve um token de acesso.
     *
     * Erros de validação saem no formato { errors: { campo: [...] } },
     * consumido pela tela de registro do app.
     */
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'student_id' => ['required', 'string', 'max:255', 'unique:users,student_id'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $user = User::create($data);

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'message' => 'Cadastro realizado com sucesso!',
            'token' => $token,
        ], 201);
    }

    /**
     * Autentica por e-mail e senha. Em caso de falha devolve { error }
     * (formato esperado pela tela de login) com status 422 — evita disparar
     * o handler global de 401 do app.
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'error' => 'E-mail ou senha inválidos.',
            ], 422);
        }

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'message' => 'Login realizado com sucesso!',
            'token' => $token,
        ]);
    }

    /**
     * Revoga o token atual (logout no dispositivo).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sessão encerrada.']);
    }
}
