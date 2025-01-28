using System;

class AdminPanel
{
    public static void ExibirPainel()
    {
        while (true)
        {
            Console.WriteLine("\n=== Painel do Administrador ===");
            Console.WriteLine("1. Gerenciar Clientes");
            Console.WriteLine("2. Gerenciar Reservas");
            Console.WriteLine("3. Voltar ao Menu Principal");
            Console.Write("Escolha uma opção: ");
            string opcao = Console.ReadLine();

            switch (opcao)
            {
                case "1":
                    ClienteManager.ExibirMenuClientes();
                    break;
                case "2":
                    ReservaManager.ExibirMenuReservas();
                    break;
                case "3":
                    return;
                default:
                    Console.WriteLine("Opção inválida, tente novamente.");
                    break;
            }
        }
    }
}
