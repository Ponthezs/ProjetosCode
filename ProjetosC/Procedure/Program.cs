using System;
using System.Data.SqlClient;

class Program
{
    static string connectionString = "Server=SEU_SERVIDOR;Database=RestauranteDB;Trusted_Connection=True;";

    static void Main(string[] args)
    {
        while (true)
        {
            Console.WriteLine("\n=== Sistema de Reservas de Restaurante ===");
            Console.WriteLine("1. Adicionar Cliente");
            Console.WriteLine("2. Adicionar Reserva");
            Console.WriteLine("3. Listar Reservas");
            Console.WriteLine("4. Confirmar Reserva");
            Console.WriteLine("5. Cancelar Reserva");
            Console.WriteLine("6. Sair");
            Console.Write("Escolha uma opção: ");
            string opcao = Console.ReadLine();

            switch (opcao)
            {
                case "1":
                    AdicionarCliente();
                    break;
                case "2":
                    AdicionarReserva();
                    break;
                case "3":
                    ListarReservas();
                    break;
                case "4":
                    AlterarStatusReserva("Confirmada");
                    break;
                case "5":
                    AlterarStatusReserva("Cancelada");
                    break;
                case "6":
                    Console.WriteLine("Saindo do sistema...");
                    return;
                default:
                    Console.WriteLine("Opção inválida, tente novamente.");
                    break;
            }
        }
    }

    static void AdicionarCliente()
    {
        Console.Write("Digite o nome do cliente: ");
        string nome = Console.ReadLine();

        Console.Write("Digite o telefone: ");
        string telefone = Console.ReadLine();

        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            connection.Open();
            string query = "INSERT INTO Clientes (Nome, Telefone) VALUES (@Nome, @Telefone)";
            using (SqlCommand command = new SqlCommand(query, connection))
            {
                command.Parameters.AddWithValue("@Nome", nome);
                command.Parameters.AddWithValue("@Telefone", telefone);
                command.ExecuteNonQuery();
                Console.WriteLine("Cliente cadastrado com sucesso!");
            }
        }
    }

    static void AdicionarReserva()
    {
        Console.Write("Digite o ID do cliente: ");
        int clienteId = int.Parse(Console.ReadLine());

        Console.Write("Digite o número de pessoas: ");
        int numeroPessoas = int.Parse(Console.ReadLine());

        Console.Write("Digite a data e hora da reserva (yyyy-MM-dd HH:mm): ");
        DateTime dataReserva = DateTime.Parse(Console.ReadLine());

        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            connection.Open();
            using (SqlCommand command = new SqlCommand("InserirReserva", connection))
            {
                command.CommandType = System.Data.CommandType.StoredProcedure;
                command.Parameters.AddWithValue("@ClienteId", clienteId);
                command.Parameters.AddWithValue("@NumeroPessoas", numeroPessoas);
                command.Parameters.AddWithValue("@DataReserva", dataReserva);
                command.ExecuteNonQuery();
                Console.WriteLine("Reserva adicionada com sucesso!");
            }
        }
    }

    static void ListarReservas()
    {
        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            connection.Open();
            string query = "SELECT R.Id, C.Nome, R.NumeroPessoas, R.DataReserva, R.Status FROM Reservas R INNER JOIN Clientes C ON R.ClienteId = C.Id";
            using (SqlCommand command = new SqlCommand(query, connection))
            using (SqlDataReader reader = command.ExecuteReader())
            {
                Console.WriteLine("\n=== Lista de Reservas ===");
                while (reader.Read())
                {
                    Console.WriteLine($"ID: {reader["Id"]}, Cliente: {reader["Nome"]}, Pessoas: {reader["NumeroPessoas"]}, Data: {reader["DataReserva"]}, Status: {reader["Status"]}");
                }
            }
        }
    }

    static void AlterarStatusReserva(string status)
    {
        Console.Write("Digite o ID da reserva: ");
        int id = int.Parse(Console.ReadLine());

        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            connection.Open();
            string query = "UPDATE Reservas SET Status = @Status WHERE Id = @Id";
            using (SqlCommand command = new SqlCommand(query, connection))
            {
                command.Parameters.AddWithValue("@Status", status);
                command.Parameters.AddWithValue("@Id", id);
                int rowsAffected = command.ExecuteNonQuery();
                if (rowsAffected > 0)
                {
                    Console.WriteLine($"Reserva {status.ToLower()} com sucesso!");
                }
                else
                {
                    Console.WriteLine("Reserva não encontrada.");
                }
            }
        }
    }
}
