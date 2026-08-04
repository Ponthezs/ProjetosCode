# 💰 FinanceControl - Sistema Financeiro Pessoal Completo

**FinanceControl** é uma plataforma completa e moderna de Gestão Financeira Pessoal construída em **Python 3.13+**, **Streamlit**, **SQLAlchemy ORM**, **SQLite**, **Pandas**, **Plotly**, **OpenPyXL** e **ReportLab**.

Diferente de simples dashboards de gráficos, o FinanceControl foi desenhado com arquitetura profissional em camadas como um software comercial completo pronto para uso diário, comparável a plataformas como Mobills, YNAB, Organizze e Minhas Economias.

---

## 🌟 Principais Funcionalidades

1. **Importador Inteligente & Deduplicação**:
   - Varre automaticamente a pasta `dados/` buscando o arquivo CSV mais recente (ex: `Nubank_2026-10-01.csv`).
   - Algoritmo de fingerprint/hash SHA-256 para prevenir duplicidades.
   - Preserva 100% das edições manuais e novos lançamentos no SQLite sem alterar o CSV original.

2. **Lançamentos & Edição Completa**:
   - Suporte a Receitas, Despesas, Transferências, PIX, Dinheiro, Cheque, Investimentos, Empréstimos e Reembolsos.
   - Edição de valor, data, categoria, subcategoria, descrição, observações, tags, proprietário, forma de pagamento, parcelas e status.

3. **Divisão de Despesas por Pessoa (Splits)**:
   - Fracionamento de uma única compra entre múltiplos proprietários (ex: Mercado R$ 600 -> R$ 250 Meu, R$ 300 Esposa, R$ 50 Filho).

4. **Gestão Multi-Conta & Cartões de Crédito**:
   - Controle de saldos em tempo real em múltiplas contas (Nubank, Inter, Itaú, Dinheiro, PJ, etc.).
   - Controle de cartões com limite total, dia de fechamento e dia de vencimento da fatura.

5. **IA Financeira & Motor de Diagnóstico**:
   - Análises preditivas de saldo de fechamento do mês (Cashflow Forecast).
   - Identificação de aumentos de gastos em relação ao mês anterior, picos de finais de semana e diagnóstico de assinaturas.

6. **Central de Reembolsos**:
   - Acompanhamento de valores pendentes a receber de empresas ou terceiros.

7. **Metas & Orçamento por Categoria**:
   - Teto de gastos por categoria com alertas visuais ao atingir 80% ou ultrapassar 100%.
   - Acompanhamento percentual de metas de investimento e reserva.

8. **Relatórios & Exportações**:
   - Planilha Excel `.xlsx` multi-aba formatada com OpenPyXL.
   - Relatório em PDF `.pdf` formatado com ReportLab.
   - Exportação em `.csv`.

9. **Backup & Restauração Auto-geridos**:
   - Pontos de restauração automáticos do banco SQLite na pasta `backups/` com restore em 1 clique.

---

## 📐 Arquitetura do Sistema

```text
FinanceControl/
├── app.py                      # Ponto de entrada da aplicação Streamlit
├── requirements.txt            # Dependências do projeto
├── README.md                   # Documentação completa
├── config/                     # Configurações globais, temas e constantes
├── database/                   # Conexão, ORM e auto-seeding SQLite
├── models/                     # Modelos SQLAlchemy (Account, Card, Category, Transaction, Split, etc.)
├── repositories/               # Camada de Acesso a Dados (CRUD)
├── services/                   # Regras de Negócio, Importador, IA Financeira, Report, Backup
├── controllers/                # AppController de orquestração
├── components/                 # Componentes Visuais (Metric Cards, Charts, Forms, Calendar)
├── pages/                      # 12 Páginas completas da aplicação
├── assets/                     # CSS customizado com visual glassmorphism
├── dados/                      # Pasta de varredura de CSVs
├── backups/                    # Armazenamento de cópias SQLite
└── utils/                      # Funções utilitárias (Formatters, Validators, PDF Generator)
```

---

## 🚀 Como Executar o Projeto

1. Instale as dependências:
```bash
pip install -r requirements.txt
```

2. Inicie a aplicação Streamlit:
```bash
streamlit run app.py
```

Acesse em seu navegador no endereço indicado (geralmente `http://localhost:8501`).
