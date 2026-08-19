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
pedidos e perfil. Identidade "Verde IF" (ver [DESIGN.md](DESIGN.md)): verdes
institucionais + cinza, Unbounded + Montserrat, cards arredondados, filtro
de categorias sobreposto, tema claro (padrão) e escuro.

Ver [mobile/README.md](mobile/README.md) para detalhes e como rodar.

## 🛠️ api — Backend

Laravel 13 + Sanctum (auth por token) + Filament (painel administrativo do staff),
banco SQLite para desenvolvimento. Expõe os endpoints consumidos pelo app
(`/api/cantina/...`: login, registro, cardápio, pedidos, perfil) e um admin em
`/admin` para a equipe cadastrar produtos e acompanhar pedidos.

> **Status:** em construção. O esqueleto Laravel + Sanctum está pronto; os
> modelos de domínio (produtos, categorias, pedidos), os controllers da API,
> os seeders e os recursos do Filament estão sendo implementados.

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
