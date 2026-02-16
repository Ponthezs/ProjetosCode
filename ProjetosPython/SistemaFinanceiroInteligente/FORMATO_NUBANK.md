# 📥 Guia de Importação - Formato Nubank

## Formato CSV do Nubank

O Nubank exporta extratos em CSV com as seguintes características:

### Estrutura Típica
- **Separador**: Vírgula (`,`) ou ponto e vírgula (`;`)
- **Encoding**: UTF-8 ou Latin-1
- **Formato de Data**: `YYYY-MM-DD` (ex: 2026-03-09)
- **Formato de Valor**: Decimal com ponto (ex: 1234.56) ou vírgula (ex: 1234,56)
- **Valores Negativos**: Representam saídas (despesas)
- **Valores Positivos**: Representam entradas (receitas)

### Colunas Comuns do Nubank

O arquivo CSV do Nubank geralmente contém:
- `date` ou `data` - Data da transação
- `title` ou `descrição` - Descrição da transação
- `amount` ou `valor` - Valor da transação
- `category` ou `categoria` - Categoria (opcional)

## Como Importar

1. **Exporte o extrato do Nubank**:
   - Acesse o app ou site do Nubank
   - Vá em "Extrato" ou "Histórico"
   - Selecione o período desejado
   - Exporte como CSV

2. **No Sistema Financeiro**:
   - Acesse a página "📥 Importar Extrato"
   - Selecione "CSV" como tipo de arquivo
   - Faça upload do arquivo
   - O sistema tentará identificar automaticamente as colunas

3. **Verifique o Preview**:
   - O sistema mostrará um preview do arquivo bruto
   - Revise se as colunas foram identificadas corretamente
   - Veja o preview das transações processadas

## Solução de Problemas

### "Nenhuma transação encontrada"

**Possíveis causas:**
1. Formato de data não reconhecido
2. Colunas com nomes diferentes
3. Valores em formato não numérico

**Soluções:**
1. Abra o arquivo CSV em um editor de texto (Bloco de Notas)
2. Verifique os nomes das colunas na primeira linha
3. Verifique o formato da data (deve ser algo como `2026-03-09` ou `09/03/2026`)
4. Verifique se os valores estão em formato numérico

### Valores incorretos

**Se os valores aparecerem incorretos:**
- O sistema detecta automaticamente se usa vírgula ou ponto como separador decimal
- Valores negativos são tratados como despesas
- Valores positivos são tratados como receitas

### Datas incorretas

**Formatos suportados:**
- `2026-03-09` (formato ISO - mais comum no Nubank)
- `09/03/2026`
- `09-03-2026`
- `2026/03/09`

## Exemplo de Arquivo CSV do Nubank

```csv
date,title,amount,category
2026-03-09,Compra no Supermercado,-150.50,Alimentação
2026-03-08,Transferência Recebida,500.00,Transferência
2026-03-07,Pagamento Fatura,-1200.00,Cartão de Crédito
```

## Dicas

1. **Exporte períodos menores**: Arquivos muito grandes podem demorar para processar
2. **Revise antes de importar**: Use o preview para verificar se está tudo correto
3. **Evite duplicatas**: O sistema verifica automaticamente se a transação já existe
4. **Ajuste categorias**: Após importar, você pode editar as categorias manualmente se necessário

---

**Nota**: O sistema foi otimizado para detectar automaticamente o formato do Nubank, mas se encontrar problemas, verifique o preview do arquivo bruto para entender a estrutura.
