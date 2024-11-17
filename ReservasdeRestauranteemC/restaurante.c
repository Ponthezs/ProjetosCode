#include <stdio.h>
#include <stdlib.h>
#include <locale.h>
#include <string.h>

typedef struct {
    char nome[50];
    char cpf[15];
    int dia; // 1- Quinta, 2- Sexta, 3- Sábado, 4- Domingo
    int quantidade;
} Reserva;

#define MAX_RESERVAS 100
Reserva reservas[MAX_RESERVAS];
int totalReservas = 0;

void printTitulo(const char *titulo) {
    printf("\033[1;34m=============================================\033[0m\n");
    printf("\033[1;33m%s\033[0m\n", titulo);
    printf("\033[1;34m=============================================\033[0m\n");
}

void printLinha() {
    printf("\033[1;34m---------------------------------------------\033[0m\n");
}

void fazerReserva() {
    if (totalReservas >= MAX_RESERVAS) {
        printf("\033[1;31mLimite de reservas atingido!\033[0m\n");
        return;
    }

    printTitulo("Nova Reserva");
    printf("Digite o nome do responsável pela reserva: ");
    fflush(stdin);
    fgets(reservas[totalReservas].nome, 50, stdin);
    reservas[totalReservas].nome[strcspn(reservas[totalReservas].nome, "\n")] = 0;

    printf("Digite o CPF: ");
    fflush(stdin);
    fgets(reservas[totalReservas].cpf, 15, stdin);
    reservas[totalReservas].cpf[strcspn(reservas[totalReservas].cpf, "\n")] = 0;

    printf("Digite o dia da reserva (1- Quinta, 2- Sexta, 3- Sábado, 4- Domingo): ");
    scanf("%d", &reservas[totalReservas].dia);

    printf("Digite a quantidade de pessoas: ");
    scanf("%d", &reservas[totalReservas].quantidade);

    totalReservas++;
    printf("\033[1;32mReserva cadastrada com sucesso!\033[0m\n");
}

void listarReservas() {
    if (totalReservas == 0) {
        printf("\033[1;31mNenhuma reserva cadastrada!\033[0m\n");
        return;
    }

    printTitulo("Lista de Reservas");
    for (int i = 0; i < totalReservas; i++) {
        printf("\033[1;36mNome: \033[0m%s\n", reservas[i].nome);
        printf("\033[1;36mCPF: \033[0m%s\n", reservas[i].cpf);
        printf("\033[1;36mDia: \033[0m%d\n", reservas[i].dia);
        printf("\033[1;36mNúmero de Pessoas: \033[0m%d\n", reservas[i].quantidade);
        printLinha();
    }
}

void totalPessoasPorDia() {
    int dia, totalPessoas = 0;

    printTitulo("Total de Pessoas por Dia");
    printf("Digite o dia da reserva (1- Quinta, 2- Sexta, 3- Sábado, 4- Domingo): ");
    scanf("%d", &dia);

    for (int i = 0; i < totalReservas; i++) {
        if (reservas[i].dia == dia) {
            totalPessoas += reservas[i].quantidade;
        }
    }

    printf("\033[1;32mTotal de pessoas para o dia %d: %d\033[0m\n", dia, totalPessoas);
}

int main() {
    setlocale(LC_ALL, "Portuguese");
    int opcao;

    do {
        system("cls || clear");
        printTitulo("Menu Principal");
        printf("\033[1;36m1 - Fazer Reserva\033[0m\n");
        printf("\033[1;36m2 - Listar Reservas\033[0m\n");
        printf("\033[1;36m3 - Total de Pessoas Por Dia\033[0m\n");
        printf("\033[1;36m4 - Sair\033[0m\n");
        printLinha();
        printf("Escolha uma opção: ");
        scanf("%d", &opcao);

        system("cls || clear");
        switch (opcao) {
            case 1:
                fazerReserva();
                break;
            case 2:
                listarReservas();
                break;
            case 3:
                totalPessoasPorDia();
                break;
            case 4:
                printTitulo("Encerrando o programa...");
                break;
            default:
                printf("\033[1;31mOpção inválida! Tente novamente.\033[0m\n");
        }

        if (opcao != 4) {
            printf("\n");
            system("pause || read -n 1 -s -r -p \"Pressione qualquer tecla para continuar...\"");
        }
    } while (opcao != 4);

    return 0;
}
