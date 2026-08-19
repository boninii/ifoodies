# 🍔 iFoodies

Plataforma completa da cantina de uma escola técnica (IFSP): app mobile para os
alunos pedirem, API para servir os dados e painel administrativo para a equipe
da cantina gerenciar produtos e pedidos.

Projeto originalmente desenvolvido para a cantina de uma escola técnica; hoje
segue como peça de portfólio.

## Estrutura (monorepo)

```
ifoodies/
├── mobile/   → App React Native / Expo (alunos fazem pedidos)
└── api/      → Backend Laravel + Filament (API + painel do staff)
```

Separados, mas juntos: cada parte tem seu próprio ciclo, mas vivem no mesmo repositório.

## 📱 mobile — App do aluno

React Native (Expo SDK 54) + TypeScript + Expo Router. Login, cardápio, carrinho,
pedidos e perfil. Identidade "Verde Vivo" (ver [DESIGN.md](DESIGN.md)):
verde kelly sobre superfícies mint, cards sem contorno, Unbounded em todos
os títulos + Figtree, filtro de categorias sobreposto, tema claro (padrão)
e escuro.

Ver [mobile/README.md](mobile/README.md) para detalhes e como rodar.

## 🛠️ api — Backend

Laravel 13 + Sanctum (auth por token) + Filament (painel administrativo do staff),
banco SQLite para desenvolvimento. Expõe os endpoints consumidos pelo app
(`/api/cantina/...`: login, registro, cardápio, pedidos, perfil, pagamento) e o
**painel da cantina em `/admin`** (Filament v5, identidade Verde Vivo):

- **Painel de Controle** — fila agora, prontos para retirada, vendas de hoje e
  produtos esgotados, atualizando a cada 15s.
- **Pedidos** — a fila do balcão: status trocado direto na tabela (o app do
  aluno reflete sozinho em segundos), itens e detalhes; sem criar nem apagar.
- **Produtos e Categorias** — CRUD completo com preço em R$, estoque com
  alerta de esgotado e imagem por URL.

Só entra quem tem `is_staff` (o aluno do app é barrado no login do painel).
Login de desenvolvimento: `admin@ifoodies.test` / `password`.

## Arquitetura

```
┌─────────────────────┐         ┌──────────────────────┐
│   mobile (Expo)     │         │  api /admin (Filament)│
│   alunos pedem      │         │  equipe gerencia      │
└──────────┬──────────┘         └──────────┬───────────┘
           │                               │
           └───────────────┬───────────────┘
                           ▼
                ┌─────────────────────┐
                │   api — Laravel     │
                │  auth, cardápio,    │
                │  pedidos, estoque   │
                └─────────────────────┘
```

Uma única fonte de verdade (o banco do Laravel), um único modelo de autenticação.
Produtos e pedidos vivem juntos, sem sincronização entre sistemas.
