# ClickPedido

Sistema de pedidos de uma lanchonete (Quiosque do Mineiro): o cliente pede pela loja online e a equipe opera os pedidos no balcão, no salão e na cozinha. Os termos seguem o backend atual (`Models/Entidades.cs`, `Infra/Rotulos.cs`).

## Loja e cardápio

**Loja**:
O estabelecimento e suas regras de funcionamento: aberta ou fechada, formas de entrega e pagamento aceitas, taxa e pedido mínimo. No código, é a `ConfiguracaoLoja`.
_Avoid_: Restaurante, empresa, estabelecimento

**Cardápio**:
O conjunto de categorias e produtos ativos que o cliente vê. O **cardápio digital** (`/cardapio`) é só consulta, sem sacola.
_Avoid_: Menu, catálogo

**Categoria**:
Agrupamento de produtos no cardápio (ex.: Pastéis, Açaí), com ordem própria.
_Avoid_: Seção, grupo

**Produto**:
Item vendável do cardápio, com preço base. Pode estar **inativo** (some do cardápio) ou **esgotado** (aparece, mas não pode ser pedido).
_Avoid_: Item (reservado para Item do pedido), prato

**Grupo de opções**:
Conjunto de escolhas de um produto (ex.: "Adicionais"), com mínimo, máximo e quantas escolhas são grátis (`GratisAte`).
_Avoid_: Complemento, variação, adicional (adicional é o item, não o grupo)

**Item de opção**:
Uma escolha dentro de um grupo de opções, com preço adicional opcional.
_Avoid_: Opção solta, extra

**Sacola**:
Os itens que o cliente está montando antes de finalizar, guardados no navegador. Vira pedido no checkout.
_Avoid_: Carrinho, cesta

## Pedido

**Pedido**:
Uma compra feita pela loja, pelo garçom ou no salão, com itens, tipo, forma de pagamento e status.
_Avoid_: Compra, venda, ordem

**Item do pedido**:
Um produto dentro de um pedido, com quantidade, opções escolhidas (resumo), observação e preço já calculado.
_Avoid_: Linha, produto do pedido

**Observação**:
Texto livre do cliente, em um item ("sem cebola") ou no pedido inteiro.
_Avoid_: Nota, comentário

**Token do pedido**:
Identificador público do link de acompanhamento (`/pedido/{token}`), diferente do número do pedido.
_Avoid_: Código, hash

**Acompanhamento**:
A tela em que o cliente vê a linha do tempo do pedido e, se for o caso, paga o Pix.
_Avoid_: Rastreio, tracking

**Tipo de entrega**:
Como o pedido chega ao cliente: **Entrega** (motoboy), **Retirada** (no balcão) ou **Mesa** (no salão).
_Avoid_: Modalidade, delivery (como nome do tipo)

**Status do pedido**:
A etapa do pedido: Aguardando pagamento, Recebido, Em preparo, Pronto, Saiu para entrega, Concluído ou Cancelado. O rótulo de Pronto e Concluído muda conforme o tipo (ex.: "Pronto para retirada", "Entregue").
_Avoid_: Estado, situação (reservado para pagamento)

**Avançar**:
Levar o pedido para a próxima etapa do status. O texto do botão depende da etapa e do tipo (ex.: "Iniciar preparo", "Cliente retirou").
_Avoid_: Próximo, mover

## Pagamento e entrega

**Forma de pagamento**:
Como o cliente paga: **Pix**, **Cartão online**, **Dinheiro** ou **Cartão na maquininha** (`CartaoNaEntrega`).
_Avoid_: Meio de pagamento, método

**Situação do pagamento**:
Se o pagamento está Aguardando, Pago, A cobrar (na entrega) ou Cancelado.
_Avoid_: Status do pagamento

**Troco**:
O valor com que o cliente vai pagar em dinheiro, que precisa ser maior que o total.
_Avoid_: Troco para (no texto da tela, use "Troco para quanto?")

**Bairro de entrega**:
Bairro atendido, com cidade e taxa de entrega própria.
_Avoid_: Região, zona

**Taxa de entrega**:
Valor cobrado pela entrega: o do bairro, ou o padrão da loja quando o bairro não está cadastrado.
_Avoid_: Frete

**Cidade atendida**:
Cidade em que a loja entrega. Lista vazia significa que entrega em qualquer cidade.
_Avoid_: Área de cobertura

**Pedido mínimo**:
O subtotal mínimo para pedidos de entrega e retirada. Não vale para mesa.
_Avoid_: Valor mínimo, compra mínima

**Motoboy**:
Entregador cadastrado, chamado pelo WhatsApp com a mensagem do pedido pronta.
_Avoid_: Entregador, courier

## Operação

**Fila**:
A tela do balcão com os pedidos em colunas (Novos, Em preparo, Prontos, Em rota), com alerta sonoro e impressão automática.
_Avoid_: Painel, kanban, board

**Cozinha**:
A tela da cozinha (KDS) que mostra o que preparar, em tela cheia, com filtro de mesas e delivery.
_Avoid_: KDS (como nome principal), produção

**Mesa**:
Lugar do salão, com número e status: Livre, Ocupada ou Conta pedida.
_Avoid_: Lugar, assento

**Comanda**:
O pedido aberto de uma mesa, que recebe itens até a conta ser fechada.
_Avoid_: Conta (conta é o fechamento), ticket

**Fechar conta**:
Encerrar a comanda com uma forma de pagamento e liberar a mesa.
_Avoid_: Finalizar mesa, encerrar

**Garçom**:
Quem lança os itens na mesa pelo modo garçom, no celular ou tablet.
_Avoid_: Atendente

**Cupom**:
O papel de 80 mm impresso na térmica com o pedido.
_Avoid_: Nota, recibo, comprovante

**Agente de impressão**:
O programa do PC do balcão que recebe os cupons e imprime direto na térmica. Nesta versão, o status dele é simulado.
_Avoid_: Driver, serviço de impressão

**Horário de funcionamento**:
Os dias e horários em que a loja abre. Com o controle automático ligado, a loja abre e fecha sozinha por eles.
_Avoid_: Expediente

## Projeto

**Mock**:
Os dados e as ações em `src/mock/` que imitam o backend nesta versão. Cada **ação** replica um endpoint ou uma ação do backend.
_Avoid_: Fake, stub, API (não há API nesta versão)

**Direção visual**:
Uma proposta de identidade (cores, tipografia, densidade, motion) aplicada a telas-chave na página `/_design`, para escolher antes de construir o resto.
_Avoid_: Tema, layout
