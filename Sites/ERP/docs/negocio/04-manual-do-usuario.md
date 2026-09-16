# Manual do usuário

## Acesso ao sistema

Abra o arquivo `login.html` (ou o endereço onde o sistema estiver publicado)
em um navegador atualizado (Chrome, Edge, Firefox ou Safari). Informe e-mail
e senha e clique em **Entrar**. É possível mostrar/ocultar a senha digitada
pelo ícone de olho, e marcar **Lembrar de mim** para não precisar entrar de
novo na próxima visita nesse mesmo navegador.

### Credenciais do ambiente de demonstração

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | `admin@erp.com` | `admin123` |
| Gerente | `marina.souza@fluxenerp.com.br` | `Gerente123` |
| Financeiro | `rafael.lima@fluxenerp.com.br` | `Financ123` |
| Vendedor | `juliana.costa@fluxenerp.com.br` | `Vendas123` |
| Estoque | `bruno.carvalho@fluxenerp.com.br` | `Estoque123` |

Essas credenciais existem apenas nos dados de demonstração gerados
automaticamente na primeira execução. Ao colocar o sistema em uso real, crie
usuários próprios em **Usuários** e considere trocar ou remover os usuários
de demonstração.

Se esquecer a senha, o link **Esqueci minha senha** explica que a
redefinição, nesta versão do sistema, é feita pelo administrador em
**Usuários** — não existe envio de e-mail automático nesta fase.

## Navegação geral

- **Menu lateral**: lista todos os módulos permitidos para o seu perfil.
  Alguns módulos (Cadastros, Estoque, Financeiro) têm submenu — clique no
  item para expandir. O botão na parte inferior da barra lateral recolhe o
  menu, mostrando apenas os ícones (útil em telas menores).
- **Busca no cabeçalho**: pesquisa ao mesmo tempo em clientes, fornecedores,
  produtos e vendas; clique em um resultado para ir direto ao registro.
- **Sino de notificações**: mostra avisos automáticos do sistema, como
  produtos com estoque baixo e contas vencendo hoje. Um número vermelho
  indica quantas notificações ainda não foram lidas.
- **Botão de tela cheia**: expande a janela do navegador, útil em
  apresentações ou monitores dedicados ao Dashboard.
- **Alternância de tema**: o ícone de lua/sol troca entre tema claro e
  escuro; a preferência é lembrada nas próximas visitas.
- **Menu do usuário** (canto superior direito): acesso a perfil,
  configurações, troca de senha e opção de sair do sistema.

## Dashboard

Mostra, em um só lugar: faturamento do mês, total de vendas, contas a
receber e a pagar em aberto, saldo financeiro acumulado, clientes ativos,
produtos cadastrados e produtos com estoque baixo — cada indicador com a
comparação percentual em relação ao mês anterior, quando aplicável. Abaixo,
cinco gráficos mostram a evolução do faturamento, a quantidade de vendas por
mês, receitas x despesas, a distribuição das vendas por categoria de
produto e os produtos mais vendidos.

## Cadastros (Clientes, Fornecedores, Produtos)

Em qualquer uma dessas telas: use a busca e os filtros no topo da tabela
para localizar registros; clique em **+ Novo** para abrir o formulário de
cadastro; use os ícones de ação em cada linha para visualizar, editar ou
excluir. Toda exclusão pede confirmação antes de ser executada.

Na tela de **Produtos**, a aba **Categorias** permite cadastrar as
categorias usadas para classificar o catálogo. Produtos com estoque no
limite mínimo ou abaixo dele aparecem com um destaque visual (ponto vermelho
e linha destacada) para chamar atenção antes mesmo de abrir o módulo de
Estoque.

## Estoque

A aba **Visão geral** mostra o saldo atual de cada produto e a data da
última movimentação. A aba **Movimentações** mostra o histórico completo de
entradas, saídas, ajustes e inventários. Para registrar uma movimentação
manual, use **+ Nova movimentação**, escolha o produto e o tipo:

- **Entrada** ou **Saída**: informe a quantidade movimentada.
- **Ajuste**: informe a diferença (positiva ou negativa) a aplicar.
- **Inventário**: informe o saldo que foi contado fisicamente — o sistema
  calcula e registra automaticamente a diferença em relação ao saldo atual.

Vendas e compras confirmadas já geram suas próprias movimentações
automaticamente; o lançamento manual é para os demais casos (perdas,
doações, correções).

## Vendas

Na aba **Lista de vendas**, acompanhe todas as vendas registradas, filtre por
cliente, status ou período, e mude o status de uma venda diretamente na
lista. Para registrar uma nova venda, use a aba **Nova venda**: escolha o
cliente, adicione um ou mais produtos (a quantidade e o preço podem ser
ajustados por item), informe um desconto geral se houver, escolha a forma de
pagamento e o status. O subtotal, o desconto e o total são recalculados
automaticamente a cada alteração. Uma venda com status **Pago** ou
**Finalizado** já dá baixa no estoque e gera a conta a receber
correspondente — depois disso ela não pode mais ser editada, apenas
cancelada.

## Compras

Funciona de forma equivalente às vendas, na direção contrária: escolha o
fornecedor, adicione os produtos comprados com quantidade e valor unitário,
e salve como **Pendente** (para revisar depois) ou já **Confirmada**. Ao
confirmar uma compra, o estoque dos produtos é atualizado e a conta a pagar
correspondente é criada automaticamente.

## Financeiro

O painel principal mostra saldo, receitas, despesas, contas a receber e a
pagar em aberto e o resultado do mês, além do gráfico de receitas x
despesas e da lista de contas vencendo nos próximos dias. A aba
**Categorias financeiras** organiza os tipos de receita e despesa usados nos
lançamentos.

## Contas a pagar / Contas a receber

Cadastre novas contas manualmente (quando não vierem automaticamente de uma
compra ou venda), acompanhe vencimentos — contas vencidas aparecem
destacadas — e use **Marcar como pago**/**Marcar como recebido** para
liquidar uma conta, informando a data e a forma de pagamento.

## Fluxo de caixa

Mostra entradas, saídas e saldo do período selecionado (hoje, semana, mês,
ano ou um intervalo personalizado), com o gráfico de evolução do saldo
acumulado e a lista de todas as movimentações que compuseram o período. É
possível lançar manualmente uma entrada ou saída que não venha de uma venda,
compra ou conta (por exemplo, um aporte de sócio ou uma retirada de caixa).

## Relatórios

Escolha o tipo de relatório (vendas, financeiro, produtos mais vendidos,
estoque, clientes, compras, contas a pagar ou a receber), ajuste o período e
use os botões **Imprimir**, **Exportar CSV** ou **Exportar PDF** — todos
operam sobre os dados atualmente filtrados na tela.

## Usuários (apenas perfil Administrador)

Cadastre a equipe que vai usar o sistema, escolhendo o perfil de acesso de
cada pessoa (a descrição do que cada perfil pode acessar aparece ao
selecioná-lo). Consulte `docs/negocio/03-perfis-e-permissoes.md` para o
detalhamento completo de cada perfil.

## Configurações

- **Empresa**: dados cadastrais e logotipo, usados em relatórios e no
  cabeçalho do sistema.
- **Sistema**: preferências gerais e a opção de restaurar os dados de
  demonstração (isso apaga todos os dados atuais do navegador).
- **Financeiro** e **Usuários**: atalhos para as respectivas telas de
  gestão.
- **Segurança**: troca da própria senha.
- **Aparência**: alternância entre tema claro e escuro.
