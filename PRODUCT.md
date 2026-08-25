# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

O app roda em Android e iOS (Expo / React Native), e o usuário decidiu por uma
**identidade visual própria e unificada** — não é mimetismo de Material nem de
Cupertino. "Adaptive" aqui significa respeitar as affordances nativas de cada SO
(safe areas, gesto de voltar, alvos de toque, teclado), não trocar a linguagem
visual por plataforma. Existe também um build web funcional, mas ele é
secundário ao nativo.

## Users

**Aluno do IFSP (escola técnica)** — usuário primário. Está no intervalo de
**15 a 30 minutos**, num momento de pico em que a cantina forma fila. Usa o
próprio celular, em pé, muitas vezes andando ou conversando, com pressa e sob
ruído. Se identifica no sistema pelo **prontuário**.

**Equipe da cantina** — usuário secundário. Cadastra produtos, controla estoque
e move os pedidos da fila pelo painel web (Filament em `/admin`, identidade
Verde Vivo, restrito a contas `is_staff`), não pelo app.

## Product Purpose

Deixar o aluno **furar a fila**: fazer o pedido pelo celular e apenas retirar no
balcão quando estiver pronto. O sucesso é o aluno conseguir comer dentro do
intervalo sem gastar a maior parte dele esperando.

Depois de retirar, **quem decide o que fazer é o aluno** — consumir na cantina
ou levar embora. O produto não impõe um dos dois caminhos.

## Positioning

Não é um app de delivery: não há entrega, não há motoboy, não há raio de
atendimento. É um **sistema de fila e retirada para uma cantina única e
fisicamente próxima**, onde o usuário já está no prédio e o tempo de intervalo
é o recurso escasso. O ganho é tempo de fila, não conveniência de deslocamento.

O aluno é uma população fechada e recorrente (a mesma escola, os mesmos alunos,
hábitos de consumo repetidos), o que difere de qualquer marketplace aberto.

## Operating Context

- Intervalo de 15–30 min, com pico simultâneo de demanda.
- Uso em pé, com uma mão, em ambiente barulhento e movimentado.
- Rede da escola / dados móveis, com qualidade variável.
- A retirada é presencial no balcão, o que exige que o aluno saiba **quando** o
  pedido ficou pronto e **como** se identificar na retirada.
- O estoque é finito e real: um produto pode acabar no meio do intervalo.

## Capabilities and Constraints

**Implementado hoje:**

- Cadastro e login por e-mail/senha, com prontuário no cadastro (token Sanctum).
- Cardápio agrupado por categoria, com preço, descrição, imagem e estoque.
- Carrinho local (AsyncStorage) com edição de quantidade e remoção.
- Criação de pedido, que congela o preço unitário e baixa o estoque.
- **Estoque volta quando o pedido não vira venda.** Cancelar devolve os itens
  à prateleira, e um Pix gerado e nunca pago é cancelado sozinho depois da
  validade (comando agendado). A devolução é marcada no pedido, então
  repeti-la não cria produto do nada. Cancelado e retirado são estados
  terminais: descancelar devolveria estoque duas vezes.
- Listagem dos pedidos do aluno com status e itens.
- Perfil: ver dados, editar nome/e-mail, trocar senha. O prontuário não é
  editável pelo app.
- Recuperação de senha por código de 6 dígitos enviado por e-mail (válido por
  15 minutos, uso único, derruba todas as sessões antigas).
- **Pagamento por Pix (AbacatePay, API v2).** O app gera o QR e o
  copia-e-cola; a confirmação chega por dois caminhos — o webhook do gateway
  e a consulta ativa em `/orders/{id}/payment` — e a tela vira sozinha.
  Pagar é opcional: o pedido vale mesmo sem pagamento, e o aluno pode fechar
  a tela e pagar no balcão. Cartão continua desenhado e inativo, porque não
  existe integração de cartão.
- Painel da equipe em `/admin` (Filament): fila de pedidos com troca de
  status inline, criação de pedido no balcão, CRUD de produtos/categorias e
  visão geral do dia.
- **Tempo real (Laravel Reverb):** o servidor empurra a mudança de status
  pelo WebSocket, em canal privado por aluno (`orders.{id}`), no instante em
  que ela acontece. A sondagem periódica sobrou apenas como reserva, num
  intervalo longo, para quando o socket cai.
