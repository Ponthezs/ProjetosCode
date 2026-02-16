# 🚀 Guia de Início Rápido

## Instalação em 3 Passos

### 1. Instalar Dependências
```bash
pip install -r requirements.txt
```

### 2. Executar a Aplicação

**Opção 1 - Comando Python (recomendado):**
```bash
python -m streamlit run app.py
```

**Opção 2 - Script de inicialização:**
- Windows: Clique duas vezes em `iniciar.bat`
- Ou execute: `.\iniciar.ps1` no PowerShell

**Opção 3 - Comando direto (se Streamlit estiver no PATH):**
```bash
streamlit run app.py
```

### 3. Acessar no Navegador
O sistema abrirá automaticamente em `http://localhost:8501`

## Primeiros Passos

### 1. Adicionar Primeira Transação
- Clique em **"➕ Nova Transação"** no menu lateral
- Preencha os campos obrigatórios
- Clique em "Salvar Transação"

### 2. Visualizar Dashboard
- Clique em **"🏠 Dashboard"**
- Veja seus KPIs e gráficos

### 3. Importar Extrato (Opcional)
- Clique em **"📥 Importar Extrato"**
- Selecione um arquivo CSV ou OFX
- Revise e importe as transações

## Estrutura de Dados

### Campos Obrigatórios
- **Data**: Formato DD/MM/AAAA
- **Descrição**: Texto livre
- **Categoria**: Selecionar da lista
- **Valor**: Número positivo
- **Tipo**: Receita, Despesa ou Transferência
- **Status**: Pago ou Pendente
- **Forma de Pagamento**: Cartão, Pix, Dinheiro ou Transferência

## Exemplo de CSV para Importação

```csv
Data;Descrição;Valor
01/01/2024;Salário mensal;5000.00
05/01/2024;Supermercado Extra;-350.50
10/01/2024;Restaurante;-85.00
```

**Nota**: Valores negativos são tratados como despesas, positivos como receitas.

## Dicas Importantes

1. **Primeira Execução**: O sistema cria automaticamente o banco de dados e categorias
2. **Backup**: Faça backup do arquivo `financas.db` regularmente
3. **Importação**: O sistema identifica automaticamente tipo e categoria, mas você pode revisar
4. **Orçamentos**: Configure orçamentos mensais para receber alertas

## Solução Rápida de Problemas

### Erro ao executar
```bash
# Atualize o pip
pip install --upgrade pip

# Reinstale as dependências
pip install -r requirements.txt --force-reinstall
```

### Banco de dados não encontrado
- Execute o app novamente, ele criará automaticamente

### Gráficos não aparecem
- Atualize a página no navegador (F5)
- Verifique se Plotly está instalado: `pip install plotly`

---

**Pronto para começar!** 🎉
