# 💰 Sistema de Controle Financeiro Automatizado e Inteligente

Sistema completo e profissional para controle financeiro pessoal com automação, cálculos inteligentes, dashboard interativo e gestão de orçamentos e metas.

## 📋 Características Principais

### ✅ Estrutura de Dados Completa
- **Campos Obrigatórios**: Data (DD/MM/AAAA), Descrição, Categoria, Subcategoria, Valor (R$), Tipo (Receita/Despesa/Transferência), Status (Pago/Pendente), Forma de Pagamento (Cartão, Pix, Dinheiro, Transferência)
- **Categorização Hierárquica**: Sistema completo de categorias e subcategorias pré-configuradas
- **Banco de Dados SQLite**: Armazenamento local seguro e eficiente

### 🤖 Automação e Cálculos Inteligentes
- **Fluxo de Caixa Automático**: 
  - Saldo Atual (transações pagas)
  - Projeção de Saldo Final do Mês (incluindo pendentes)
  - Total de Contas a Pagar (pendentes)
- **Regras de Negócio**: 
  - Alerta visual automático quando gastos ultrapassam 30% da renda em uma categoria
- **Importação de Extratos**: 
  - Suporte para arquivos CSV e OFX
  - Limpeza e conversão automática de dados
  - Identificação automática de tipo de transação e categoria

### 📊 Dashboard e Visualização
- **KPIs em Tempo Real**:
  - Receita Total vs Despesa Total
  - Taxa de Poupança (Savings Rate %)
  - Evolução Patrimonial mensal
- **Gráficos Interativos**:
  - Gráfico de Rosca: Distribuição de Gastos por Categoria
  - Gráfico de Barras: Comparativo Mensal de Entradas vs Saídas
  - Gráfico de Linha: Evolução Patrimonial ao longo do tempo

### 🎯 Metas e Orçamentos
- **Reserva de Emergência**: 
  - Criação e acompanhamento de metas
  - Cálculo automático de progresso
  - Visualização de quanto falta para o objetivo
- **Orçamento Mensal por Categoria**: 
  - Definição de limites mensais
  - Acompanhamento de gastos vs orçamento
  - Alertas quando próximo do limite

## 🚀 Instalação

### Pré-requisitos
- Python 3.8 ou superior
- pip (gerenciador de pacotes Python)

### Passo a Passo

1. **Clone ou baixe o projeto**
```bash
cd SistemaFinanceiroInteligente
```

2. **Instale as dependências**
```bash
pip install -r requirements.txt
```

**Nota**: O SQLite3 já vem incluído no Python, então não precisa instalação adicional.

3. **Execute a aplicação**

**Opção 1 - Usando Python diretamente (recomendado):**
```bash
python -m streamlit run app.py
```

**Opção 2 - Usando script de inicialização:**
- Windows: Clique duas vezes em `iniciar.bat` ou execute `.\iniciar.ps1` no PowerShell
- Ou tente: `streamlit run app.py` (se o Streamlit estiver no PATH)

4. **Acesse no navegador**
   - O Streamlit abrirá automaticamente em `http://localhost:8501`
   - Se não abrir automaticamente, acesse manualmente

## 📖 Como Usar

### 1. Primeira Execução
Na primeira vez que executar, o sistema criará automaticamente:
- Banco de dados SQLite (`financas.db`)
- Categorias e subcategorias padrão
- Estrutura de tabelas necessárias

### 2. Adicionar Transações Manualmente
1. Acesse a página **"➕ Nova Transação"**
2. Preencha todos os campos obrigatórios (marcados com *)
3. Selecione categoria e subcategoria
4. Clique em "Salvar Transação"

### 3. Importar Extrato Bancário
1. Acesse a página **"📥 Importar Extrato"**
2. Selecione o tipo de arquivo (CSV ou OFX)
3. Faça upload do arquivo
4. Revise o preview das transações identificadas
5. Clique em "Importar Transações"

**Formato CSV Esperado**:
O sistema tenta identificar automaticamente as colunas. Formatos comuns:
- Data: DD/MM/YYYY, YYYY-MM-DD, ou outros formatos comuns
- Descrição: Campo de texto com histórico/descrição
- Valor: Número (aceita R$, vírgulas, pontos)

**Formato OFX**:
Suporta arquivos OFX padrão de bancos brasileiros.

### 4. Visualizar Dashboard
1. Acesse a página **"🏠 Dashboard"**
2. Selecione mês e ano para análise
3. Visualize KPIs, gráficos e alertas

### 5. Configurar Orçamentos
1. Acesse a página **"📊 Orçamentos"**
2. Na aba "Gerenciar Orçamentos":
   - Selecione mês, ano e categoria
   - Defina o valor limite
   - Salve o orçamento
3. Na aba "Visualizar Orçamentos":
   - Veja o progresso de cada categoria
   - Compare gasto real vs limite

### 6. Criar Metas
1. Acesse a página **"🎯 Metas"**
2. Na aba "Nova Meta":
   - Defina nome, tipo e valor objetivo
   - Informe valor atual (se houver)
   - Defina data objetivo (opcional)
3. Na aba "Minhas Metas":
   - Acompanhe o progresso visual
   - Veja quanto falta para alcançar

## 📁 Estrutura do Projeto

