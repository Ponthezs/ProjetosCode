import tkinter as tk
from tkinter import messagebox
import csv
import os

# Nome do arquivo CSV onde os dados serão armazenados
arquivo_csv = 'pontos_jogo.csv'

# Função para adicionar ou atualizar uma pontuação no arquivo CSV
def salvar_pontuacao(nome, pontos):
    linhas = []
    existe_arquivo = os.path.isfile(arquivo_csv)
    
    # Lê todas as linhas existentes
    if existe_arquivo:
        with open(arquivo_csv, mode='r') as arquivo:
            leitor_csv = csv.reader(arquivo)
            linhas = list(leitor_csv)
    
    # Atualiza ou adiciona a pontuação
    encontrado = False
    for linha in linhas:
        if linha[0] == nome:
            linha[1] = pontos
            encontrado = True
            break

    if not encontrado:
        linhas.append([nome, pontos])

    # Grava as linhas de volta no arquivo
    with open(arquivo_csv, mode='w', newline='') as arquivo:
        escritor_csv = csv.writer(arquivo)
        if not existe_arquivo:
            escritor_csv.writerow(['Nome', 'Pontos'])
        escritor_csv.writerows(linhas)
    messagebox.showinfo("Sucesso", "Pontuação salva com sucesso!")

# Função para exibir todas as pontuações na interface gráfica
def exibir_pontuacoes():
    lista_pontuacoes.delete(1.0, tk.END)  # Limpa o texto existente
    if not os.path.isfile(arquivo_csv):
        lista_pontuacoes.insert(tk.END, "Nenhuma pontuação armazenada ainda.\n")
        return
    
    with open(arquivo_csv, mode='r') as arquivo:
        leitor_csv = csv.reader(arquivo)
        cabecalho = next(leitor_csv)  # Pular o cabeçalho
        for linha in leitor_csv:
            nome, pontos = linha
            lista_pontuacoes.insert(tk.END, f"Nome: {nome}, Pontos: {pontos}\n")

# Função chamada quando o botão "Salvar" é pressionado
def salvar():
    nome = entrada_nome.get()
    pontos = entrada_pontos.get()
    if not nome or not pontos:
        messagebox.showwarning("Entrada inválida", "Por favor, preencha todos os campos.")
        return
    salvar_pontuacao(nome, pontos)
    entrada_nome.delete(0, tk.END)
    entrada_pontos.delete(0, tk.END)
    exibir_pontuacoes()

# Criação da janela principal
root = tk.Tk()
root.title("Armazenamento de Pontuações de Jogos")

# Criação dos widgets
label_nome = tk.Label(root, text="Nome do Jogador:")
label_nome.pack()

entrada_nome = tk.Entry(root)
entrada_nome.pack()

label_pontos = tk.Label(root, text="Pontuação:")
label_pontos.pack()

entrada_pontos = tk.Entry(root)
entrada_pontos.pack()

botao_salvar = tk.Button(root, text="Salvar", command=salvar)
botao_salvar.pack()

botao_exibir = tk.Button(root, text="Exibir Pontuações", command=exibir_pontuacoes)
botao_exibir.pack()

lista_pontuacoes = tk.Text(root, height=10, width=50)
lista_pontuacoes.pack()

# Inicia a interface gráfica
root.mainloop()
