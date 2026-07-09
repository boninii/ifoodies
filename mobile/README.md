# 🍔 iFoodies — IFSP

Aplicativo mobile para a cantina de uma escola técnica. Os alunos fazem login,
navegam pelo cardápio, montam o pedido em um carrinho e acompanham o histórico
de compras pelo celular, sem fila e sem papel.

> Projeto originalmente desenvolvido para a cantina de uma escola técnica (IFSP).
> Hoje segue como peça de portfólio e laboratório de boas práticas.

---

## 📱 Funcionalidades

- **Autenticação** — cadastro e login de alunos com token JWT.
- **Cardápio** — produtos agrupados por categoria, com preço, descrição e estoque.
- **Carrinho** — adicionar, editar quantidade e remover itens; total calculado em tempo real.
- **Pedidos** — finalização do pedido e histórico com status (aberto, em preparação, pronto…).
- **Perfil** — edição de dados e troca de senha.
- **Sessão persistente** — token guardado no dispositivo; logout automático quando expira (401).

---

## 🧱 Arquitetura

Este repositório é o **app mobile**. Ele é uma das pontas de um sistema maior:

```
┌─────────────────────┐         ┌──────────────────────┐
│  App Mobile (este)  │         │  Painel da Cantina   │
│  React Native /Expo │         │  Laravel + Filament  │
│  → alunos pedem     │         │  → equipe gerencia   │
└──────────┬──────────┘         └──────────┬───────────┘
           │                               │
           └───────────────┬───────────────┘
                           ▼
                ┌─────────────────────┐
                │   API — Laravel     │
                │  (auth, cardápio,   │
                │  pedidos, estoque)  │
                └─────────────────────┘
```

**Decisão de arquitetura:** o painel da equipe da cantina usa **Laravel + Filament**
em vez de um app desktop próprio ou um WordPress headless. Como pedidos, estoque e
usuários já vivem no banco do Laravel, o Filament gera o admin CRUD lendo as mesmas
tabelas, sem sincronização entre sistemas, com uma única fonte de verdade e um único
modelo de autenticação.

---

## 🛠️ Stack

- **React Native 0.79** + **Expo SDK 53**
- **Expo Router** (navegação baseada em arquivos)
- **TypeScript** (modo `strict`)
- **AsyncStorage** para persistência local do token
- **Fraunces** + **Poppins** (tipografia) e **@expo/vector-icons**
- Backend: **API em Laravel** (repositório separado)

### Identidade visual

A cor verde é o núcleo da marca e guia toda a interface:

| Token | Hex | Uso |
|-------|-----|-----|
| Verde da marca | `#32984D` | Botões, destaques, ícones ativos, divisórias |
| Azul | `#1434A4` | Ação de troca de senha |
| Vermelho | `#D54A4A` | Ações destrutivas (excluir, sair) |
| Fundo | `#F2F2F2` | Background geral |
| Texto secundário | `#666666` | Labels, descrições |

> As listas usam zebra com tints do verde da marca (`rgba(50,152,77,…)`):
> linhas pares a 10% e ímpares a 22% de opacidade.

**Tipografia** — pareamento serif + sans:

| Papel | Fonte | Tamanho |
|-------|-------|---------|
| Marca, títulos de tela, categorias e nomes de produto | **Fraunces** (serif) | 16–26 |
| Corpo, labels, inputs, botões, preços | **Poppins** (sans) | 13–14 |

O serif dá o tom de "cardápio"; o Poppins pequeno carrega toda a interface.

---

## 🚀 Como rodar

```bash
# 1. Instale as dependências
npm install

# 2. Configure o ambiente
cp .env.example .env   # ajuste EXPO_PUBLIC_API_URL se necessário

# 3. Suba o app
npx expo start
```

Abra no **Expo Go** (Android/iOS), num **emulador** ou no **navegador** (`w`).

### Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `EXPO_PUBLIC_API_URL` | URL base da API Laravel (ex.: `https://.../api/cantina`) |

---

## 📂 Estrutura

```
app/
├── (tabs)/            # telas: login, register, produtos, carrinho, pedidos, perfil
├── auth/              # storage do token + AuthProvider (contexto de sessão)
├── hooks/             # useAuth
└── +not-found.tsx
components/
├── cabeçalho/         # Header
├── rodape/            # Footer (navegação inferior)
└── ui/                # Layout (casca: header + scroll + footer)
services/
└── api.ts             # cliente HTTP único (base URL, token, tratamento de 401)
assets/                # fontes e imagens
```

---

## 🗺️ Próximos passos

- [ ] Migrar o token de `AsyncStorage` para `expo-secure-store`.
- [ ] Botão de visibilidade de senha no modal de troca de senha.
- [ ] Skeleton/loading states durante as chamadas de rede.
- [ ] Refino visual: unificar os dois tons de verde, alvos de toque ≥ 44px.
- [ ] Testes automatizados.
