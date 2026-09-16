# Regras de negócio

Este documento descreve as regras que o sistema aplica automaticamente,
independentemente de quem está operando. Elas existem para manter os dados
consistentes entre os módulos.

## Clientes e fornecedores

- O código de cadastro (`CLI0001`, `FOR0001`, ...) é gerado automaticamente
  pelo sistema e não pode ser editado.
- O campo de documento (CPF ou CNPJ) é validado de acordo com o tipo de
  pessoa selecionado (Física ou Jurídica); um documento com formato ou
  dígito verificador inválido impede o cadastro.
- Um fornecedor vinculado a algum produto cadastrado não pode ser excluído —
  o produto precisa ser reatribuído a outro fornecedor ou excluído primeiro.
- Um cliente inativo continua aparecendo no histórico de vendas já
  registradas, mas não é oferecido como opção ao criar uma nova venda.

## Produtos e categorias

- O código do produto é gerado automaticamente.
- O estoque atual de um produto nunca é editado diretamente na tela de
  Produtos depois de criado — toda alteração de saldo passa pelo módulo de
  Estoque, para garantir que exista sempre um histórico de movimentação.
- Um produto é considerado "com estoque baixo" quando o estoque atual é
  menor ou igual ao estoque mínimo cadastrado. Esse é o gatilho para o
  destaque visual nas telas e para a notificação automática.
- Uma categoria de produto em uso por algum produto não pode ser excluída.
- Um produto com vendas já registradas não pode ser excluído, para preservar
  o histórico de vendas.

## Estoque

- Toda movimentação de estoque é registrada com data, produto, quantidade,
  tipo, motivo e usuário responsável, e nunca pode deixar o saldo do produto
  negativo.
- Tipos de movimentação:
  - **Entrada**: aumenta o saldo (ex.: recebimento de mercadoria fora do
    fluxo de Compras, doação, devolução de cliente).
  - **Saída**: reduz o saldo (ex.: perda, quebra, uso interno).
  - **Ajuste**: correção pontual, para mais ou para menos, com justificativa.
  - **Inventário**: contagem física do estoque; o sistema calcula
    automaticamente a diferença entre o saldo contado e o saldo do sistema e
    registra apenas essa diferença como movimentação.
- Vendas confirmadas (status Pago ou Finalizado) e compras confirmadas geram
  movimentações de estoque automaticamente — o usuário não precisa lançar
  manualmente a saída ou entrada correspondente.

## Vendas

- Uma venda só é permitida com pelo menos um item.
- O subtotal é a soma de quantidade × preço unitário de cada item, descontado
  o desconto por item (quando houver); o total é o subtotal menos o desconto
  geral da venda.
- Enquanto o status da venda é **Orçamento** ou **Pendente**, ela ainda não
  afetou o estoque nem gerou conta a receber, e por isso pode ser editada
  livremente.
- Quando o status muda para **Pago** ou **Finalizado**, o sistema:
  1. dá saída no estoque de cada produto vendido;
  2. cria a conta a receber correspondente — já quitada (recebida), se a
     forma de pagamento é imediata (Pix, cartão, dinheiro), ou com vencimento
     em 30 dias, se for boleto.
- Depois que uma venda afeta o estoque, ela não pode mais ser editada
  diretamente — para corrigi-la, é preciso cancelá-la (o que devolve o
  estoque) e registrar uma nova venda.
- Cancelar uma venda que já havia dado saída no estoque devolve
  automaticamente as quantidades aos produtos.

## Compras

- Uma compra só é permitida com pelo menos um item.
- Uma compra criada com status **Pendente** ainda não afeta o estoque nem
  gera conta a pagar; pode ser editada livremente.
- Ao **confirmar** uma compra, o sistema:
  1. dá entrada no estoque de cada produto comprado;
  2. cria a conta a pagar correspondente ao fornecedor — já quitada, se a
     forma de pagamento é imediata (Pix, dinheiro), ou com vencimento em 30
     dias para as demais formas.
- Cancelar uma compra já confirmada reverte a entrada de estoque.

## Financeiro

- Uma conta (a pagar ou a receber) com status **Pendente** e data de
  vencimento anterior à data atual é tratada em todas as telas como
  **Vencida** — esse é um status calculado automaticamente pelo sistema, não
  um valor que o usuário escolhe manualmente, e por isso essas linhas
  aparecem destacadas nas listagens.
- O saldo de caixa do sistema (indicador "Saldo financeiro"/"Saldo atual") é
  sempre a soma de todos os valores efetivamente recebidos e lançamentos de
  entrada, menos todos os valores efetivamente pagos e lançamentos de saída,
  desde o início do uso do sistema — valores apenas pendentes não entram
  nesse cálculo.
- Uma categoria financeira em uso por algum lançamento não pode ser
  excluída.

## Usuários e acesso

- Um usuário não pode excluir a própria conta enquanto estiver com a sessão
  ativa.
- A senha nunca é armazenada nem exibida em texto puro em nenhuma tela.
- O que cada perfil de usuário pode acessar está detalhado em
  `docs/negocio/03-perfis-e-permissoes.md`.

## Exclusões em geral

Toda exclusão no sistema pede confirmação explícita antes de ser executada.
Quando um registro está referenciado por outro (por exemplo, um fornecedor
usado em um produto, ou uma categoria usada em um lançamento financeiro), o
sistema impede a exclusão e explica o motivo, em vez de apagar silenciosamente
e deixar dados inconsistentes.
