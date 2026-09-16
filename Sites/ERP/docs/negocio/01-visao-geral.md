# Visão geral do sistema — Fluxen ERP

## Objetivo

O Fluxen ERP é um sistema de gestão empresarial voltado para pequenas e médias
empresas que precisam controlar, em um único lugar, cadastros de clientes e
fornecedores, catálogo de produtos, estoque, vendas, compras e finanças
(contas a pagar, contas a receber e fluxo de caixa).

Nesta fase do projeto, o sistema é entregue como uma aplicação web front-end
(HTML, CSS e JavaScript) que roda inteiramente no navegador, sem depender de
um servidor próprio. Os dados são armazenados no navegador do usuário
(localStorage) através de uma camada de acesso a dados isolada (ver
`docs/tecnico/01-arquitetura.md`), o que permite substituir esse
armazenamento por uma API e um banco de dados reais no futuro sem reescrever
as telas.

## Para quem é este documento

Esta pasta (`docs/negocio`) descreve o sistema do ponto de vista de negócio:
o que cada módulo resolve, quais regras a empresa precisa seguir ao usá-lo e
quem pode fazer o quê. A pasta `docs/tecnico` descreve como o sistema é
construído por dentro, para quem for dar manutenção ou evoluir o código.

## Módulos do sistema

| Módulo | O que resolve |
|---|---|
| Dashboard | Visão consolidada do desempenho da empresa: faturamento, vendas, contas, saldo e estoque, com gráficos dos últimos meses. |
| Cadastros — Clientes | Cadastro de pessoas físicas e jurídicas que compram da empresa. |
| Cadastros — Fornecedores | Cadastro de empresas e pessoas que fornecem produtos à empresa. |
| Cadastros — Produtos e Categorias | Catálogo de produtos, com preços de custo/venda, unidade, categoria e controle de estoque mínimo. |
| Estoque | Histórico de entradas, saídas, ajustes e inventários, e visão de saldo atual por produto. |
| Vendas | Registro de vendas a clientes, com itens, desconto, forma de pagamento e status. |
| Compras | Registro de compras a fornecedores; ao confirmar, o estoque é atualizado automaticamente. |
| Financeiro | Painel financeiro consolidado e categorias financeiras (o que é receita, o que é despesa). |
| Contas a pagar | Obrigações da empresa com fornecedores e outras despesas. |
| Contas a receber | Valores a receber de clientes. |
| Fluxo de caixa | Entradas e saídas realizadas, saldo acumulado e evolução no tempo. |
| Relatórios | Consultas gerenciais com filtro de período, impressão e exportação em CSV/PDF. |
| Usuários | Cadastro da equipe que usa o sistema e do perfil de acesso de cada pessoa. |
| Configurações | Dados da empresa, preferências do sistema, segurança (senha) e aparência (tema claro/escuro). |

## Como os módulos se conectam

O sistema não trata os módulos como telas isoladas — há integrações
automáticas que evitam retrabalho e inconsistência:

- Ao **confirmar uma venda** com status "Pago" ou "Finalizado", o estoque dos
  produtos vendidos é reduzido automaticamente e uma conta a receber
  correspondente é criada (já marcada como recebida quando a forma de
  pagamento é imediata, como Pix ou cartão).
- Ao **confirmar uma compra**, o estoque dos produtos comprados é aumentado
  automaticamente e uma conta a pagar correspondente é criada.
- **Estoque abaixo do mínimo** gera uma notificação automática no sino do
  cabeçalho, e o produto aparece destacado nas telas de Produtos e Estoque.
- **Contas a pagar e a receber vencendo hoje** também geram notificação
  automática.
- O **Dashboard** e o **Financeiro** recalculam seus indicadores e gráficos a
  partir dos mesmos dados das telas operacionais — não há lançamento manual
  duplicado de indicadores.

## Ambiente de demonstração

Para fins de avaliação e treinamento, o sistema já vem com dados fictícios
(clientes, fornecedores, produtos, vendas, compras, contas e usuários) na
primeira vez que é aberto em um navegador. Esses dados servem apenas para
demonstração e podem ser apagados a qualquer momento em
Configurações > Sistema > "Restaurar dados de demonstração".

Credenciais de acesso da demonstração estão descritas em
`docs/negocio/04-manual-do-usuario.md`.
