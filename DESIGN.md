---
name: iFoodies
description: Marca de food service para Institutos Federais — verde vivo, superfícies mint e o pingo do "i".
colors:
  kelly: "#2B7E23"
  kelly-deep: "#1E5C18"
  folha: "#8BD264"
  lavagem: "#EAF6E2"
  tinta-mint: "#D3EDC2"
  papel-mint: "#F1F7EC"
  surface: "#FFFFFF"
  traco-suave: "#DCE9D4"
  ink: "#223021"
  ink-muted: "#5A6B53"
  perda: "#C74A38"
  pending: "#96650B"
  ground-dark: "#111A11"
  surface-dark: "#1B271B"
  traco-dark: "#2E3D2C"
  ink-dark: "#EAF2E5"
  ink-muted-dark: "#A5B49C"
  kelly-dark: "#7EC95B"
  lavagem-dark: "#22331F"
typography:
  display:
    fontFamily: "Unbounded"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: "30px"
    letterSpacing: "-0.4px"
  headline:
    fontFamily: "Unbounded"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: "24px"
  title:
    fontFamily: "Figtree"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: "21px"
  body:
    fontFamily: "Figtree"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "21px"
  label:
    fontFamily: "Figtree"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: "16px"
  numeral:
    fontFamily: "Figtree"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: "20px"
    fontFeature: "tabular-nums"
rounded:
  sm: "12px"
  md: "16px"
  lg: "24px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.kelly}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "16px 24px"
    height: "52px"
    typography: "{typography.label}"
  button-primary-pressed:
    backgroundColor: "{colors.kelly-deep}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
  button-quiet:
    backgroundColor: "{colors.lavagem}"
    textColor: "{colors.kelly}"
    rounded: "{rounded.pill}"
    padding: "16px 24px"
    height: "52px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "16px"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "14px 16px"
    height: "52px"
  badge-accent:
    backgroundColor: "{colors.folha}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
---

# Design System: iFoodies

## Overview

**Creative North Star: "Verde Vivo"**

