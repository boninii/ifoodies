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

- **React Native 0.81** + **Expo SDK 54**
- **Expo Router** (navegação baseada em arquivos)
- **TypeScript** (modo `strict`)
- **AsyncStorage** para persistência local do token
- **Unbounded** + **Figtree** (tipografia) e **@expo/vector-icons**
- Backend: **API em Laravel** (repositório separado)

### Identidade visual

O sistema completo está em **[DESIGN.md](../DESIGN.md)** — esta seção é só o
resumo. A marca é "Verde Vivo" (o produto é vendido para Institutos
Federais, e IF é verde — mas um verde vivo e macio, não militar): kelly para
ação sobre superfícies mint tingidas, cards SEM contorno (a separação é
tonal), e o **pingo do "i"** do wordmark em verde-folha como
gesto-assinatura.

| Token | Hex | Uso |
|-------|-----|-----|
| Verde kelly | `#2B7E23` | Cor de ação: botões, foco, trilha (5,1:1 com branco) |
| Kelly profundo | `#1E5C18` | Pressed e fim do degradê da marca |
| Verde folha | `#8BD264` | O pingo do "i". Selos e "Pronto!" — sempre tinta por cima |
| Lavagem / tinta mint | `#EAF6E2` / `#D3EDC2` | Tonais que substituem contornos: quiet, stepper, chips |
| Papel mint | `#F1F7EC` | Fundo geral tingido — faz o card flutuar sem borda |
| Traço suave | `#DCE9D4` | Borda só onde é affordance (campos de formulário) |
| Tinta | `#223021` | Texto primário (~14:1) |
| Perda | `#C74A38` | Exclusivo de perda: esgotado, cancelado, erro |

Regras que o código segue:

- **A Regra do Claro Primeiro.** O app abre SEMPRE no tema claro; o escuro é
  opt-in em Perfil → Aparência.
- **A Regra do Pingo.** O pingo verde-folha só existe no wordmark, no símbolo
  e na etapa atual da trilha.
- **A Regra do Voo Único.** Sombra só no que sobrepõe a tela (modal e
  painel de filtro); no plano da página nada levita.
- **A Regra da Voz de Título.** Todo título é Unbounded (era <16px, desce
  1px — daí o eyebrow de 10px); o que não é título é Figtree.
- **A Regra do Tom.** Card não tem borda — a separação é fundo mint × card
  branco. Borda só em campo de formulário e no aro do pedido pronto.

A troca de aba é instantânea (sem animação, sem flash).

**Tipografia** — display + sans geométrica:

| Papel | Fonte | Tamanho |
|-------|-------|---------|
| Todos os títulos (tela, seção, eyebrow) | **Unbounded** (600/700) | 10–30 |
| Corpo, labels, inputs, botões, preços | **Figtree** (400/700) | 11–20 |

A Unbounded é a voz de todos os títulos; a Figtree — geométrica de terminais
macios — carrega a interface, com numerais tabulares para que preço alinhe
embaixo de preço.

---

## 🚀 Como rodar

```bash
# 1. Instale as dependências
npm install

# 2. Suba o app (em dev o host da API é descoberto sozinho)
npx expo start
```

Abra no **Expo Go** (Android/iOS), num **emulador** ou no **navegador** (`w`).

### Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `EXPO_PUBLIC_API_URL` | URL base da API **em build de produção**. Em desenvolvimento o app descobre o host sozinho (web: hostname da página; Expo Go: IP do Metro) |

---

## 📂 Estrutura

```
app/
├── (tabs)/            # telas: login, register, produtos, carrinho, pedidos, perfil
├── auth/              # storage do token + AuthProvider (contexto de sessão)
├── hooks/             # useAuth
└── +not-found.tsx
components/ui/
├── Screen.tsx         # casca das telas (Screen autenticada + AuthScreen)
├── TabBar.tsx         # navegação inferior, 4 destinos com rótulo
├── StatusTrack.tsx    # trilha do pedido em pílulas, com o pingo verde-folha
└── primitives.tsx     # Rule, BandHeader, Button, Field, Stepper, Badge…
theme/
├── tokens.ts          # paletas clara/escura, escala, tipografia
├── preferences.tsx    # preferência de tema (claro por padrão), persistida
└── useTheme.ts        # tema resolvido a partir da preferência do usuário
services/
├── api.ts             # cliente HTTP único (host automático em dev, token, 401)
└── payments.ts        # Pix via AbacatePay (preparado; desligado por flag)
assets/                # imagens (as fontes vêm por pacote)
```

---

## 🗺️ Próximos passos

- [ ] Migrar o token de `AsyncStorage` para `expo-secure-store`.
- [ ] Ligar o pagamento Pix via AbacatePay (backend PREPARADO e desligado:
      falta `ABACATEPAY_API_KEY` + `ABACATEPAY_WEBHOOK_SECRET` no `.env` da
      API e virar `ABACATEPAY_ENABLED=true`; no app, `PAYMENTS_ENABLED` em
      `services/payments.ts`).
- [ ] Avisar o aluno quando o pedido fica `ready` (push ou polling).
- [ ] Skeleton nos carregamentos, no lugar do texto "Carregando…".
- [ ] Testes automatizados.
