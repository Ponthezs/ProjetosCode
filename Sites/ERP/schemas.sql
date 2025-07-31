
CREATE DATABASE IF NOT EXISTS gestorpro_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gestorpro_db;

-- Tabela para armazenar os utilizadores da aplicação
CREATE TABLE IF NOT EXISTS utilizadores (
    id INT AUTO_INCREMENT PRIMARY KEY,                          -- Identificador único do utilizador
    username VARCHAR(100) NOT NULL UNIQUE,                      -- Nome de utilizador (deve ser único)
    password_hash VARCHAR(255) NOT NULL,                        -- Hash da senha do utilizador (NUNCA guarde senhas em texto plano)
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,                    -- Indica se o utilizador é um administrador
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,             -- Data e hora de criação do registo
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Data e hora da última atualização
);

-- Tabela para armazenar os produtos da loja
CREATE TABLE IF NOT EXISTS produtos (
    id VARCHAR(50) PRIMARY KEY,                                 -- Código único do produto (ex: PROD001)
    name VARCHAR(255) NOT NULL,                                 -- Nome do produto
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),           -- Preço do produto (não pode ser negativo)
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),            -- Quantidade em stock (não pode ser negativa)
    image_url TEXT,                                             -- URL da imagem do produto (opcional)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,             -- Data e hora de criação do registo
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Data e hora da última atualização
);

-- Tabela para armazenar os itens no carrinho de cada utilizador
CREATE TABLE IF NOT EXISTS itens_carrinho_utilizador (
    utilizador_id INT NOT NULL,                                 -- Chave estrangeira referenciando o ID do utilizador
    produto_id VARCHAR(50) NOT NULL,                            -- Chave estrangeira referenciando o ID (código) do produto
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),       -- Quantidade do produto no carrinho (deve ser maior que zero)
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,               -- Data e hora em que o item foi adicionado/atualizado no carrinho
    PRIMARY KEY (utilizador_id, produto_id),                    -- Chave primária composta para garantir um produto por utilizador no carrinho (a quantidade é atualizada)
    FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id) ON DELETE CASCADE ON UPDATE CASCADE, -- Se o utilizador for apagado, os seus itens de carrinho também são.
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE ON UPDATE CASCADE       -- Se o produto for apagado, os itens correspondentes nos carrinhos também são.
);

-- Inserir o utilizador administrador padrão (apenas para fins de exemplo e desenvolvimento)
-- Numa aplicação real, a criação de utilizadores seria feita através da interface de registo.
-- A senha '1234' deve ser substituída por um HASH SEGURO gerado pela sua aplicação.
-- Exemplo: INSERT IGNORE INTO utilizadores (username, password_hash, is_admin) VALUES ('adm', 'HASH_DA_SENHA_1234', TRUE);
-- O 'IGNORE' (MySQL) ou 'ON CONFLICT DO NOTHING' (PostgreSQL/SQLite) evita erro se o 'adm' já existir.
-- Como a geração de hash é específica da linguagem de backend, aqui fica apenas o comentário.

-- Exemplo de inserção de produtos (opcional, para ter dados iniciais)
/*
INSERT INTO produtos (id, name, price, stock, image_url) VALUES
('PROD001', 'Caneta Esferográfica Pro', 2.50, 100, 'https://placehold.co/400x225/007bff/white?text=Caneta+Azul'),
('PROD002', 'Caderno Universitário Premium', 15.00, 50, 'https://placehold.co/400x225/28a745/white?text=Caderno'),
('PROD003', 'Borracha Soft Touch', 1.75, 200, 'https://placehold.co/400x225/ffc107/black?text=Borracha')
ON CONFLICT(id) DO NOTHING; -- Para PostgreSQL/SQLite. Para MySQL, use INSERT IGNORE ou ON DUPLICATE KEY UPDATE.
*/

-- Adicionar alguns índices para melhorar o desempenho das consultas (opcional, mas recomendado)
CREATE INDEX IF NOT EXISTS idx_produtos_name ON produtos(name);
CREATE INDEX IF NOT EXISTS idx_itens_carrinho_produto_id ON itens_carrinho_utilizador(produto_id);

-- Fim do script SQL
