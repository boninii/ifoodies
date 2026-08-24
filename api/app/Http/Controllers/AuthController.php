<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Notifications\PasswordResetCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    /** Por quanto tempo o código de recuperação vale. */
    private const RESET_CODE_MINUTES = 15;

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
            'password' => ['required', 'string', Password::min(8), 'confirmed'],
        ]);

        $user = User::create($data);

        return response()->json([
            'message' => 'Cadastro realizado com sucesso!',
            'token' => $this->issueToken($user, $request),
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

        // O Hash::check roda mesmo sem usuário (contra um hash descartável)
        // para que a resposta demore o mesmo tanto nos dois casos e o tempo
        // não denuncie quais e-mails existem.
        $hash = $user?->password ?? Hash::make('placeholder-para-tempo-constante');

        if (! Hash::check($credentials['password'], $hash) || ! $user) {
            return response()->json([
                'error' => 'E-mail ou senha inválidos.',
            ], 422);
        }

        return response()->json([
            'message' => 'Login realizado com sucesso!',
            'token' => $this->issueToken($user, $request),
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

    /**
     * Envia um código de recuperação por e-mail.
     *
     * Responde a mesma coisa exista ou não a conta: contar que um e-mail
     * está cadastrado já é vazar informação.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'string', 'email'],
        ]);

        $resposta = response()->json([
            'message' => 'Se este e-mail estiver cadastrado, o código chegará em instantes.',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user) {
            return $resposta;
        }

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Guardado com hash: quem ler o banco não consegue usar o código.
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            ['token' => Hash::make($code), 'created_at' => now()],
        );

        $user->notify(new PasswordResetCode($code, self::RESET_CODE_MINUTES));

        return $resposta;
    }

    /**
     * Troca a senha a partir do código recebido por e-mail e derruba todas
     * as sessões antigas — inclusive a de quem porventura tenha causado a
     * necessidade da troca.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'string', 'email'],
            'code' => ['required', 'string'],
            'password' => ['required', 'string', Password::min(8), 'confirmed'],
        ]);

        $registro = DB::table('password_reset_tokens')->where('email', $data['email'])->first();
        $user = User::where('email', $data['email'])->first();

        $expirado = $registro
            && Carbon::parse($registro->created_at)->addMinutes(self::RESET_CODE_MINUTES)->isPast();

        if (! $registro || ! $user || $expirado || ! Hash::check($data['code'], $registro->token)) {
            return response()->json([
                'error' => 'Código inválido ou expirado. Peça um novo.',
            ], 422);
        }

        $user->update(['password' => $data['password']]);
        $user->tokens()->delete();

        DB::table('password_reset_tokens')->where('email', $user->email)->delete();

        return response()->json([
            'message' => 'Senha redefinida! Entre com a senha nova.',
            'token' => $this->issueToken($user, $request),
        ]);
    }

    /**
     * Um token por dispositivo, com validade. A expiração real vem de
     * config/sanctum.php; o nome só ajuda a identificar a sessão.
     */
    private function issueToken(User $user, Request $request): string
    {
        $device = $request->userAgent() ? substr($request->userAgent(), 0, 60) : 'mobile';

        return $user->createToken($device)->plainTextToken;
    }
}
