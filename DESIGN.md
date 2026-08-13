---
name: iFoodies
description: Marca própria de food service universitário — açaí, manga e o pingo do "i".
colors:
  acai: "#6C2BD9"
  acai-deep: "#4A1FA3"
  acai-mist: "#F1EAFE"
  manga: "#FFB300"
  lavender-paper: "#F7F5FC"
  surface: "#FFFFFF"
  stroke: "#E6E1F2"
  plum-ink: "#191331"
  ink-muted: "#5C5478"
  morango: "#D6284A"
  pending: "#9A6108"
  ground-dark: "#120C1E"
  surface-dark: "#1C1430"
  stroke-dark: "#332A4E"
  ink-dark: "#F2EDFB"
  ink-muted-dark: "#A79BC8"
  acai-dark: "#7C3AED"
  acai-mist-dark: "#2A1D49"
  manga-dark: "#FFC53D"
typography:
  display:
    fontFamily: "Unbounded"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: "30px"
    letterSpacing: "-0.4px"
  headline:
    fontFamily: "Sora"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: "22px"
  title:
    fontFamily: "Sora"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: "21px"
  body:
    fontFamily: "Sora"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "22px"
  label:
    fontFamily: "Sora"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: "16px"
  numeral:
    fontFamily: "Sora"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: "20px"
    fontFeature: "tabular-nums"
rounded:
  sm: "10px"
  md: "14px"
  lg: "20px"
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
    backgroundColor: "{colors.acai}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "16px 24px"
    height: "52px"
    typography: "{typography.label}"
  button-primary-pressed:
    backgroundColor: "{colors.acai-deep}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
  button-quiet:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.plum-ink}"
    rounded: "{rounded.pill}"
    padding: "16px 24px"
    height: "52px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "16px"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.plum-ink}"
    rounded: "{rounded.md}"
    padding: "14px 16px"
    height: "52px"
  badge-accent:
    backgroundColor: "{colors.manga}"
    textColor: "{colors.plum-ink}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
---

# Design System: iFoodies

## Overview

**Creative North Star: "Açaí & Manga"**

O iFoodies é uma marca própria de food service universitário — não é a
identidade institucional do IF, não é clone de app de delivery. O roxo vem do
açaí, comida real de estudante brasileiro, e é um território de cor que nenhum
grande app de comida ocupa (iFood é vermelho, Rappi coral, Uber Eats verde);
ao mesmo tempo lê tech e jovem. A manga entra como energia e apetite, sempre
em dose pequena.

O gesto-assinatura é o **pingo do "i"**: no wordmark "iFoodies", o pingo é uma
bola manga sobre tinta ou branco. Esse pingo reaparece exatamente em dois
lugares — o símbolo da marca e o marcador de etapa atual na trilha do pedido —
e em nenhum outro. A raridade é o que o mantém assinatura.

A geometria é amigável: cards arredondados (20px) sobre papel lavanda, ações
em pílula, contornos de 1px. Profundidade é tom sobre tom; sombra existe em
exatamente dois elementos (CTA flutuante e modal).

**Key Characteristics:**
- Roxo açaí como cor de marca, manga como acento raro
- Unbounded na voz da marca, Sora em todo o resto
- Cards arredondados com traço fino; nada de sombra espalhada
- Sentence case em tudo — a marca não grita em caixa alta
- O pingo manga só aparece onde é assinatura

## Colors

Paleta própria: açaí vibrante sobre papel lavanda frio, tinta ameixa, manga
como acento e morango exclusivo para perda.

### Primary
- **Açaí** (`{colors.acai}`): a cor da marca. Botões primários, foco, trilha
  de pedido, item ativo da navegação. Contraste medido com branco: 7,0:1 —
  carrega texto branco em qualquer tamanho.
- **Açaí Profundo** (`{colors.acai-deep}`): estado pressionado e o fim do
  degradê da marca (`#7C3AED → #4A1FA3`, usado no herói de auth e no CTA).
- **Névoa de Açaí** (`{colors.acai-mist}`): superfícies tingidas — chips de
  contagem, linha de total, pílula ativa da tab bar, stepper com valor.

### Secondary
- **Manga** (`{colors.manga}`): o pingo do "i". Selo "só restam N", faixa
  "Pronto! Retire no balcão", marcador de etapa atual. Nunca carrega texto
  branco — sempre tinta ameixa por cima (9,4:1).

### Tertiary
- **Morango** (`{colors.morango}`): exclusivo de perda — esgotado, cancelado,
  erro, sair da conta. Nunca decorativo.
- **Ocre de Espera** (`{colors.pending}`): estados que dependem de terceiros.

### Neutral
- **Papel Lavanda** (`{colors.lavender-paper}`): fundo geral, frio e levemente
  tingido de roxo. Nunca creme.
- **Traço** (`{colors.stroke}`): contorno de 1px de cards e campos.
- **Tinta Ameixa** (`{colors.plum-ink}`) e **Tinta Fraca** (`{colors.ink-muted}`):
  texto primário (16,5:1) e secundário (7,0:1) sobre superfície.

### Named Rules
**A Regra do Pingo.** O pingo manga aparece no wordmark, no símbolo e no
marcador de etapa atual da trilha — e em nenhum outro lugar. Se um novo uso
parecer bom, ele está errado.

