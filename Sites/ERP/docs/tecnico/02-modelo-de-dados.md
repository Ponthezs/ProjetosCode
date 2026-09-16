# Modelo de dados

Este documento é o dicionário de dados das entidades do sistema. Ele
descreve a forma dos objetos exatamente como eles existem hoje em
`localStorage` (JavaScript) e como se traduzem para as tabelas relacionais em
`db/schema.sql`, para a futura migração.

Cada coleção do localStorage é uma chave em `COLLECTIONS`
(`js/core/storage.js`) contendo um array de objetos JSON. Configurações
únicas (não listas) usam `SETTINGS_KEYS` e ficam gravadas cada uma em sua
própria chave.

## Cliente (`erp_customers` → tabela `clientes`)

| Campo | Tipo | Observação |
|---|---|---|
| id / code | string | Código gerado automaticamente, ex. `CLI0001` |
| personType | `'PF'` \| `'PJ'` | |
| name | string | Nome ou razão social |
| tradeName | string | Nome fantasia (PJ) |
| document | string | CPF ou CNPJ, com máscara |
| stateDocument | string | RG ou Inscrição Estadual |
| email, phone, mobile | string | |
| zip, address, number, complement, district, city, state | string | Endereço |
| notes | string | |
| status | `'ativo'` \| `'inativo'` | |
| createdAt | ISO datetime | Gerado pelo sistema |

## Fornecedor (`erp_suppliers` → tabela `fornecedores`)

Mesma forma do Cliente, com prefixo de código `FOR`.

## Categoria de produto (`erp_categories` → tabela `categorias_produto`)

`{ id, name, status }`

## Produto (`erp_products` → tabela `produtos`)

| Campo | Tipo | Observação |
|---|---|---|
| id / code | string | ex. `PRD0001` |
| sku, barcode | string | |
| name | string | |
| categoryId | string | referência a Categoria |
| supplierId | string | referência a Fornecedor |
| brand, unit | string | |
| costPrice, salePrice | number | |
| currentStock, minStock | number | `currentStock` só é alterado via `StockService` |
| status | `'ativo'` \| `'inativo'` | |

## Movimentação de estoque (`erp_stock_movements` → tabela `movimentacoes_estoque`)

`{ id, date, productId, quantity (delta assinado já aplicado), type: 'entrada'|'saida'|'ajuste'|'inventario', reason, responsibleUserId }`

## Venda (`erp_sales` → tabelas `vendas` + `itens_venda`)

| Campo | Tipo | Observação |
|---|---|---|
| id / number | string | ex. `VD0001` |
| customerId, sellerId | string | |
| date | ISO date | |
| paymentMethod | string | |
| items | array | `{ productId, productName, qty, unitPrice, discount }` — normalizado em `itens_venda` no modelo relacional |
| subtotal, discount, total | number | |
| status | `'orcamento'\|'pendente'\|'pago'\|'finalizado'\|'cancelado'` | |
| notes | string | |

## Compra (`erp_purchases` → tabelas `compras` + `itens_compra`)

`{ id, number, supplierId, date, items:[{productId, productName, qty, unitCost}], total, status:'pendente'|'confirmada'|'cancelada', paymentMethod, responsibleUserId, notes }`

## Conta a pagar (`erp_payables` → tabela `contas_pagar`)

`{ id, description, supplierId, categoryId, amount, issueDate, dueDate, paymentDate, paymentMethod, status:'pendente'|'pago'|'cancelado', sourcePurchaseId }`

`status` é o valor persistido; `effectiveStatus` (calculado em tempo real por
`FinancialService`, não persistido) retorna `'vencido'` quando `status` é
`'pendente'` e `dueDate` já passou. O modelo relacional não precisa de uma
coluna para isso — o cálculo deve ser refeito na camada de API/consulta.

## Conta a receber (`erp_receivables` → tabela `contas_receber`)

Mesma lógica da conta a pagar, com `customerId` no lugar de `supplierId`,
`receiptDate` no lugar de `paymentDate`, status `'pendente'|'recebido'|'cancelado'`
e `sourceSaleId` no lugar de `sourcePurchaseId`.

## Categoria financeira (`erp_fin_categories` → tabela `categorias_financeiras`)

`{ id, name, nature: 'receita'|'despesa' }`

## Lançamento de caixa (`erp_cash_entries` → tabela `lancamentos_caixa`)

`{ id, date, type:'entrada'|'saida', description, categoryId, amount }` —
lançamentos que não vêm de uma venda ou compra (aportes, retiradas,
tarifas, etc.).

## Usuário (`erp_users` → tabela `usuarios`)

`{ id, name, email, login, role, profileDescription, status, passwordHash }`
— `passwordHash` nunca deve ser exposto em nenhuma tela ou relatório.

## Notificação (`erp_notifications` → tabela `notificacoes`)

`{ id, type, message, link, dedupeKey, date, read }` — `dedupeKey` evita que
a mesma notificação automática (ex.: "produto X com estoque baixo") seja
gerada mais de uma vez no mesmo dia.

## Empresa e configurações (chaves únicas, não coleções)

- `erp_company` → tabela `empresas`: dados cadastrais da empresa.
- `erp_settings` → preferências: `{ theme, sidebarCollapsed, dateFormat, currency }`.
- `erp_session` → sessão do usuário autenticado (não é persistido no banco
  relacional; na API isso se torna um token/sessão de autenticação).

## Diagrama de relacionamento (simplificado)

```
clientes ──┐                          fornecedores ──┐
           ├─< vendas >─ itens_venda ─┘                ├─< compras >─ itens_compra ─┘
           │        └─────────────< produtos >─────────────────┘
           │                              │
           └─< contas_receber            └─< movimentacoes_estoque
                     ▲                          categorias_produto >─┘
categorias_financeiras ┴─< contas_pagar
                       └─< lancamentos_caixa

usuarios ─< movimentacoes_estoque / vendas (vendedor) / compras (responsável) / notificacoes
```

Consulte `db/schema.sql` para a definição completa em SQL, incluindo chaves
estrangeiras, restrições de integridade (`CHECK`) e índices recomendados.
