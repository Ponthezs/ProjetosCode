# 💾 Persistência e Backup dos Dados

## ✅ Sim, seus dados ficam salvos permanentemente!

O sistema usa **SQLite**, um banco de dados que salva tudo em um arquivo local no seu computador. Isso significa que:

- ✅ **Dados persistem**: Mesmo fechando o Streamlit, todos os dados ficam salvos
- ✅ **Histórico completo**: Você pode visualizar todos os meses anteriores
- ✅ **Sem necessidade de internet**: Tudo funciona offline
- ✅ **Dados seguros**: Ficam apenas no seu computador

## 📁 Onde ficam os dados?

O arquivo do banco de dados é criado automaticamente na primeira execução:

```
SistemaFinanceiroInteligente/
└── financas.db  ← Este é o arquivo com TODOS os seus dados
```

## 🔄 Como funciona?

1. **Primeira execução**: O sistema cria o arquivo `financas.db` automaticamente
2. **Adiciona transações**: Todas são salvas imediatamente no banco
3. **Fecha o sistema**: Os dados continuam no arquivo `financas.db`
4. **Reabre depois**: O sistema carrega todos os dados do arquivo
5. **Visualiza meses anteriores**: Use os filtros de mês/ano no Dashboard

## 📊 Visualizando Meses Anteriores

### No Dashboard:
1. Acesse a página **"🏠 Dashboard"**
2. Use os filtros no topo:
   - **Mês**: Selecione qualquer mês (1-12)
   - **Ano**: Selecione qualquer ano
3. Todos os KPIs e gráficos serão atualizados para o período selecionado

### Nas Transações:
1. Acesse **"📋 Transações"**
2. Use os filtros:
   - **Mês**: Selecione o mês desejado
   - **Ano**: Selecione o ano desejado
   - **Tipo**: Filtre por Receita/Despesa
   - **Status**: Filtre por Pago/Pendente

### Gráficos Comparativos:
- O gráfico de **Comparativo Mensal** mostra automaticamente os últimos 6 meses
- O gráfico de **Evolução Patrimonial** mostra os últimos 12 meses
- Todos os dados históricos são incluídos automaticamente

## 💾 Backup Recomendado

### Por que fazer backup?
- Proteção contra perda de dados
- Possibilidade de restaurar se algo der errado
- Pode usar em outro computador

### Como fazer backup:

**Opção 1 - Manual (Recomendado):**
1. Pare o sistema (feche o Streamlit)
2. Copie o arquivo `financas.db`
3. Cole em uma pasta de backup (OneDrive, Google Drive, etc.)
4. Faça isso regularmente (semanal ou mensal)

**Opção 2 - Automático:**
- Configure o OneDrive/Google Drive para sincronizar a pasta do projeto
- O arquivo `financas.db` será sincronizado automaticamente

### Localização do arquivo:
```
C:\Users\Felipe\OneDrive\Documentos\Github\ProjetosCode\ProjetosPython\SistemaFinanceiroInteligente\financas.db
```

## 🔒 Segurança

- ✅ **Dados locais**: Tudo fica no seu computador, não vai para a nuvem
- ✅ **Sem login**: Não precisa de senha ou conta
- ✅ **Privacidade total**: Apenas você tem acesso aos dados
- ⚠️ **Importante**: Mantenha backup do arquivo `financas.db`

## 📈 Crescimento do Banco de Dados

O arquivo `financas.db` cresce conforme você adiciona dados:
- **Inicial**: ~50-100 KB (apenas estrutura)
- **1.000 transações**: ~200-500 KB
- **10.000 transações**: ~2-5 MB
- **100.000 transações**: ~20-50 MB

Mesmo com muitos dados, o arquivo continua pequeno e rápido.

## 🔄 Restaurar Backup

Se precisar restaurar um backup:

1. **Pare o sistema** (feche o Streamlit)
2. **Faça backup do arquivo atual** (caso queira manter)
3. **Substitua** o arquivo `financas.db` pelo arquivo de backup
4. **Reinicie o sistema**

## ❓ Perguntas Frequentes

### P: Se eu deletar o arquivo financas.db?
**R:** Você perderá todos os dados. Por isso é importante fazer backup regularmente.

### P: Posso usar em outro computador?
**R:** Sim! Copie o arquivo `financas.db` para o outro computador na mesma pasta do sistema.

### P: Os dados ficam na nuvem?
**R:** Não, tudo fica local. Mas você pode fazer backup na nuvem manualmente.

### P: Quantos anos de dados posso ter?
**R:** Não há limite prático. O SQLite suporta milhões de registros sem problemas.

### P: Posso exportar os dados?
**R:** Sim! Você pode visualizar todas as transações na página "📋 Transações" e copiar/exportar se necessário.

---

**💡 Dica**: Configure um lembrete mensal para fazer backup do arquivo `financas.db`!