```
SistemaFinanceiroInteligente/
├── app.py                 # Aplicação principal (Streamlit)
├── database.py            # Módulo de banco de dados
├── calculos.py            # Módulo de cálculos e KPIs
├── visualizacao.py        # Módulo de gráficos e visualizações
├── importacao.py          # Módulo de importação de extratos
├── requirements.txt       # Dependências do projeto
├── README.md              # Este arquivo
└── financas.db            # Banco de dados SQLite (criado automaticamente)
```

## 🗂️ Estrutura de Categorias Pré-configuradas

### Despesas
- **Habitação**: Aluguel, Condomínio, IPTU, Água, Luz, Gás, Internet, Telefone, Manutenção
- **Transporte**: Combustível, Estacionamento, Manutenção, IPVA, Seguro, Transporte Público
- **Alimentação**: Supermercado, Restaurante, Delivery, Padaria, Farmácia
- **Saúde**: Plano de Saúde, Médico, Dentista, Medicamentos, Exames
- **Educação**: Mensalidade, Material Escolar, Cursos, Livros
- **Lazer**: Cinema, Viagem, Hobby, Assinaturas, Eventos
- **Compras**: Roupas, Eletrônicos, Casa, Presentes
- **Serviços**: Contador, Advogado, Outros Profissionais
- **Impostos**: IRPF, ISS, Outros
- **Outros**: Diversos

### Receitas
- **Salário**: CLT, PJ, Bolsa
- **Freelance**: Projetos, Consultoria
- **Investimentos**: Dividendos, Juros, Rendimentos
- **Aluguel**: Imóvel, Veículo
- **Outros**: Vendas, Reembolsos

## 🔧 Funcionalidades Técnicas

### Cálculos Automáticos
- **Fluxo de Caixa**: Separação entre transações pagas e pendentes
- **KPIs**: Cálculo em tempo real de receitas, despesas e taxa de poupança
- **Alertas**: Verificação automática de gastos acima de 30% da renda
- **Orçamentos**: Comparação automática entre limite e gasto real
- **Metas**: Cálculo de progresso percentual e valor faltante

### Importação Inteligente
- **Limpeza de Dados**: Normalização de datas e valores
- **Identificação Automática**: Tipo de transação, forma de pagamento e categoria
- **Prevenção de Duplicatas**: Verificação antes de importar
- **Suporte a Múltiplos Formatos**: CSV com diferentes separadores e encodings

### Visualizações
- **Gráficos Interativos**: Plotly com hover, zoom e exportação
- **Cores Intuitivas**: Verde para receitas, vermelho para despesas
- **Responsivo**: Adapta-se a diferentes tamanhos de tela

## 💡 Dicas de Uso

1. **Importe Extratos Regularmente**: Mantenha seus dados atualizados importando extratos mensalmente
2. **Configure Orçamentos**: Defina limites realistas para evitar surpresas
3. **Monitore Alertas**: Preste atenção aos alertas de gastos excessivos
4. **Acompanhe Metas**: Visualize regularmente o progresso das suas metas financeiras
5. **Use Categorias Consistentes**: Mantenha padrão nas categorias para análises mais precisas

## 🛠️ Personalização

### Adicionar Novas Categorias
Você pode adicionar categorias diretamente no banco de dados ou modificar o arquivo `database.py` na função `init_default_categories()`.

### Modificar Regras de Negócio
As regras de alerta (30% da renda) podem ser ajustadas no arquivo `calculos.py` na função `verificar_alertas_categoria()`.

### Personalizar Gráficos
Os gráficos podem ser customizados no arquivo `visualizacao.py` alterando cores, layouts e tipos de gráfico.

## 📊 Exemplos de Uso

### Exemplo 1: Controle Mensal Básico
1. Importe o extrato do mês
2. Revise e ajuste categorias se necessário
3. Visualize o dashboard para entender seus gastos
4. Configure orçamentos para o próximo mês

### Exemplo 2: Planejamento de Reserva de Emergência
1. Crie uma meta de "Reserva de Emergência" com valor objetivo
2. Acompanhe mensalmente o progresso
3. Use a taxa de poupança do dashboard para ajustar seus gastos

### Exemplo 3: Controle de Gastos por Categoria
1. Configure orçamentos para categorias importantes
2. Monitore o dashboard regularmente
3. Ajuste gastos quando próximo do limite

## ⚠️ Observações Importantes

- **Backup**: Faça backup regular do arquivo `financas.db`
- **Dados Sensíveis**: O banco de dados é local, mas mantenha segurança no seu computador
- **Formato de Data**: O sistema usa formato DD/MM/AAAA para exibição
- **Valores**: Todos os valores são em Reais (R$)

## 🐛 Solução de Problemas

### Erro ao instalar dependências
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Banco de dados corrompido
Delete o arquivo `financas.db` e execute novamente. O sistema criará um novo banco.

### Erro na importação de CSV
- Verifique o formato do arquivo
- Tente diferentes separadores (; ou ,)
- Verifique o encoding (UTF-8, Latin-1)

### Gráficos não aparecem
- Verifique se o Plotly está instalado: `pip install plotly`
- Atualize o navegador
- Limpe o cache do Streamlit: `streamlit cache clear`

## 📝 Licença

Este projeto é fornecido como está, para uso pessoal e educacional.

## 🤝 Contribuições

Sugestões e melhorias são bem-vindas! Sinta-se à vontade para adaptar o código às suas necessidades.

## 📞 Suporte

Para dúvidas ou problemas:
1. Revise a documentação acima
2. Verifique os comentários no código
3. Consulte a documentação do Streamlit e Plotly

---

**Desenvolvido com ❤️ para controle financeiro pessoal inteligente**
