-- Criação do banco de dados
CREATE DATABASE RestauranteDB;
GO

USE RestauranteDB;
GO

-- Tabela de Clientes
CREATE TABLE Clientes (
    Id INT IDENTITY PRIMARY KEY,
    Nome NVARCHAR(100) NOT NULL,
    Telefone NVARCHAR(15) NOT NULL,
    Email NVARCHAR(100) NULL,
    DataCadastro DATETIME DEFAULT GETDATE()
);

-- Tabela de Reservas
CREATE TABLE Reservas (
    Id INT IDENTITY PRIMARY KEY,
    ClienteId INT NOT NULL FOREIGN KEY REFERENCES Clientes(Id),
    NumeroPessoas INT NOT NULL CHECK (NumeroPessoas > 0),
    DataReserva DATETIME NOT NULL,
    Status NVARCHAR(20) DEFAULT 'Pendente' CHECK (Status IN ('Pendente', 'Confirmada', 'Cancelada')),
    Observacoes NVARCHAR(MAX) NULL
);

-- Tabela de Administradores
CREATE TABLE Administradores (
    Id INT IDENTITY PRIMARY KEY,
    Nome NVARCHAR(100) NOT NULL,
    Usuario NVARCHAR(50) NOT NULL UNIQUE,
    Senha NVARCHAR(255) NOT NULL
);

-- Procedimento para listar clientes
CREATE PROCEDURE ListarClientes
AS
BEGIN
    SELECT Id, Nome, Telefone, Email, DataCadastro
    FROM Clientes
    ORDER BY Nome;
END;

-- Procedimento para inserir um novo cliente
CREATE PROCEDURE InserirCliente
    @Nome NVARCHAR(100),
    @Telefone NVARCHAR(15),
    @Email NVARCHAR(100)
AS
BEGIN
    INSERT INTO Clientes (Nome, Telefone, Email)
    VALUES (@Nome, @Telefone, @Email);
END;

-- Procedimento para atualizar um cliente
CREATE PROCEDURE AtualizarCliente
    @Id INT,
    @Nome NVARCHAR(100),
    @Telefone NVARCHAR(15),
    @Email NVARCHAR(100)
AS
BEGIN
    UPDATE Clientes
    SET Nome = @Nome, Telefone = @Telefone, Email = @Email
    WHERE Id = @Id;
END;

-- Procedimento para excluir um cliente
CREATE PROCEDURE ExcluirCliente
    @Id INT
AS
BEGIN
    DELETE FROM Clientes
    WHERE Id = @Id;
END;

-- Procedimento para listar reservas
CREATE PROCEDURE ListarReservas
AS
BEGIN
    SELECT r.Id, c.Nome AS Cliente, r.NumeroPessoas, r.DataReserva, r.Status, r.Observacoes
    FROM Reservas r
    JOIN Clientes c ON r.ClienteId = c.Id
    ORDER BY r.DataReserva;
END;

-- Procedimento para inserir uma nova reserva
CREATE PROCEDURE InserirReserva
    @ClienteId INT,
    @NumeroPessoas INT,
    @DataReserva DATETIME,
    @Observacoes NVARCHAR(MAX)
AS
BEGIN
    INSERT INTO Reservas (ClienteId, NumeroPessoas, DataReserva, Observacoes)
    VALUES (@ClienteId, @NumeroPessoas, @DataReserva, @Observacoes);
END;

-- Procedimento para atualizar uma reserva
CREATE PROCEDURE AtualizarReserva
    @Id INT,
    @DataReserva DATETIME,
    @NumeroPessoas INT,
    @Status NVARCHAR(20)
AS
BEGIN
    UPDATE Reservas
    SET DataReserva = @DataReserva, NumeroPessoas = @NumeroPessoas, Status = @Status
    WHERE Id = @Id;
END;

-- Procedimento para cancelar uma reserva
CREATE PROCEDURE CancelarReserva
    @Id INT
AS
BEGIN
    UPDATE Reservas
    SET Status = 'Cancelada'
    WHERE Id = @Id;
END;

-- Procedimento para confirmar uma reserva
CREATE PROCEDURE ConfirmarReserva
    @Id INT
AS
BEGIN
    UPDATE Reservas
    SET Status = 'Confirmada'
    WHERE Id = @Id;
END;

-- Procedimento para listar administradores
CREATE PROCEDURE ListarAdministradores
AS
BEGIN
    SELECT Id, Nome, Usuario
    FROM Administradores
    ORDER BY Nome;
END;

-- Procedimento para inserir um novo administrador
CREATE PROCEDURE InserirAdministrador
    @Nome NVARCHAR(100),
    @Usuario NVARCHAR(50),
    @Senha NVARCHAR(255)
AS
BEGIN
    INSERT INTO Administradores (Nome, Usuario, Senha)
    VALUES (@Nome, @Usuario, @Senha);
END;

-- Procedimento para excluir um administrador
CREATE PROCEDURE ExcluirAdministrador
    @Id INT
AS
BEGIN
    DELETE FROM Administradores
    WHERE Id = @Id;
END;

-- Inserindo dados iniciais para teste
INSERT INTO Administradores (Nome, Usuario, Senha)
VALUES ('Administrador Principal', 'admin', 'admin123'); -- Substitua por uma senha hash em produção

INSERT INTO Clientes (Nome, Telefone, Email)
VALUES 
('João da Silva', '123456789', 'joao@email.com'),
('Maria Oliveira', '987654321', 'maria@email.com');

INSERT INTO Reservas (ClienteId, NumeroPessoas, DataReserva, Observacoes)
VALUES 
(1, 4, '2025-02-10 20:00', 'Mesa no canto.'),
(2, 2, '2025-02-12 18:30', 'Comemoração de aniversário.');
