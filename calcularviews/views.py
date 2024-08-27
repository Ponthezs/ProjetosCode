import tkinter as tk
from tkinter import ttk

# Função para calcular a receita
def calcular_receita():
    try:
        visualizacoes = int(entrada_visualizacoes.get())
        receita = (visualizacoes / 100000) * 1000
        rotulo_receita.config(text=f"Receita Estimada: ${receita:.2f}")
    except ValueError:
        rotulo_receita.config(text="Por favor, insira um número válido.")

# Configuração da janela principal
janela = tk.Tk()
janela.title("Calculadora de Receita")

# Configuração do layout
frame = ttk.Frame(janela, padding="10")
frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

# Label e entrada para visualizações
rotulo_visualizacoes = ttk.Label(frame, text="Quantidade de Visualizações:")
rotulo_visualizacoes.grid(row=0, column=0, sticky=tk.W, padx=5, pady=5)

entrada_visualizacoes = ttk.Entry(frame, width=20)
entrada_visualizacoes.grid(row=0, column=1, padx=5, pady=5)

# Botão para calcular a receita
botao_calcular = ttk.Button(frame, text="Calcular Receita", command=calcular_receita)
botao_calcular.grid(row=1, column=0, columnspan=2, pady=10)

# Label para mostrar a receita estimada
rotulo_receita = ttk.Label(frame, text="Receita Estimada: $0.00")
rotulo_receita.grid(row=2, column=0, columnspan=2, pady=5)

# Iniciar a aplicação
janela.mainloop()
