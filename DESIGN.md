---
name: iFoodies
description: Marca de food service para Institutos Federais — verde IF, cinza e o pingo do "i".
colors:
  floresta: "#2D5320"
  floresta-deep: "#1F3A16"
  folha: "#86C55A"
  lavagem: "#EFFAE7"
  tinta-verde: "#D3F1B9"
  papel: "#FDFFFB"
  surface: "#FFFFFF"
  cinza-traco: "#EAEAEA"
  ink: "#2E332C"
  ink-muted: "#5F6A57"
  perda: "#C03A2F"
  pending: "#9A6108"
  ground-dark: "#0F150D"
  surface-dark: "#182014"
  traco-dark: "#2C3527"
  ink-dark: "#ECF2E6"
  ink-muted-dark: "#A3B098"
  folha-dark: "#86C55A"
  lavagem-dark: "#1E2A18"
typography:
  display:
    fontFamily: "Unbounded"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: "30px"
    letterSpacing: "-0.4px"
  headline:
    fontFamily: "Montserrat"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: "22px"
  title:
    fontFamily: "Montserrat"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: "21px"
  body:
    fontFamily: "Montserrat"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "22px"
  label:
    fontFamily: "Montserrat"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: "16px"
  numeral:
    fontFamily: "Montserrat"
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
    backgroundColor: "{colors.floresta}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "16px 24px"
    height: "52px"
    typography: "{typography.label}"
  button-primary-pressed:
    backgroundColor: "{colors.floresta-deep}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
  button-quiet:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
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

**Creative North Star: "Verde IF"**

O iFoodies é vendido para Institutos Federais — e IF é verde. A paleta parte
do verde institucional e o transforma em marca de produto: floresta escura
para ação, folha vibrante para energia, lavagens claras para superfície e o
cinza #EAEAEA como estrutura. Não é clone de app de delivery nem sistema
administrativo: é uma marca jovem de food service que se senta confortável
dentro de uma escola federal.

O gesto-assinatura segue sendo o **pingo do "i"**: no wordmark "iFoodies", o
pingo é uma bola verde-folha. Ele reaparece exatamente em dois lugares — o
símbolo da marca e o marcador de etapa atual na trilha do pedido — e em
nenhum outro. A raridade é o que o mantém assinatura.

A geometria é amigável: cards arredondados (20px) sobre papel quase-branco,
ações em pílula, contornos de 1px. Profundidade é tom sobre tom; sombra
existe em exatamente dois elementos (CTA flutuante e modal).

**Key Characteristics:**
- Verde floresta como cor de ação, verde-folha como energia
- Unbounded na voz da marca, Montserrat em todo o resto
- Cards arredondados com traço cinza fino; nada de sombra espalhada
- Tema claro é o padrão obrigatório; escuro é opt-in nas configurações
- Tamanho de letra ajustável pelo usuário (controle fixo no cabeçalho)
- O pingo verde-folha só aparece onde é assinatura

## Colors

Paleta institucional transformada em produto: verdes do IF sobre papel
quase-branco, cinza estrutural e vermelho exclusivo para perda.

### Primary
- **Verde Floresta** (`{colors.floresta}`): a cor de ação. Botões primários,
  foco, links, trilha de pedido, item ativo. Contraste com branco: 8,9:1 —
  carrega texto branco em qualquer tamanho.
- **Floresta Profunda** (`{colors.floresta-deep}`): estado pressionado e fim
  do degradê da marca (`#3E7527 → #2D5320`, herói de auth e CTA).
- **Lavagem Verde** (`{colors.lavagem}`) e **Tinta Verde**
  (`{colors.tinta-verde}`): superfícies tingidas — chips, total, pílula ativa
  da tab bar, stepper com valor.

### Secondary
- **Verde Folha** (`{colors.folha}`): o pingo do "i". Selo "Restam N", faixa
  "Pronto!", marcador de etapa atual. Nunca carrega texto branco — sempre
  tinta escura por cima (8,2:1).

### Tertiary
- **Perda** (`{colors.perda}`): exclusivo de perda — esgotado, cancelado,
  erro, sair da conta. Nunca decorativo.
- **Ocre de Espera** (`{colors.pending}`): estados que dependem de terceiros.

### Neutral
- **Papel** (`{colors.papel}`): fundo geral, quase-branco esverdeado.
- **Cinza Traço** (`{colors.cinza-traco}`): contorno de 1px de cards e campos
  — o cinza estrutural da marca.
- **Tinta** (`{colors.ink}`) e **Tinta Fraca** (`{colors.ink-muted}`): texto
  primário (~13:1) e secundário (5,7:1) sobre superfície.

### Named Rules
**A Regra do Pingo.** O pingo verde-folha aparece no wordmark, no símbolo e
no marcador de etapa atual da trilha — e em nenhum outro lugar.

**A Regra da Folha Legível.** Verde-folha nunca carrega texto branco; sobre
folha, sempre tinta escura.

**A Regra do Claro Primeiro.** O app abre SEMPRE no tema claro. O escuro
existe, é escrito à mão (verde-noite, não inversão) e é escolhido pelo
usuário em Perfil → Aparência.

## Typography

**Display Font:** Unbounded (700)
**Body Font:** Montserrat (400/600/700)

**Character:** A Unbounded é larga, arredondada e inconfundivelmente jovem —
é a voz da marca, usada com parcimônia (wordmark e título de tela, uma vez
por tela). A Montserrat faz todo o trabalho: rótulos, corpo, botões e
números, com numerais tabulares para preço alinhar embaixo de preço.

