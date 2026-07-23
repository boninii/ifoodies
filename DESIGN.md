---
name: iFoodies
description: A cantina do IFSP lida como um quadro de horários — faixas regradas, blocos de cor chapada e nada flutuando.
colors:
  if-green: "#2F9E41"
  green-deep: "#1F6B2C"
  green-wash: "#E4F0E4"
  ground: "#F4F6F3"
  surface: "#FFFFFF"
  rule: "#C9D2C8"
  ink: "#14201A"
  ink-muted: "#4A5A50"
  struck: "#A63A28"
  pending: "#9A6B08"
  ground-dark: "#0E120F"
  surface-dark: "#171D18"
  rule-dark: "#2C352D"
  ink-dark: "#E8EFE7"
  ink-muted-dark: "#9AA89C"
  if-green-dark: "#3FB854"
  green-wash-dark: "#17251A"
typography:
  display:
    fontFamily: "Fraunces"
    fontSize: "30px"
    lineHeight: "34px"
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Fraunces"
    fontSize: "22px"
    lineHeight: "26px"
  title:
    fontFamily: "ElmsSans-SemiBold"
    fontSize: "16px"
    lineHeight: "20px"
  body:
    fontFamily: "ElmsSans"
    fontSize: "15px"
    lineHeight: "21px"
  label:
    fontFamily: "ElmsSans-SemiBold"
    fontSize: "11px"
    lineHeight: "13px"
    letterSpacing: "0.09em"
  numeral:
    fontFamily: "ElmsSans-SemiBold"
    fontSize: "16px"
    lineHeight: "20px"
    fontFeature: "tabular-nums"
rounded:
  none: "0px"
  chip: "2px"
  pill: "999px"
spacing:
  hair: "1px"
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.green-deep}"
    textColor: "{colors.surface}"
    rounded: "{rounded.chip}"
    padding: "16px 20px"
    height: "52px"
    typography: "{typography.label}"
  button-quiet:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.chip}"
    padding: "16px 20px"
    height: "52px"
  band-header:
    backgroundColor: "{colors.green-deep}"
    textColor: "{colors.surface}"
    rounded: "{rounded.none}"
    padding: "8px 16px"
    typography: "{typography.label}"
  block-row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "12px 16px"
  block-row-struck:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.none}"
    padding: "12px 16px"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "14px 16px"
    height: "52px"
---

# Design System: iFoodies

## Overview

**Creative North Star: "O Quadro de Horários"**

O aluno do IFSP já lê um quadro denso todo dia: a grade horária. Faixas
regradas, blocos de disciplina em cor chapada, códigos curtos, números
alinhados à direita e, quando algo cai, um risco por cima. É um objeto de
informação feito para ser entendido de relance, de pé, no corredor — que é
exatamente a situação em que este app é usado, e exatamente o que um app de
comida convencional não é.

O sistema recusa deliberadamente a gramática do app de delivery: cards brancos
flutuando com sombra e canto arredondado, chips horizontais de categoria,
laranja/vermelho de apetite, carrinho flutuante. Aqui a informação mora **dentro
de faixas**, não em cartões soltos. Nada levita: profundidade vem de fio de
régua e de tom, nunca de sombra. O canto é reto porque quadro de horário é
reto.

A cor institucional do IF não é um detalhe salpicado sobre fundo branco — ela
ocupa regiões inteiras (cabeçalhos de faixa, ações primárias, trilha de status).
O verde é o campo, não o enfeite.

**Key Characteristics:**
- Faixas regradas, não cards flutuantes
- Canto reto (0px) como regra, não exceção
- Zero sombra: profundidade por fio e por tom
- Numerais alinhados à direita, tabulares
- Estado indisponível comunicado por risco, como aula cancelada

## Colors

Paleta institucional: um verde de rede federal sobre papel frio levemente
esverdeado, com tinta quase preta e um único vermelho de tijolo para perda.

### Primary
- **Verde IFSP** (`{colors.if-green}`): a cor institucional oficial do manual de
  identidade visual do IFSP. Usada em blocos grandes, indicadores, trilha de
  status e texto **grande**. Contraste medido sobre branco: 3,49:1 — suficiente
  para grafismo e texto grande, insuficiente para corpo de texto.
- **Verde Profundo** (`{colors.green-deep}`): a variante que carrega texto.
  Cabeçalho de faixa, botão primário, qualquer campo verde com rótulo pequeno
  em branco. Contraste com branco: 6,58:1.
- **Lavagem Verde** (`{colors.green-wash}`): fundo de faixa selecionada e de
  linha somatória. Tom, não cor.

### Tertiary
- **Tijolo Riscado** (`{colors.struck}`): exclusivamente perda e indisponível —
  produto esgotado, pedido cancelado, erro destrutivo. Nunca decorativo.
- **Ocre de Espera** (`{colors.pending}`): estados intermediários que dependem
  de terceiros (aguardando pagamento, em preparo).

### Neutral
- **Papel Frio** (`{colors.ground}`): fundo geral. Levemente esverdeado e frio,
  nunca creme.
- **Fio de Régua** (`{colors.rule}`): a hairline que separa faixas e linhas. É o
  elemento estrutural mais usado do sistema.
- **Tinta** (`{colors.ink}`) e **Tinta Fraca** (`{colors.ink-muted}`): texto
  primário (15,3:1) e secundário (6,66:1) sobre o papel.

### Named Rules
**A Regra do Campo.** O verde institucional ocupa região inteira ou não aparece.
Borda verde de 3px em card branco, ícone verde solto e texto verde em corpo de
texto são violações — o verde é campo, não sotaque.