**A Regra da Manga Legível.** Manga nunca carrega texto branco; sobre manga,
sempre tinta ameixa.

## Typography

**Display Font:** Unbounded (700)
**Body Font:** Sora (400/600/700)

**Character:** A Unbounded é larga, arredondada e inconfundivelmente jovem —
é a voz da marca, usada com parcimônia (wordmark e título de tela, uma vez por
tela). A Sora faz todo o trabalho: rótulos, corpo, botões e números, com
numerais tabulares para preço alinhar embaixo de preço.

### Hierarchy
- **Display** (Unbounded 700, 24/30, -0.4): título da tela, uma vez por tela.
- **Headline** (Sora 700, 17/22): nome de produto, título de seção.
- **Title** (Sora 600, 16/21): linhas de destaque, totais, links fortes.
- **Body** (Sora 400, 15/22): descrição e texto corrido.
- **Label** (Sora 700, 13/16): texto de botão e rótulos. Sentence case.
- **Micro** (Sora 700, 11/14): selos, contadores, rótulos de campo.
- **Numeral / NumeralLarge** (Sora 700, 16 e 20, tabular): preço, quantidade,
  total, número do pedido.

### Named Rules
**A Regra da Voz Única.** Unbounded aparece no máximo duas vezes por tela
(wordmark e título). Todo o resto é Sora — se um componente "pede" Unbounded,
ele está pedindo atenção demais.

## Layout

Cards sobre papel: cada unidade de conteúdo é um card arredondado (20px) com
margem lateral de 16px e traço de 1px, empilhados com 12px entre si. Cabeçalho
de seção com contador em pílula abre cada grupo.

Escala de espaçamento: 4 / 8 / 12 / 16 / 24 / 40. Mais espaço acima de um
título do que abaixo.

Em telas largas (web/tablet) o conteúdo vive numa coluna central de **600px**
— o app não vira uma tela de celular esticada. Alvo de toque mínimo de 48dp,
safe areas e insets de teclado respeitados nos dois SOs.

## Elevation & Depth

Tom sobre tom: papel lavanda → superfície branca → névoa de açaí. Sombra
existe em **exatamente dois** elementos: o CTA flutuante do cardápio
(`shadow.floating`) e modais (`shadow.modal`). Card comum não tem sombra.

### Named Rules
**A Regra dos Dois Voos.** Só o CTA e o modal flutuam. Qualquer outro elemento
com sombra é um erro de sistema.

## Shapes

Raio 20px em cards, 14px em campos e imagens, 10px em selos retangulares, e
pílula completa (999px) em botões, chips e no contador de quantidade. O canto
reto não existe no sistema — a marca é redonda.

## Components

### Buttons
- **Shape:** pílula, altura 52px.
- **Primary:** campo açaí, texto branco Sora 700; pressionado escurece para
  açaí profundo e encolhe para 0.97 — sem sombra, sem glow.
- **Quiet:** superfície com traço; **Destructive:** morango.
- **Disabled:** campo traço com texto fraco e o motivo dito por extenso ao
  lado — botão desabilitado sem explicação é proibido.

### Cards
Superfície branca (berinjela no escuro), raio 20px, traço 1px, padding 16px.
O card de pedido pronto troca o traço por manga.

### Inputs / Fields
Raio 14px, traço 1px; foco troca para açaí 2px, erro para morango 2px com a
mensagem abaixo nomeando problema e recuperação.

### Badges
Pílulas Micro: manga/tinta para escassez ("Só restam 3") e celebração; morango/
branco para "Esgotado"; névoa/açaí para contagem neutra.

### Navigation (TabBar)
Quatro destinos com ícone + rótulo visível. O ativo senta numa pílula de névoa
de açaí com ícone e texto açaí. Sem FAB — a ação primária vive no CTA da tela.

### Status track (assinatura)
Quatro segmentos-pílula que preenchem de açaí conforme o pedido avança; a
etapa atual carrega o pingo manga. Cancelado vira pílula morango. "Pronto"
ganha faixa manga com texto tinta no card do pedido.

### CTA flutuante
Pílula com degradê açaí e sombra `floating`: rótulo à esquerda ("Revisar 3
itens"), total tabular à direita.

## Do's and Don'ts

### Do:
- **Do** usar açaí como campo (botão, trilha, pílula ativa) e manga como
  acento raro.
- **Do** sentence case em botões e rótulos ("Enviar pedido", nunca "ENVIAR").
- **Do** numerais tabulares alinhados à direita em todo preço e total.
- **Do** escrever os dois temas de verdade — o escuro é berinjela tingida, não
  inversão.
- **Do** limitar o conteúdo a 600px em telas largas.

### Don't:
- **Don't** usar sombra fora do CTA flutuante e do modal.
- **Don't** colocar texto branco sobre manga, nem texto pequeno em manga sobre
  branco.
- **Don't** usar o pingo manga fora do wordmark, do símbolo e da etapa atual.
- **Don't** reintroduzir o verde institucional, vermelho de apetite ou canto
  reto — são de outros mundos.
- **Don't** usar Unbounded em corpo, rótulo ou número.
