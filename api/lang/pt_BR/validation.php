<?php

/**
 * Mensagens de validação em pt-BR. Cobre as regras usadas pela API do app
 * (registro, login, perfil e pedidos). O app exibe estas mensagens direto
 * ao usuário, então elas precisam soar naturais em português.
 */
return [
    'accepted' => 'O campo :attribute deve ser aceito.',
    'array' => 'O campo :attribute deve ser uma lista.',
    'confirmed' => 'A confirmação de :attribute não confere.',
    'email' => 'O campo :attribute deve ser um endereço de e-mail válido.',
    'exists' => ':attribute selecionado é inválido.',
    'integer' => 'O campo :attribute deve ser um número inteiro.',
    'max' => [
        'string' => 'O campo :attribute não pode ter mais que :max caracteres.',
        'numeric' => 'O campo :attribute não pode ser maior que :max.',
        'array' => 'O campo :attribute não pode ter mais que :max itens.',
    ],
    'min' => [
        'string' => 'O campo :attribute deve ter pelo menos :min caracteres.',
        'numeric' => 'O campo :attribute deve ser no mínimo :min.',
        'array' => 'O campo :attribute deve ter pelo menos :min itens.',
    ],
    'required' => 'O campo :attribute é obrigatório.',
    'string' => 'O campo :attribute deve ser um texto.',
    'unique' => 'Este :attribute já está em uso.',

    /*
    |--------------------------------------------------------------------------
    | Nomes amigáveis dos campos
    |--------------------------------------------------------------------------
    */
    'attributes' => [
        'name' => 'nome',
        'email' => 'e-mail',
        'student_id' => 'prontuário',
        'password' => 'senha',
        'old_password' => 'senha atual',
        'products' => 'produtos',
    ],
];
