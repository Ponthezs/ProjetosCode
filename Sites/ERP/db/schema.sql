-- =============================================================================
-- Fluxen ERP — Modelo de dados relacional (PostgreSQL)
-- =============================================================================
-- Este script traduz para SQL as mesmas entidades hoje persistidas em
-- localStorage pelo front-end (ver js/core/storage.js e js/services/*.js).
-- Ele NÃO é executado pelo sistema atual — é o ponto de partida para a
-- futura API REST/banco de dados descrita em docs/tecnico/04-plano-migracao-api.md.
-- Convenções: chaves primárias UUID, timestamps em UTC, valores monetários em
-- NUMERIC(12,2), enums de status implementados como CHECK constraints para
-- manter compatibilidade ampla entre bancos.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Empresa (dados da empresa — Configurações > Empresa)
-- ---------------------------------------------------------------------------
CREATE TABLE empresas (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  razao_social     VARCHAR(160) NOT NULL,
  nome_fantasia    VARCHAR(160),
  cnpj             VARCHAR(18),
  telefone         VARCHAR(20),
  email            VARCHAR(160),
  logo_url         TEXT,
  cep              VARCHAR(10),
  endereco         VARCHAR(160),
  numero           VARCHAR(20),
  complemento      VARCHAR(80),
  bairro           VARCHAR(80),
  cidade           VARCHAR(80),
  estado           CHAR(2),
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Usuários e perfis de acesso
-- ---------------------------------------------------------------------------
CREATE TABLE usuarios (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id       UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nome             VARCHAR(160) NOT NULL,
  email            VARCHAR(160) NOT NULL UNIQUE,
  login            VARCHAR(80) NOT NULL UNIQUE,
  perfil           VARCHAR(20) NOT NULL CHECK (perfil IN ('Administrador','Gerente','Financeiro','Vendedor','Estoque','Usuario')),
  senha_hash       VARCHAR(255) NOT NULL,
  status           VARCHAR(10) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo','inativo')),
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em    TIMESTAMPTZ
);

-- ---------------------------------------------------------------------------
-- Clientes e fornecedores (mesma forma, tabelas separadas por domínio)
-- ---------------------------------------------------------------------------
CREATE TABLE clientes (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id       UUID REFERENCES empresas(id) ON DELETE CASCADE,
  codigo           VARCHAR(20) NOT NULL,
  tipo_pessoa      CHAR(2) NOT NULL CHECK (tipo_pessoa IN ('PF','PJ')),
  nome             VARCHAR(160) NOT NULL,
  nome_fantasia    VARCHAR(160),
  documento        VARCHAR(20),
  inscricao_estadual VARCHAR(30),
  email            VARCHAR(160),
  telefone         VARCHAR(20),
  celular          VARCHAR(20),
  cep              VARCHAR(10),
  endereco         VARCHAR(160),
  numero           VARCHAR(20),
  complemento      VARCHAR(80),
  bairro           VARCHAR(80),
  cidade           VARCHAR(80),
  estado           CHAR(2),
  observacoes      TEXT,
  status           VARCHAR(10) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo','inativo')),
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em    TIMESTAMPTZ,
  UNIQUE (empresa_id, codigo)
);

CREATE TABLE fornecedores (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id       UUID REFERENCES empresas(id) ON DELETE CASCADE,
  codigo           VARCHAR(20) NOT NULL,
  tipo_pessoa      CHAR(2) NOT NULL CHECK (tipo_pessoa IN ('PF','PJ')),
  nome             VARCHAR(160) NOT NULL,
  nome_fantasia    VARCHAR(160),
  documento        VARCHAR(20),
  inscricao_estadual VARCHAR(30),
  email            VARCHAR(160),
  telefone         VARCHAR(20),
  celular          VARCHAR(20),
  cep              VARCHAR(10),
  endereco         VARCHAR(160),
  numero           VARCHAR(20),
  complemento      VARCHAR(80),
  bairro           VARCHAR(80),
  cidade           VARCHAR(80),
  estado           CHAR(2),
  observacoes      TEXT,
  status           VARCHAR(10) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo','inativo')),
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em    TIMESTAMPTZ,
  UNIQUE (empresa_id, codigo)
);

-- ---------------------------------------------------------------------------
-- Categorias de produto e categorias financeiras
-- ---------------------------------------------------------------------------
CREATE TABLE categorias_produto (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id       UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nome             VARCHAR(80) NOT NULL,
  status           VARCHAR(10) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo','inativo'))
);

CREATE TABLE categorias_financeiras (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id       UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nome             VARCHAR(80) NOT NULL,
  natureza         VARCHAR(10) NOT NULL CHECK (natureza IN ('receita','despesa'))
);

-- ---------------------------------------------------------------------------
-- Produtos e estoque
-- ---------------------------------------------------------------------------
CREATE TABLE produtos (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id       UUID REFERENCES empresas(id) ON DELETE CASCADE,
  codigo           VARCHAR(20) NOT NULL,
  sku              VARCHAR(40),
  codigo_barras    VARCHAR(40),
  nome             VARCHAR(160) NOT NULL,
  categoria_id     UUID REFERENCES categorias_produto(id),
  fornecedor_id    UUID REFERENCES fornecedores(id),
  marca            VARCHAR(80),
  unidade          VARCHAR(10) NOT NULL DEFAULT 'UN',
  preco_custo      NUMERIC(12,2) NOT NULL DEFAULT 0,
  preco_venda      NUMERIC(12,2) NOT NULL DEFAULT 0,
  estoque_atual    NUMERIC(12,3) NOT NULL DEFAULT 0,
  estoque_minimo   NUMERIC(12,3) NOT NULL DEFAULT 0,
  status           VARCHAR(10) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo','inativo')),
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em    TIMESTAMPTZ,
  UNIQUE (empresa_id, codigo)
);
CREATE INDEX idx_produtos_estoque_baixo ON produtos (empresa_id) WHERE estoque_atual <= estoque_minimo;

CREATE TABLE movimentacoes_estoque (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id       UUID REFERENCES empresas(id) ON DELETE CASCADE,
  produto_id       UUID NOT NULL REFERENCES produtos(id),
  data_movimento   DATE NOT NULL DEFAULT CURRENT_DATE,
  quantidade       NUMERIC(12,3) NOT NULL, -- delta assinado já aplicado ao saldo
  tipo             VARCHAR(12) NOT NULL CHECK (tipo IN ('entrada','saida','ajuste','inventario')),
  motivo           VARCHAR(160),
  responsavel_id   UUID REFERENCES usuarios(id),
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_movimentacoes_produto ON movimentacoes_estoque (produto_id, data_movimento DESC);

-- ---------------------------------------------------------------------------
-- Vendas
-- ---------------------------------------------------------------------------
CREATE TABLE vendas (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id       UUID REFERENCES empresas(id) ON DELETE CASCADE,
  numero           VARCHAR(20) NOT NULL,
  cliente_id       UUID NOT NULL REFERENCES clientes(id),
  vendedor_id      UUID REFERENCES usuarios(id),
  data_venda       DATE NOT NULL DEFAULT CURRENT_DATE,
  forma_pagamento  VARCHAR(30),
  subtotal         NUMERIC(12,2) NOT NULL DEFAULT 0,
  desconto         NUMERIC(12,2) NOT NULL DEFAULT 0,
  total            NUMERIC(12,2) NOT NULL DEFAULT 0,
  status           VARCHAR(12) NOT NULL DEFAULT 'pendente' CHECK (status IN ('orcamento','pendente','pago','finalizado','cancelado')),
  observacoes      TEXT,
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em    TIMESTAMPTZ,
  UNIQUE (empresa_id, numero)
);

CREATE TABLE itens_venda (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venda_id         UUID NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
  produto_id       UUID NOT NULL REFERENCES produtos(id),
  quantidade       NUMERIC(12,3) NOT NULL CHECK (quantidade > 0),
  preco_unitario   NUMERIC(12,2) NOT NULL,
  desconto_item    NUMERIC(12,2) NOT NULL DEFAULT 0
);
CREATE INDEX idx_itens_venda_venda ON itens_venda (venda_id);

-- ---------------------------------------------------------------------------
-- Compras
-- ---------------------------------------------------------------------------
CREATE TABLE compras (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id       UUID REFERENCES empresas(id) ON DELETE CASCADE,
  numero           VARCHAR(20) NOT NULL,
  fornecedor_id    UUID NOT NULL REFERENCES fornecedores(id),
  responsavel_id   UUID REFERENCES usuarios(id),
  data_compra      DATE NOT NULL DEFAULT CURRENT_DATE,
  forma_pagamento  VARCHAR(30),
  total            NUMERIC(12,2) NOT NULL DEFAULT 0,
  status           VARCHAR(12) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','confirmada','cancelada')),
  observacoes      TEXT,
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em    TIMESTAMPTZ,
  UNIQUE (empresa_id, numero)
);

CREATE TABLE itens_compra (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  compra_id        UUID NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
  produto_id       UUID NOT NULL REFERENCES produtos(id),
  quantidade       NUMERIC(12,3) NOT NULL CHECK (quantidade > 0),
  custo_unitario   NUMERIC(12,2) NOT NULL
);
CREATE INDEX idx_itens_compra_compra ON itens_compra (compra_id);

-- ---------------------------------------------------------------------------
-- Financeiro: contas a pagar, a receber e lançamentos manuais de caixa
-- ---------------------------------------------------------------------------
CREATE TABLE contas_pagar (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id       UUID REFERENCES empresas(id) ON DELETE CASCADE,
  descricao        VARCHAR(200) NOT NULL,
  fornecedor_id    UUID REFERENCES fornecedores(id),
  categoria_id     UUID REFERENCES categorias_financeiras(id),
  compra_origem_id UUID REFERENCES compras(id),
  valor            NUMERIC(12,2) NOT NULL CHECK (valor >= 0),
  data_emissao     DATE NOT NULL,
  data_vencimento  DATE NOT NULL,
  data_pagamento   DATE,
  forma_pagamento  VARCHAR(30),
  status           VARCHAR(10) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','pago','cancelado')),
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_contas_pagar_vencimento ON contas_pagar (empresa_id, data_vencimento) WHERE status = 'pendente';

CREATE TABLE contas_receber (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id       UUID REFERENCES empresas(id) ON DELETE CASCADE,
  descricao        VARCHAR(200) NOT NULL,
  cliente_id       UUID REFERENCES clientes(id),
  categoria_id     UUID REFERENCES categorias_financeiras(id),
  venda_origem_id  UUID REFERENCES vendas(id),
  valor            NUMERIC(12,2) NOT NULL CHECK (valor >= 0),
  data_emissao     DATE NOT NULL,
  data_vencimento  DATE NOT NULL,
  data_recebimento DATE,
  forma_pagamento  VARCHAR(30),
  status           VARCHAR(10) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','recebido','cancelado')),
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_contas_receber_vencimento ON contas_receber (empresa_id, data_vencimento) WHERE status = 'pendente';

CREATE TABLE lancamentos_caixa (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id       UUID REFERENCES empresas(id) ON DELETE CASCADE,
  data_lancamento  DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo             VARCHAR(8) NOT NULL CHECK (tipo IN ('entrada','saida')),
  descricao        VARCHAR(200) NOT NULL,
  categoria_id     UUID REFERENCES categorias_financeiras(id),
  valor            NUMERIC(12,2) NOT NULL CHECK (valor > 0),
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Notificações do sistema
-- ---------------------------------------------------------------------------
CREATE TABLE notificacoes (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id       UUID REFERENCES empresas(id) ON DELETE CASCADE,
  usuario_id       UUID REFERENCES usuarios(id),
  tipo             VARCHAR(20) NOT NULL,
  mensagem         VARCHAR(300) NOT NULL,
  link             VARCHAR(200),
  chave_deduplicacao VARCHAR(100),
  lida             BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notificacoes_usuario ON notificacoes (usuario_id, lida);

-- =============================================================================
-- Fim do script. Consulte docs/tecnico/02-modelo-de-dados.md para o
-- dicionário de dados completo e docs/tecnico/04-plano-migracao-api.md para
-- o roteiro de substituição do localStorage por esta base relacional.
-- =============================================================================