- **Retirada validada por código.** Cada pedido nasce com um código aleatório
  de 6 caracteres. O aluno mostra o código no balcão; o atendente digita no
  painel e o pedido é encerrado (`delivered` + `delivered_at`). O código é de
  uso único e só vale com o pedido em `ready`.
  **O prontuário NÃO serve para isso** — é público entre os alunos, e o
  cadastro aceita qualquer prontuário ainda não usado, então qualquer um
  poderia reivindicar o do colega.

**Estados de pedido (contrato fixo com o backend):** `open`,
`awaiting_payment`, `approved`, `in_preparation`, `ready`, `delivered`,
`canceled`.

**Explicitamente NÃO implementado (não fabricar como pronto):**

- **Aviso com o app fechado.** Com o app aberto na tela de pedidos, o status
  chega na hora pelo WebSocket. Mas não há push notification: com o app
  fechado, o aluno só descobre que ficou `ready` quando abrir o app. Push
  exigiria build próprio (Expo Go não serve) e tokens de dispositivo.
- Não há histórico de favoritos, repetição de pedido, cupons nem avaliação.

**Restrições técnicas:** o contrato REST já existe e é consumido pelo app
(`/api/cantina/...`). Redesign não deve quebrá-lo. Estoque é a quantidade
máxima selecionável por produto.

## Brand Commitments

- **Nome:** iFoodies (o projeto se chamava "Cantina" antes; o nome atual é o
  real e definitivo).
- **Paleta verde, viva e macia (refinado em 2026-08-19):** o produto é
  vendido PARA Institutos Federais, e IF é verde. O usuário rejeitou a
  primeira versão dos verdes por ser dura/sombria: a diretriz vigente é
  verde VIVO com interface macia ("smooth") — superfícies tonais no lugar de
  bordas de 1px. Continua valendo: não copiar outras marcas, não parecer
  fast-food genérico nem sistema administrativo.
- **Tema único: só o claro** (decidido em 2026-08-19). A opção de troca foi
  removida a pedido do usuário; a paleta escura segue definida no código,
  porém não é oferecida.
- **Tom desejado:** jovem, moderno, divertido, tecnológico, gastronômico,
  universitário — sem ser infantil.
- **Tipografia definida pelo usuário (2026-08-19):** Unbounded em TODOS os
  títulos, dos grandes aos mínimos — título que era <16px desce 1px ao virar
  Unbounded. No resto, Figtree (o usuário vetou explicitamente Montserrat e
  Sora).
- **Identidade construída** (ver DESIGN.md): "Verde IF" — wordmark em
  Unbounded com o pingo do "i" em verde-folha como gesto-assinatura.
- **Contexto institucional:** é a cantina de uma escola pública federal
  (IFSP), mas a marca do app é própria, não a do instituto.

## Evidence on Hand

- **Cardápio real: não existe.** Os 14 produtos e 4 categorias no banco são
  dados de *seed* inventados para desenvolvimento (`api/database/seeders/MenuSeeder.php`),
  com imagens do Unsplash. Não são o cardápio verdadeiro da cantina e não devem
  ser apresentados como tal.
- **Fotos reais dos produtos: não existem.** As imagens atuais são genéricas de
  banco de imagens.
- Não há usuários reais, métricas de uso, depoimentos nem histórico de pedidos.
  Nada disso deve ser inventado em telas ou textos.
- Ícone/logo existente: `mobile/assets/images/Login/if-icon.png`.

## Product Principles

1. **O intervalo é o recurso escasso.** Toda decisão que economiza segundos do
   aluno vence uma que economiza cliques teóricos.
2. **Estoque e status são verdade, não enfeite.** O aluno precisa confiar que o
   que está no app existe no balcão — produto esgotado e pedido pronto são
   informação crítica, não detalhe.
3. **O aluno decide o desfecho.** Consumir no local ou levar embora é escolha
   dele; o produto não empurra um fluxo.
4. **Não prometer o que não existe.** O Pix agora é real; cartão e push
   notification não são, e a interface não pode sugerir que sejam.
5. **Portfólio primeiro, mas plausível.** Deve impressionar como peça de
   portfólio sem virar algo que não sobreviveria a um intervalo real.

## Accessibility & Inclusion

Uso em pé, com uma mão, sob pressa e com possível reflexo de sol — exige alvos
de toque generosos, contraste alto e texto legível em movimento. Público de
escola pública, com aparelhos Android de faixa variada, incluindo modelos
antigos e telas pequenas.
