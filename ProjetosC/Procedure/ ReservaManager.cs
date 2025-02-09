using System;
using System.Data.SqlClient;

class ReservaManager
{
    static string connectionString = "Server=SEU_SERVIDOR;Database=RestauranteDB;Trusted_Connection=True;";

    public static void ExibirMenuReservas()
    {
        while (true)
        {
            Console.WriteLine("\n=== Gerenciamento de Reservas ===");
            Console.WriteLine("1. Listar Reservas");
            Console.WriteLine("2. Alterar Data da Reserva");
            Console.WriteLine("3. Confirmar Reserva");
            Console.WriteLine("4. Cancelar Reserva");
            Console.WriteLine("5. Voltar");
            Console.Write("Escolha uma opção: ");
            string opcao = Console.ReadLine();

            switch (opcao)
            {
                case "1":
                    ListarReservas();
                    break;
                case "2":
                    AlterarDataReserva();
                    break;
                case "3":
                    AlterarStatusReserva("Confirmada");
                    break;
                case "4":
                    AlterarStatusReserva("Cancelada");
                    break;
                case "5":
                    return;
                default:
                    Console.WriteLine("Opção inválida, tente novamente.");
                    break;
            }
        }
    }

    static void ListarReservas()
    {
        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            connection.Open();
            string query = "SELECT Id, ClienteId, NumeroPessoas, DataReserva, Status FROM Reservas";
            using (SqlCommand command = new SqlCommand(query, connection))
            using (SqlDataReader reader = command.ExecuteReader())
            {
                Console.WriteLine("\n=== Lista de Reservas ===");
                while (reader.Read())
                {
                    Console.WriteLine($"ID: {reader["Id"]}, Cliente ID: {reader["ClienteId"]}, Pessoas: {reader["NumeroPessoas"]}, Data: {reader["DataReserva"]}, Status: {reader["Status"]}");
                }
            }
        }
    }

    static void AlterarDataReserva()
    {
        Console.Write("Digite o ID da reserva: ");
        int id = int.Parse(Console.ReadLine());

        Console.Write("Digite a nova data e hora da reserva (yyyy-MM-dd HH:mm): ");
        DateTime novaData = DateTime.Parse(Console.ReadLine());

        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            connection.Open();
            string query = "UPDATE Reservas SET DataReserva = @DataReserva WHERE Id = @Id";
            using (SqlCommand command = new SqlCommand(query, connection))
            {
                command.Parameters.AddWithValue("@DataReserva", novaData);
                command.Parameters.AddWithValue("@Id", id);
                command.ExecuteNonQuery();
                Console.WriteLine("Data da reserva alterada com sucesso!");
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
                command.ExecuteNonQuery();
                Console.WriteLine($"Reserva {status.ToLower()} com sucesso!");
            }
        }
    }
}