**A Regra do Verde Legível.** Texto pequeno nunca vai em `if-green`; vai em
`green-deep`. O verde claro só carrega tipografia a partir de 20px.

## Typography

**Display Font:** Fraunces
**Body Font:** Elms Sans
**Label Font:** Elms Sans SemiBold, caixa alta com tracking aberto

**Character:** A serifa variável carrega os momentos de identidade (nome das
telas, nome de produto), enquanto a Elms Sans faz todo o trabalho de interface:
rótulos, campos, botões e números. Numerais são tabulares para que preço embaixo
de preço alinhe como horário embaixo de horário.

### Hierarchy
- **Display** (Fraunces, 30/34): nome da tela, uma vez por tela.
- **Headline** (Fraunces, 22/26): nome de produto e título de modal.
- **Title** (Elms Sans SemiBold, 16/20): linhas de destaque e totais.
- **Body** (Elms Sans, 15/21): descrição, texto corrido.
- **Label** (Elms Sans SemiBold, 11/13, tracking 0.09em, CAIXA ALTA): cabeçalho
  de faixa, código, rótulo de campo, texto de botão.
- **Numeral** (Elms Sans SemiBold, 16/20, tabular): preço, quantidade, total.

### Named Rules
**A Regra do Numeral Tabular.** Todo número que possa aparecer empilhado sobre
outro usa numeral tabular e alinhamento à direita. Preço, quantidade e total
nunca dançam entre linhas.

**A Regra da Etiqueta.** Caixa alta com tracking é reservada a rótulo estrutural
(cabeçalho de faixa, código, botão). Nunca em frase, nunca em descrição.

## Layout

Faixa é a unidade de composição. Uma tela é uma pilha vertical de faixas
separadas por fio de 1px; dentro de cada faixa, linhas de 12–16px de padding
vertical e 16px lateral, coladas à borda da tela — a lista sangra de ponta a
ponta, sem margem lateral e sem cantos.

Escala de espaçamento: 4 / 8 / 12 / 16 / 24 / 40. Mais espaço acima de um título
do que abaixo dele. Grupos apertados por dentro, separação generosa por fora.

Alvo de toque mínimo de 48dp com 8dp entre alvos adjacentes, atendendo Android
(48dp) e iOS (44pt) com uma medida só. Conteúdo respeita safe area e insets de
teclado nos dois SOs.

## Elevation & Depth

**Este sistema não usa sombra.** Nenhuma. Profundidade é comunicada por fio de
régua (1px `{colors.rule}`) e por degrau tonal entre `ground` e `surface`. Um
elemento "acima" é um elemento com fundo mais claro no tema claro e mais claro
no escuro, delimitado por fio — nunca um retângulo levitando.

### Named Rules
**A Regra do Chão.** Nada levita. Se um elemento precisa parecer destacado, ele
ganha faixa própria, fio ou tom — nunca `shadowRadius`.

## Shapes

Canto reto (0px) é a regra: faixas, linhas, campos e blocos. O raio de 2px
aparece só em botões e chips, o suficiente para não cortar o dedo visualmente.
Pílula completa (999px) é reservada ao contador de quantidade, o único elemento
propositalmente "manipulável" do sistema.

Indisponível tem forma própria: linha com fundo rebaixado, texto em tinta fraca
e **risco horizontal** atravessando o nome — a citação direta da aula cancelada
no quadro.

## Components

### Buttons
- **Shape:** canto 2px, altura 52px, largura total da faixa quando primário.
- **Primary:** campo `green-deep` com texto branco em Label (caixa alta).
- **Pressed:** escurece o campo; sem escala, sem sombra.
- **Disabled:** campo `rule` com texto `ink-muted`, e o motivo dito por extenso
  ao lado — botão desabilitado sem explicação é proibido.
- **Quiet:** superfície branca com fio, para ações secundárias.

### Band header
Cabeçalho de faixa em `green-deep`, Label em caixa alta, e à direita a contagem
de itens da faixa em numeral. É o que dá o ritmo de "quadro" à tela.

### Block row
Linha de produto: nome em Headline, descrição em Body truncada em 2 linhas,
preço em Numeral alinhado à direita, e o contador de quantidade na direita
inferior. Fio de 1px separando da linha seguinte. Sem card, sem raio, sem
sombra.

### Inputs / Fields
Campo reto, fundo `surface`, fio de 1px. Foco troca o fio para `if-green` com
2px — sem glow. Erro troca o fio para `struck` e imprime a mensagem abaixo,
nomeando o problema e a recuperação.

### Status track
Componente-assinatura. O ciclo do pedido desenhado como faixas horizontais
consecutivas — aberto, aprovado, em preparo, pronto — em que as etapas
cumpridas são campo `if-green` cheio e as futuras são fio vazio. Cancelado
substitui a trilha inteira por uma faixa `struck` riscada.

## Do's and Don'ts

### Do:
- **Do** deixar a lista sangrar de ponta a ponta, sem margem lateral.
- **Do** usar `green-deep` sempre que houver texto pequeno sobre verde.
- **Do** comunicar esgotado com risco e tom rebaixado, não só com a palavra.
- **Do** alinhar todo numeral à direita, tabular.
- **Do** manter alvo de toque em 48dp, mesmo quando o desenho pede compacto.

### Don't:
- **Don't** usar sombra em nenhum elemento, em nenhum estado.
- **Don't** arredondar faixa, linha ou campo — canto reto é a assinatura.
- **Don't** colocar texto pequeno sobre `if-green`.
- **Don't** introduzir laranja ou vermelho de apetite: o único vermelho do
  sistema é perda.
- **Don't** empilhar card dentro de card; a hierarquia é faixa dentro de tela.