O iFoodies é vendido para Institutos Federais — e IF é verde. Mas o verde
daqui é vivo e macio, não militar: kelly (#2B7E23) para ação, folha para
energia, e superfícies mint tingidas fazendo o trabalho estrutural. A
separação entre card e fundo é TONAL — fundo mint, card branco, sem contorno
— porque borda de 1px em tudo era o que deixava a interface dura.

O gesto-assinatura segue sendo o **pingo do "i"**: no wordmark "iFoodies", o
pingo é uma bola verde-folha. Ele reaparece exatamente em dois lugares — o
símbolo da marca e o marcador de etapa atual na trilha do pedido — e em
nenhum outro. A raridade é o que o mantém assinatura.

A geometria é macia: cards arredondados (24px) SEM contorno sobre papel
mint, ações em pílula, tonais no lugar de outlines. Profundidade é tom sobre
tom; sombra existe só no que sobrepõe a tela (modal e painel de filtro).

**Key Characteristics:**
- Verde kelly como cor de ação, verde-folha como energia
- Unbounded em TODOS os títulos (do display ao eyebrow), Figtree no resto
- Cards sem contorno flutuando em fundo mint; nada de sombra espalhada
- Tonal no lugar de outline: quiet, stepper e chips são preenchidos suaves
- Tema único: só o claro, sem troca nem leitura da preferência do sistema
- O pingo verde-folha só aparece onde é assinatura

## Colors

Paleta institucional transformada em produto: verdes vivos do IF sobre
superfícies mint, e vermelho exclusivo para perda.

### Primary
- **Verde Kelly** (`{colors.kelly}`): a cor de ação. Botões primários, foco,
  links, trilha de pedido, item ativo. Contraste com branco: 5,1:1 — carrega
  texto branco em qualquer tamanho.
- **Kelly Profundo** (`{colors.kelly-deep}`): estado pressionado e fim do
  degradê da marca (`#2B7E23 → #1B5716`, herói de auth e CTA).
- **Lavagem Mint** (`{colors.lavagem}`) e **Tinta Mint**
  (`{colors.tinta-mint}`): as superfícies tonais que substituem contornos —
  quiet button, stepper, chips, pílula ativa, painel de filtro.

### Secondary
- **Verde Folha** (`{colors.folha}`): o pingo do "i". Selo "Restam N", faixa
  "Pronto!", marcador de etapa atual. Nunca carrega texto branco — sempre
  tinta escura por cima (8,2:1).

### Tertiary
- **Perda** (`{colors.perda}`): exclusivo de perda — esgotado, cancelado,
  erro, sair da conta. Nunca decorativo.
- **Ocre de Espera** (`{colors.pending}`): estados que dependem de terceiros.

### Neutral
- **Papel Mint** (`{colors.papel-mint}`): fundo geral tingido — é ele que faz
  o card branco flutuar sem precisar de borda.
- **Traço Suave** (`{colors.traco-suave}`): borda esverdeada usada SÓ onde
  contorno é affordance (campos de formulário).
- **Tinta** (`{colors.ink}`) e **Tinta Fraca** (`{colors.ink-muted}`): texto
  primário (~14:1) e secundário (5,6:1) sobre superfície.

### Named Rules
**A Regra do Pingo.** O pingo verde-folha aparece no wordmark, no símbolo e
no marcador de etapa atual da trilha — e em nenhum outro lugar.

**A Regra da Folha Legível.** Verde-folha nunca carrega texto branco; sobre
folha, sempre tinta escura.

**A Regra do Tema Único.** O app tem um tema só, o claro. A paleta escura
segue definida em `tokens.ts`, mas não é oferecida — nada de troca nem de
seguir a configuração do aparelho.

## Typography

**Display Font:** Unbounded (600/700) — todos os títulos
**Body Font:** Figtree (400/700)

**Character:** A Unbounded é larga, arredondada e inconfundivelmente jovem —
e agora é a voz de TODOS os títulos, do display de 24 ao eyebrow de 10
(regra do usuário: título que era <16px desce 1px ao virar Unbounded). A
Figtree — geométrica de terminais macios que conversa com as curvas da
Unbounded — faz corpo, rótulos, botões e números, com numerais tabulares.

### Hierarchy
- **Display** (Unbounded 700, 24/30, -0.4): título da tela, uma vez por tela.
- **Headline** (Unbounded 600, 17/24): seções/categorias e nome no popup.
- **Eyebrow** (Unbounded 600, 10/14, +0.4): títulos mínimos — "Categorias",
  "Pedido", "Prontuário".
- **Title** (Figtree 700, 16/21): nome de produto no card, totais, links.
- **Body** (Figtree 400, 14/21): descrição e texto corrido.
- **Label** (Figtree 700, 13/17): texto de botão e rótulos. Sentence case.
- **Micro** (Figtree 700, 11/14): selos, contadores, rótulos de campo.
- **Numeral / NumeralLarge** (Figtree 700, 16 e 20, tabular): preço,
  quantidade, total, número do pedido.

### Named Rules
**A Regra da Voz de Título.** Se é título — de tela, de seção, de card de
dado — é Unbounded; era <16px, desce 1px. Se não é título, é Figtree.

## Layout

Cards sobre papel mint: cada unidade de conteúdo é um card arredondado
(24px) SEM contorno — o fundo tingido faz a separação. Cabeçalho de seção
com contador em pílula abre cada grupo.

No cardápio, o **filtro de categorias** abre pelo ícone no cabeçalho e o
painel **sobrepõe os cards** (não rouba largura da lista) — o aluno filtra
sem rolar o cardápio inteiro. O card de produto é enxuto (foto, nome, preço,
contador); descrição completa e detalhes moram no popup que abre ao tocar no
card, para o texto nunca ser cortado.

Escala de espaçamento: 4 / 8 / 12 / 16 / 24 / 40. Em telas largas o conteúdo
vive numa coluna central de **600px**. Alvo de toque mínimo de 48dp, safe
areas e insets respeitados nos dois SOs.

**Navegação instantânea:** a troca de aba não anima (animation: none) e o
contêiner de rota herda o fundo do tema — nada de slide nem flash branco
entre telas.

## Elevation & Depth

Tom sobre tom: papel → superfície branca → lavagem verde. Sombra existe em
um lugar: o que sobrepõe a tela — modal de detalhes e painel de filtro
(`shadow.modal`). Card e CTA não têm sombra.

### Named Rules
**A Regra do Voo Único.** Só o que sobrepõe a tela flutua (modal e painel
de filtro). No plano da página, nada levita — nem card, nem o CTA.

## Shapes

Raio 20px em cards, 14px em campos, imagens e itens do rail, 10px em selos
retangulares, e pílula completa (999px) em botões, chips e no contador. O
canto reto não existe no sistema.

## Components

### Buttons
- **Shape:** pílula, altura 52px.
- **Primary:** campo kelly, texto branco Figtree 700; pressionado escurece
  e encolhe para 0.97 — sem sombra, sem glow.
- **Quiet (tonal):** lavagem mint com texto kelly, sem borda; pressionado
  aprofunda para tinta mint. **Destructive:** perda.
- **Disabled:** campo traço-suave com o motivo dito por extenso ao lado.

### Cards
Superfície branca (verde-noite no escuro), raio 24px, SEM contorno. O card
de produto é tocável e abre o popup de detalhes; o de pedido pronto é o
único com aro — 2px verde-folha, porque ali o aro é informação.

### Product detail (popup)
Modal central (máx. 440px): foto grande, nome, preço em destaque, descrição
completa sem truncar, estoque e contador. Fecha por toque fora, botão ou
gesto de voltar.

### Category panel
Filtro de categorias do cardápio: abre pelo ícone de filtro no cabeçalho e
sobrepõe os cards, com scrim para fechar ao toque fora. Itens com ícone +
rótulo ("Tudo" + uma linha por categoria); o ativo é campo floresta com
texto branco. O botão de filtro fica verde quando há filtro aplicado.

### Inputs / Fields
Raio 16px, traço suave 1px (o único lugar onde borda é padrão — affordance
de formulário); foco troca para kelly 2px, erro para perda 2px com a
mensagem abaixo nomeando problema e recuperação.

### Badges
Pílulas Micro: folha/tinta para escassez ("Restam 3") e celebração; perda/
branco para "Esgotado"; lavagem/kelly para contagem neutra.

### Navigation (TabBar)
Quatro destinos com ícone + rótulo visível. O ativo senta numa pílula de
lavagem mint com ícone e texto kelly.

### Status track (assinatura)
Três segmentos-pílula (Aberto · Aprovado · Pronto) que preenchem de kelly
conforme o pedido avança; a
etapa atual carrega o pingo verde-folha. Cancelado vira pílula de perda.
"Pronto!" ganha faixa verde-folha com texto escuro no card do pedido.

### CTA do cardápio
Pílula com degradê kelly, sem sombra: rótulo à esquerda, total tabular à
direita. Aperto encolhe para 0.97.

## Do's and Don'ts

### Do:
- **Do** usar kelly como campo de ação e folha como energia rara.
- **Do** separar card de fundo por TOM (mint × branco), nunca por borda.
- **Do** manter o tema claro como único; não reintroduzir troca de tema.
- **Do** sentence case em botões e rótulos ("Enviar pedido", nunca "ENVIAR").
- **Do** numerais tabulares alinhados à direita em todo preço e total.
- **Do** manter o card de produto enxuto — descrição completa vive no popup.
- **Do** limitar o conteúdo a 600px em telas largas.

### Don't:
- **Don't** usar sombra fora do modal e do painel de filtro.
- **Don't** contornar cards, chips ou botões com borda — borda é só de campo
  de formulário (e do aro verde-folha do pedido pronto).
- **Don't** usar Unbounded fora de título, nem Figtree em título.
- **Don't** colocar texto branco sobre verde-folha.
- **Don't** usar o pingo fora do wordmark, do símbolo e da etapa atual.
- **Don't** animar a troca de aba — a navegação é instantânea.
- **Don't** truncar descrição sem oferecer o popup com o texto completo.
- **Don't** usar Unbounded em corpo, rótulo ou número.
