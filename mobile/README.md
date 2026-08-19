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
- **Unbounded** + **Montserrat** (tipografia) e **@expo/vector-icons**
- Backend: **API em Laravel** (repositório separado)

### Identidade visual

O sistema completo está em **[DESIGN.md](../DESIGN.md)** — esta seção é só o
resumo. A marca é "Verde IF" (o produto é vendido para Institutos Federais):
verdes institucionais sobre papel quase-branco, cinza estrutural, e o
**pingo do "i"** do wordmark em verde-folha como gesto-assinatura (ele
reaparece só no símbolo e na etapa atual da trilha de pedido).

| Token | Hex | Uso |
|-------|-----|-----|
| Verde floresta | `#2D5320` | Cor de ação: botões, foco, trilha (8,9:1 com branco) |
| Floresta profunda | `#1F3A16` | Pressed e fim do degradê da marca |
| Verde folha | `#86C55A` | O pingo do "i". Selos e "Pronto!" — sempre tinta por cima |
| Lavagem / tinta verde | `#EFFAE7` / `#D3F1B9` | Superfícies tingidas: chips, total, pílula ativa |
| Papel | `#FDFFFB` | Fundo geral |
| Cinza traço | `#EAEAEA` | Bordas e traços estruturais |
| Tinta | `#2E332C` | Texto primário (~13:1) |
| Perda | `#C03A2F` | Exclusivo de perda: esgotado, cancelado, erro |

Regras que o código segue:

- **A Regra do Claro Primeiro.** O app abre SEMPRE no tema claro; o escuro é
  opt-in em Perfil → Aparência.
- **A Regra do Pingo.** O pingo verde-folha só existe no wordmark, no símbolo
  e na etapa atual da trilha.
- **A Regra dos Dois Voos.** Sombra só no CTA flutuante e em modal.
- **A Regra da Voz Única.** Unbounded no máximo duas vezes por tela; o resto
  é Montserrat.

A troca de aba é instantânea (sem animação, sem flash).

**Tipografia** — display + sans geométrica:

| Papel | Fonte | Tamanho |
|-------|-------|---------|
| Wordmark e título de tela | **Unbounded** (700) | 24–30 |
| Corpo, labels, inputs, botões, preços | **Montserrat** (400/600/700) | 11–20 |

A Unbounded é a voz da marca, usada com parcimônia; a Montserrat carrega toda
a interface, com numerais tabulares para que preço alinhe embaixo de preço.

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
