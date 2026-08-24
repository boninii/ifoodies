<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    /**
     * Dados do perfil do usuário autenticado.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            // O id identifica o canal privado que o app assina para receber
            // as mudanças de status em tempo real (orders.{id}).
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'student_id' => $user->student_id,
        ]);
    }

    /**
     * Atualiza nome e e-mail. O prontuário não é editável pelo app.
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
        ]);

        $user->update($data);

        return response()->json(['success' => 'Dados atualizados com sucesso!']);
    }

    /**
     * Troca a senha, exigindo a senha atual correta, e derruba as outras
     * sessões.
     *
     * Sem a revogação, trocar a senha não adiantava nada contra quem já
     * tivesse um token roubado: o token antigo continuava valendo.
     */
    public function changePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'old_password' => ['required', 'string'],
            'password' => ['required', 'string', Password::min(8), 'confirmed'],
        ]);

        $user = $request->user();

        if (! Hash::check($data['old_password'], $user->password)) {
            throw ValidationException::withMessages([
                'old_password' => 'A senha atual está incorreta.',
            ]);
        }

        $user->update(['password' => $data['password']]);

        // Todos os tokens menos o deste aparelho, que acabou de se provar.
        $user->tokens()
            ->whereKeyNot($request->user()->currentAccessToken()->getKey())
            ->delete();

        return response()->json(['success' => 'Senha atualizada com sucesso!']);
    }
}
