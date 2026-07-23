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
e acompanha os pedidos pelo painel administrativo (web, Filament em `/admin`),
não pelo app.

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
- Listagem dos pedidos do aluno com status e itens.
- Perfil: ver dados, editar nome/e-mail, trocar senha. O prontuário não é
  editável pelo app.

**Estados de pedido (contrato fixo com o backend):** `open`,
`awaiting_payment`, `approved`, `in_preparation`, `ready`, `canceled`.

**Explicitamente NÃO implementado (não fabricar como pronto):**

- **Pagamento no app.** É a intenção declarada do produto ("já pagar pelo app e
  só retirar no balcão"), mas não existe integração alguma. Os ícones de cartão
  e Pix na tela de carrinho são hoje decorativos e não fazem nada.
- **Aviso de pedido pronto.** Não há push notification nem polling; o aluno não
  é avisado quando o status vira `ready`.
- Não há histórico de favoritos, repetição de pedido, cupons nem avaliação.

**Restrições técnicas:** o contrato REST já existe e é consumido pelo app
(`/api/cantina/...`). Redesign não deve quebrá-lo. Estoque é a quantidade
máxima selecionável por produto.

## Brand Commitments

- **Nome:** iFoodies (o projeto se chamava "Cantina" antes; o nome atual é o
  real e definitivo).
- **Cores do IF.** O usuário determinou que o design use as cores
  institucionais do Instituto Federal. O app hoje usa o verde `#32984D`. O tom
  institucional exato ainda precisa ser confirmado antes de virar token.
- **Tom desejado:** moderno.
- **Contexto institucional:** é a cantina de uma escola pública federal
  (IFSP), não uma marca comercial de food service.

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
4. **Não prometer o que não existe.** Enquanto pagamento e aviso de "pronto"
   não forem reais, a interface não pode sugerir que são.
5. **Portfólio primeiro, mas plausível.** Deve impressionar como peça de
   portfólio sem virar algo que não sobreviveria a um intervalo real.

## Accessibility & Inclusion

Uso em pé, com uma mão, sob pressa e com possível reflexo de sol — exige alvos
de toque generosos, contraste alto e texto legível em movimento. Público de
escola pública, com aparelhos Android de faixa variada, incluindo modelos
antigos e telas pequenas.
