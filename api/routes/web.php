<?php

use Illuminate\Support\Facades\Route;

// Este domínio serve a API e o painel — a página de boas-vindas do Laravel
// não tem o que fazer aqui. Quem chega pela raiz é gente da cantina
// procurando o painel, então é para lá que vai.
Route::redirect('/', '/admin');
