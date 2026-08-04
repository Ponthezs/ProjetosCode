# Tipos de Transação
TRANSACTION_TYPES = [
    "Despesa",
    "Receita",
    "Transferência",
    "PIX",
    "Dinheiro",
    "Cheque",
    "Investimento",
    "Empréstimo",
    "Reembolso"
]

# Status da Transação
TRANSACTION_STATUS = [
    "Pago",
    "Pendente",
    "Cancelado"
]

# Formas de Pagamento
PAYMENT_METHODS = [
    "Cartão de Crédito",
    "Cartão de Débito",
    "PIX",
    "Boleto",
    "Dinheiro",
    "Transferência Bancária",
    "Cheque",
    "Outro"
]

# Proprietários Padrão
DEFAULT_OWNERS = ["Meu", "Esposa", "Família", "Empresa", "Outro"]

# Contas Padrão para inicialização
DEFAULT_ACCOUNTS = [
    {"name": "Nubank", "type": "Conta Corrente", "balance": 0.0, "icon": "🏦", "color": "#8A05BE"},
    {"name": "Banco Inter", "type": "Conta Corrente", "balance": 0.0, "icon": "🟧", "color": "#FF7A00"},
    {"name": "Itaú", "type": "Conta Corrente", "balance": 0.0, "icon": "🟦", "color": "#EC7000"},
    {"name": "Carteira / Dinheiro", "type": "Dinheiro", "balance": 0.0, "icon": "💵", "color": "#2ECC71"},
    {"name": "Conta Empresa", "type": "PJ", "balance": 0.0, "icon": "🏢", "color": "#34495E"}
]

# Cartões Padrão
DEFAULT_CARDS = [
    {"name": "Nubank Roxinho", "brand": "Mastercard", "limit": 5000.0, "closing_day": 1, "due_day": 10, "color": "#8A05BE"},
    {"name": "Inter Black", "brand": "Mastercard", "limit": 10000.0, "closing_day": 15, "due_day": 25, "color": "#FF7A00"}
]

# Categorias e Subcategorias Padrão
DEFAULT_CATEGORIES = [
    {
        "name": "Alimentação",
        "type": "Despesa",
        "icon": "🍔",
        "color": "#E74C3C",
        "subcategories": ["Mercado", "Restaurante", "Delivery", "Padaria", "Café"]
    },
    {
        "name": "Moradia",
        "type": "Despesa",
        "icon": "🏠",
        "color": "#E67E22",
        "subcategories": ["Aluguel", "Condomínio", "Energia", "Água", "Gás", "Manutenção"]
    },
    {
        "name": "Transporte",
        "type": "Despesa",
        "icon": "🚗",
        "color": "#F1C40F",
        "subcategories": ["Combustível", "Uber/99", "Manutenção Veículo", "Estacionamento", "Pedágio", "Transporte Público"]
    },
    {
        "name": "Saúde & Bem-Estar",
        "type": "Despesa",
        "icon": "💊",
        "color": "#1ABC9C",
        "subcategories": ["Farmácia", "Consultas", "Exames", "Plano de Saúde", "Academia"]
    },
    {
        "name": "Lazer & Entretenimento",
        "type": "Despesa",
        "icon": "🎬",
        "color": "#9B59B6",
        "subcategories": ["Cinema", "Viagens", "Jogos", "Shows & Eventos", "Passeios"]
    },
    {
        "name": "Assinaturas & Serviços",
        "type": "Despesa",
        "icon": "📱",
        "color": "#3498DB",
        "subcategories": ["Streaming", "Música", "Nuvem", "Software", "Internet", "Telefonia"]
    },
    {
        "name": "Educação",
        "type": "Despesa",
        "icon": "📚",
        "color": "#2980B9",
        "subcategories": ["Cursos", "Livros", "Faculdade", "Certificações", "Idiomas"]
    },
    {
        "name": "Compras Pessoais",
        "type": "Despesa",
        "icon": "🛍️",
        "color": "#E84393",
        "subcategories": ["Roupas", "Eletrônicos", "Presentes", "Cosméticos", "Acessórios"]
    },
    {
        "name": "Salário & Rendimentos",
        "type": "Receita",
        "icon": "💰",
        "color": "#2ECC71",
        "subcategories": ["Salário Fixo", "Bônus", "PLR", "Dividendos", "Freelance", "Reembolso"]
    },
    {
        "name": "Investimentos",
        "type": "Investimento",
        "icon": "📈",
        "color": "#27AE60",
        "subcategories": ["Renda Fixa", "Ações", "FIIs", "Criptomoedas", "Reserva de Emergência"]
    }
]

# Tags Padrão
DEFAULT_TAGS = ["Viagem", "Trabalho", "Presente", "Saúde", "Urgente", "Projeto", "Férias", "Reembolsável"]
