<?php

/**
 * Ajustes de produto da cantina.
 */
return [
    /*
    |--------------------------------------------------------------------------
    | Domínios de e-mail aceitos no cadastro
    |--------------------------------------------------------------------------
    |
    | Vazio = qualquer e-mail entra, que é o padrão para desenvolvimento e
    | portfólio. Numa instalação real de um IF, preencher com os domínios da
    | instituição é a defesa mais eficaz contra criação de contas em massa —
    | mais do que captcha, porque não depende de terceiro e não erra.
    |
    | Exemplo: REGISTER_EMAIL_DOMAINS=aluno.ifsp.edu.br,ifsp.edu.br
    |
    | Limitar cadastro por IP foi descartado de propósito: a escola inteira
    | sai por um IP só, e uma turma se cadastrando junto seria bloqueada.
    |
    */
    'register_email_domains' => array_values(array_filter(array_map(
        'trim',
        explode(',', (string) env('REGISTER_EMAIL_DOMAINS', '')),
    ))),

    /*
    |--------------------------------------------------------------------------
    | Recuperação de senha
    |--------------------------------------------------------------------------
    |
    | Só faz sentido oferecer se o servidor consegue mandar e-mail. Sem isso, o
    | aluno pede o código e espera para sempre por algo que nunca sai — e a
    | tela ainda diz que chegou.
    |
    | Ligada quando existe SMTP configurado, ou quando alguém força pela
    | variável (útil em desenvolvimento, onde o código cai no log e serve
    | perfeitamente para testar o fluxo).
    |
    */
    'password_recovery' => (bool) env(
        'PASSWORD_RECOVERY',
        filled(env('MAIL_HOST')) || env('MAIL_MAILER') === 'log',
    ),
];