Os textos de interface nascem pequenos e **escalam por escolha do usuário**:
um controle fixo no cabeçalho (A− · A · A+) aplica fatores 1 / 1,15 / 1,3 a
tudo, exceto ao `display` — a voz da marca não escala.

### Hierarchy
- **Display** (Unbounded 700, 24/30, -0.4): título da tela, uma vez por tela.
- **Headline** (Montserrat 700, 17/22): nome de produto no popup, seções.
- **Title** (Montserrat 600, 16/21): nome de produto no card, totais, links.
- **Body** (Montserrat 400, 15/22): descrição e texto corrido.
- **Label** (Montserrat 700, 13/16): texto de botão e rótulos. Sentence case.
- **Micro** (Montserrat 700, 11/14): selos, contadores, rótulos de campo.
- **Numeral / NumeralLarge** (Montserrat 700, 16 e 20, tabular): preço,
  quantidade, total, número do pedido.

### Named Rules
**A Regra da Voz Única.** Unbounded aparece no máximo duas vezes por tela
(wordmark e título). Todo o resto é Montserrat.

## Layout

Cards sobre papel: cada unidade de conteúdo é um card arredondado (20px) com
traço cinza de 1px. Cabeçalho de seção com contador em pílula abre cada
grupo.

No cardápio, um **menu lateral de categorias** (rail de 96px, fixo à
esquerda) filtra a lista — o aluno não precisa rolar o cardápio inteiro. O
card de produto é enxuto (foto, nome, preço, contador); descrição completa e
detalhes moram no popup que abre ao tocar no card, para o texto nunca ser
cortado.

Escala de espaçamento: 4 / 8 / 12 / 16 / 24 / 40. Em telas largas o conteúdo
vive numa coluna central de **600px**. Alvo de toque mínimo de 48dp, safe
areas e insets respeitados nos dois SOs.

**Navegação instantânea:** a troca de aba não anima (animation: none) e o
contêiner de rota herda o fundo do tema — nada de slide nem flash branco
entre telas.

## Elevation & Depth

Tom sobre tom: papel → superfície branca → lavagem verde. Sombra existe em
**exatamente dois** elementos: o CTA flutuante do cardápio (`shadow.floating`)
e modais (`shadow.modal`). Card comum não tem sombra.

### Named Rules
**A Regra dos Dois Voos.** Só o CTA e o modal flutuam.

## Shapes

Raio 20px em cards, 14px em campos, imagens e itens do rail, 10px em selos
retangulares, e pílula completa (999px) em botões, chips e no contador. O
canto reto não existe no sistema.

## Components

### Buttons
- **Shape:** pílula, altura 52px.
- **Primary:** campo floresta, texto branco Montserrat 700; pressionado
  escurece e encolhe para 0.97 — sem sombra, sem glow.
- **Quiet:** superfície com traço; **Destructive:** perda.
- **Disabled:** campo cinza com o motivo dito por extenso ao lado.

### Cards
Superfície branca (verde-noite no escuro), raio 20px, traço cinza 1px. O card
de produto é tocável e abre o popup de detalhes; o de pedido pronto troca o
traço por verde-folha.

### Product detail (popup)
Modal central (máx. 440px): foto grande, nome, preço em destaque, descrição
completa sem truncar, estoque e contador. Fecha por toque fora, botão ou
gesto de voltar.

### Category rail
Menu lateral fixo de filtragem do cardápio: pílulas verticais ("Tudo" + uma
por categoria); a ativa é campo floresta com texto branco.

### Inputs / Fields
Raio 14px, traço cinza 1px; foco troca para floresta 2px, erro para perda 2px
com a mensagem abaixo nomeando problema e recuperação.

### Badges
Pílulas Micro: folha/tinta para escassez ("Restam 3") e celebração; perda/
branco para "Esgotado"; lavagem/floresta para contagem neutra.

### Navigation (TabBar)
Quatro destinos com ícone + rótulo visível. O ativo senta numa pílula de
lavagem verde com ícone e texto floresta.

### Status track (assinatura)
Quatro segmentos-pílula que preenchem de verde conforme o pedido avança; a
etapa atual carrega o pingo verde-folha. Cancelado vira pílula de perda.
"Pronto!" ganha faixa verde-folha com texto escuro no card do pedido.

### Font size control
Fixo no cabeçalho de toda tela autenticada: A− · A · A+ (diminuir, padrão,
aumentar), em pílula com traço cinza.

### CTA flutuante
Pílula com degradê floresta e sombra `floating`: rótulo à esquerda, total
tabular à direita.

## Do's and Don'ts

### Do:
- **Do** usar floresta como campo de ação e folha como energia rara.
- **Do** abrir SEMPRE no tema claro; escuro só por escolha do usuário.
- **Do** sentence case em botões e rótulos ("Enviar pedido", nunca "ENVIAR").
- **Do** numerais tabulares alinhados à direita em todo preço e total.
- **Do** manter o card de produto enxuto — descrição completa vive no popup.
- **Do** limitar o conteúdo a 600px em telas largas.

### Don't:
- **Don't** usar sombra fora do CTA flutuante e do modal.
- **Don't** colocar texto branco sobre verde-folha.
- **Don't** usar o pingo fora do wordmark, do símbolo e da etapa atual.
- **Don't** animar a troca de aba — a navegação é instantânea.
- **Don't** truncar descrição sem oferecer o popup com o texto completo.
- **Don't** usar Unbounded em corpo, rótulo ou número.
