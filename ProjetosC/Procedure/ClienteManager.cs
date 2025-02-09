using System;
using System.Data.SqlClient;

class ClienteManager
{
    static string connectionString = "Server=SEU_SERVIDOR;Database=RestauranteDB;Trusted_Connection=True;";

    public static void ExibirMenuClientes()
    {
        while (true)
        {
            Console.WriteLine("\n=== Gerenciamento de Clientes ===");
            Console.WriteLine("1. Listar Clientes");
            Console.WriteLine("2. Editar Cliente");
            Console.WriteLine("3. Excluir Cliente");
            Console.WriteLine("4. Voltar");
            Console.Write("Escolha uma opção: ");
            string opcao = Console.ReadLine();

            switch (opcao)
            {
                case "1":
                    ListarClientes();
                    break;
                case "2":
                    EditarCliente();
                    break;
                case "3":
                    ExcluirCliente();
                    break;
                case "4":
                    return;
                default:
                    Console.WriteLine("Opção inválida, tente novamente.");
                    break;
            }
        }
    }

    static void ListarClientes()
    {
        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            connection.Open();
            string query = "SELECT Id, Nome, Telefone FROM Clientes";
            using (SqlCommand command = new SqlCommand(query, connection))
            using (SqlDataReader reader = command.ExecuteReader())
            {
                Console.WriteLine("\n=== Lista de Clientes ===");
                while (reader.Read())
                {
                    Console.WriteLine($"ID: {reader["Id"]}, Nome: {reader["Nome"]}, Telefone: {reader["Telefone"]}");
                }
            }
        }
    }

    static void EditarCliente()
    {
        Console.Write("Digite o ID do cliente que deseja editar: ");
        int id = int.Parse(Console.ReadLine());

        Console.Write("Novo nome: ");
        string novoNome = Console.ReadLine();

        Console.Write("Novo telefone: ");
        string novoTelefone = Console.ReadLine();

        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            connection.Open();
            string query = "UPDATE Clientes SET Nome = @Nome, Telefone = @Telefone WHERE Id = @Id";
            using (SqlCommand command = new SqlCommand(query, connection))
            {
                command.Parameters.AddWithValue("@Nome", novoNome);
                command.Parameters.AddWithValue("@Telefone", novoTelefone);
                command.Parameters.AddWithValue("@Id", id);
                command.ExecuteNonQuery();
                Console.WriteLine("Cliente atualizado com sucesso!");
            }
        }
    }

    static void ExcluirCliente()
    {
        Console.Write("Digite o ID do cliente que deseja excluir: ");
        int id = int.Parse(Console.ReadLine());

        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            connection.Open();
            string query = "DELETE FROM Clientes WHERE Id = @Id";
            using (SqlCommand command = new SqlCommand(query, connection))
            {
                command.Parameters.AddWithValue("@Id", id);
                command.ExecuteNonQuery();
                Console.WriteLine("Cliente excluído com sucesso!");
            }
        }
    }
}
