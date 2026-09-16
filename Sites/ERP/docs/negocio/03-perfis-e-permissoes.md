# Perfis de acesso e permissões

Cada usuário do sistema recebe, no cadastro, um perfil que determina quais
módulos aparecem no menu lateral e quais páginas ele pode abrir diretamente
pelo endereço. Um usuário que tenta acessar um módulo fora do seu perfil é
redirecionado automaticamente para o Dashboard.

## Perfis disponíveis

| Perfil | Acesso |
|---|---|
| **Administrador** | Acesso completo a todos os módulos do sistema, incluindo Usuários e Configurações. |
| **Gerente** | Acesso a todos os módulos operacionais e financeiros (Cadastros, Estoque, Vendas, Compras, Financeiro, Relatórios, Configurações), sem gestão de usuários. |
| **Financeiro** | Acesso ao Dashboard, ao módulo Financeiro, Contas a pagar, Contas a receber, Fluxo de caixa e Relatórios. |
| **Vendedor** | Acesso ao Dashboard, Clientes, Produtos (consulta) e Vendas. |
| **Estoque** | Acesso ao Dashboard, Produtos, Fornecedores, Estoque e Compras. |
| **Usuário** | Acesso apenas ao Dashboard geral. |

## Critério de definição

A divisão acima segue o princípio de menor privilégio: cada perfil enxerga
somente os módulos necessários para a função da pessoa na empresa. Isso
reduz o risco de alterações indevidas (por exemplo, um vendedor não deveria
conseguir alterar uma conta a pagar) e simplifica o menu de quem só precisa
de uma parte do sistema no dia a dia.

## Ajustando o modelo de permissões

Se a empresa precisar de um perfil diferente dos listados, ou de um recorte
diferente de módulos por perfil, isso é uma decisão de negócio que deve ser
revisada aqui antes de qualquer alteração técnica — o mapeamento de perfil
para módulos está centralizado em um único ponto do código
(`ROLE_MODULES`, em `js/core/auth.js`), justamente para que essa política
possa ser ajustada em um lugar só, sem precisar alterar tela por tela.

## Conta de demonstração por perfil

O ambiente de demonstração já inclui um usuário de cada perfil (ver
`docs/negocio/04-manual-do-usuario.md` para as credenciais completas), para
que seja possível validar o comportamento de cada nível de acesso antes de
cadastrar a equipe real da empresa.
