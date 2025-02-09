import tkinter as tk
from tkinter import ttk, messagebox
import pandas as pd
import os

# Nome da pasta onde os arquivos CSV serão armazenados
pasta_csv = 'arquivos_csv'

# Nome do arquivo principal onde os dados serão armazenados
nome_arquivo = os.path.join(pasta_csv, 'financas.csv')

# Função para garantir que a pasta exista
def garantir_pasta(pasta):
    if not os.path.exists(pasta):
        os.makedirs(pasta)

# Função para salvar dados em um arquivo CSV específico para o mês e ano
def salvar_dados_mensal(df, mes, ano):
    nome_arquivo_mensal = os.path.join(pasta_csv, f'financas_{ano}_{mes:02d}.csv')
    df.to_csv(nome_arquivo_mensal, index=False)

# Função para salvar dados no arquivo principal
def salvar_dados(df, nome_arquivo):
    df.to_csv(nome_arquivo, index=False)

# Função para carregar dados de um arquivo CSV
def carregar_dados(nome_arquivo):
    if os.path.exists(nome_arquivo):
        return pd.read_csv(nome_arquivo)
    else:
        return pd.DataFrame(columns=['Data', 'Descrição', 'Categoria', 'Valor', 'Tipo'])

# Função para adicionar uma nova transação
def adicionar_transacao():
    global df  # Declarar df como global para modificá-lo
    data = entry_data.get()
    descricao = entry_descricao.get()
    categoria = entry_categoria.get()
    try:
        valor = float(entry_valor.get())
    except ValueError:
        messagebox.showerror("Erro", "O valor deve ser um número.")
        return
    tipo = var_tipo.get()

    if not data or not descricao or not categoria or not tipo:
        messagebox.showwarning("Aviso", "Por favor, preencha todos os campos.")
        return

    nova_transacao = pd.DataFrame([[data, descricao, categoria, valor, tipo]], columns=df.columns)
    df = pd.concat([df, nova_transacao], ignore_index=True)
    salvar_dados(df, nome_arquivo)
    
    # Extrair mês e ano da nova transação
    mes, ano = pd.to_datetime(data).month, pd.to_datetime(data).year
    salvar_dados_mensal(df, mes, ano)

    messagebox.showinfo("Sucesso", "Transação adicionada com sucesso!")
    entry_data.delete(0, tk.END)
    entry_descricao.delete(0, tk.END)
    entry_categoria.delete(0, tk.END)
    entry_valor.delete(0, tk.END)
    var_tipo.set('')

# Função para mostrar resumo de gastos
def resumo_gastos():
    df['Data'] = pd.to_datetime(df['Data'], errors='coerce')
    df.dropna(subset=['Data'], inplace=True)  # Remove linhas com datas inválidas

    total_gastos = df[df['Tipo'] == 'Despesa']['Valor'].sum()
    total_receitas = df[df['Tipo'] == 'Receita']['Valor'].sum()
    saldo = total_receitas - total_gastos

    text_resumo.config(state=tk.NORMAL)
    text_resumo.delete(1.0, tk.END)
    text_resumo.insert(tk.END, f"Total de Despesas: R${total_gastos:.2f}\n")
    text_resumo.insert(tk.END, f"Total de Receitas: R${total_receitas:.2f}\n")
    text_resumo.insert(tk.END, f"Saldo: R${saldo:.2f}\n")
    text_resumo.config(state=tk.DISABLED)

# Função para exibir despesas com filtro de mês e ano
def mostrar_despesas():
    df['Data'] = pd.to_datetime(df['Data'], errors='coerce')
    df.dropna(subset=['Data'], inplace=True)  # Remove linhas com datas inválidas

    try:
        mes_filtro = int(entry_mes_filtro.get())
        ano_filtro = int(entry_ano_filtro.get())
    except ValueError:
        mes_filtro = None
        ano_filtro = None
    
    if mes_filtro and ano_filtro:
        despesas = df[(df['Tipo'] == 'Despesa') & (df['Data'].dt.month == mes_filtro) & (df['Data'].dt.year == ano_filtro)]
    else:
        despesas = df[df['Tipo'] == 'Despesa']

    for row in tree.get_children():
        tree.delete(row)
    
    for _, transacao in despesas.iterrows():
        tree.insert("", tk.END, values=(transacao['Data'].strftime('%Y-%m-%d'), transacao['Descrição'], transacao['Categoria'], f"R${transacao['Valor']:.2f}"))

# Função para calcular e mostrar gastos e saldo do mês
def calcular_saldo():
    df['Data'] = pd.to_datetime(df['Data'], errors='coerce')
    df.dropna(subset=['Data'], inplace=True)  # Remove linhas com datas inválidas

    try:
        salario = float(entry_salario.get())
    except ValueError:
        messagebox.showerror("Erro", "O salário deve ser um número.")
        return

    try:
        mes = int(entry_mes.get())
        ano = int(entry_ano.get())
    except ValueError:
        messagebox.showerror("Erro", "Mês e ano devem ser números.")
        return

    despesas_mes = df[(df['Tipo'] == 'Despesa') & (df['Data'].dt.month == mes) & (df['Data'].dt.year == ano)]
    total_despesas = despesas_mes['Valor'].sum()
    saldo = salario - total_despesas

    text_saldo.config(state=tk.NORMAL)
    text_saldo.delete(1.0, tk.END)
    text_saldo.insert(tk.END, f"Total de Despesas no Mês {mes}/{ano}: R${total_despesas:.2f}\n")
    text_saldo.insert(tk.END, f"Salário: R${salario:.2f}\n")
    text_saldo.insert(tk.END, f"Saldo Restante: R${saldo:.2f}\n")
    text_saldo.config(state=tk.DISABLED)

# Configuração da Interface
root = tk.Tk()
root.title("Controle de Finanças")

# Garantir que a pasta para arquivos CSV exista
garantir_pasta(pasta_csv)

# Carregar dados
df = carregar_dados(nome_arquivo)

# Frame para Adicionar Transação
frame_adicionar = ttk.Frame(root, padding="10")
frame_adicionar.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

ttk.Label(frame_adicionar, text="Adicionar Transação").grid(row=0, column=0, columnspan=2)

ttk.Label(frame_adicionar, text="Data (YYYY-MM-DD):").grid(row=1, column=0, sticky=tk.W)
entry_data = ttk.Entry(frame_adicionar)
entry_data.grid(row=1, column=1)

ttk.Label(frame_adicionar, text="Descrição:").grid(row=2, column=0, sticky=tk.W)
entry_descricao = ttk.Entry(frame_adicionar)
entry_descricao.grid(row=2, column=1)

ttk.Label(frame_adicionar, text="Categoria:").grid(row=3, column=0, sticky=tk.W)
entry_categoria = ttk.Entry(frame_adicionar)
entry_categoria.grid(row=3, column=1)

ttk.Label(frame_adicionar, text="Valor (R$):").grid(row=4, column=0, sticky=tk.W)
entry_valor = ttk.Entry(frame_adicionar)
entry_valor.grid(row=4, column=1)

ttk.Label(frame_adicionar, text="Tipo (Receita/Despesa):").grid(row=5, column=0, sticky=tk.W)
var_tipo = tk.StringVar()
entry_tipo = ttk.Combobox(frame_adicionar, textvariable=var_tipo, values=["Receita", "Despesa"])
entry_tipo.grid(row=5, column=1)

ttk.Button(frame_adicionar, text="Adicionar Transação", command=adicionar_transacao).grid(row=6, column=0, columnspan=2)

# Frame para Resumo de Gastos
frame_resumo = ttk.Frame(root, padding="10")
frame_resumo.grid(row=1, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

ttk.Label(frame_resumo, text="Resumo de Gastos").grid(row=0, column=0, columnspan=2)

ttk.Button(frame_resumo, text="Mostrar Resumo", command=resumo_gastos).grid(row=1, column=0, columnspan=2)

text_resumo = tk.Text(frame_resumo, height=10, width=50, state=tk.DISABLED)
text_resumo.grid(row=2, column=0, columnspan=2)

# Frame para Mostrar Despesas com Filtro
frame_despesas = ttk.Frame(root, padding="10")
frame_despesas.grid(row=2, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

ttk.Label(frame_despesas, text="Despesas Registradas").grid(row=0, column=0, columnspan=2)

# Filtros para Mês e Ano
ttk.Label(frame_despesas, text="Mês (1-12):").grid(row=1, column=0, sticky=tk.W)
entry_mes_filtro = ttk.Entry(frame_despesas)
entry_mes_filtro.grid(row=1, column=1)

ttk.Label(frame_despesas, text="Ano (YYYY):").grid(row=2, column=0, sticky=tk.W)
entry_ano_filtro = ttk.Entry(frame_despesas)
entry_ano_filtro.grid(row=2, column=1)

ttk.Button(frame_despesas, text="Atualizar Despesas", command=mostrar_despesas).grid(row=3, column=0, columnspan=2)

tree = ttk.Treeview(frame_despesas, columns=("Data", "Descrição", "Categoria", "Valor"), show='headings')
tree.heading("Data", text="Data")
tree.heading("Descrição", text="Descrição")
tree.heading("Categoria", text="Categoria")
tree.heading("Valor", text="Valor")
tree.column("Data", width=100)
tree.column("Descrição", width=200)
tree.column("Categoria", width=150)
tree.column("Valor", width=100)
tree.grid(row=4, column=0, columnspan=2, sticky="nsew")

# Frame para Calcular Saldo
frame_saldo = ttk.Frame(root, padding="10")
frame_saldo.grid(row=3, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

ttk.Label(frame_saldo, text="Calcular Saldo do Mês").grid(row=0, column=0, columnspan=2)

ttk.Label(frame_saldo, text="Mês (1-12):").grid(row=1, column=0, sticky=tk.W)
entry_mes = ttk.Entry(frame_saldo)
entry_mes.grid(row=1, column=1)

ttk.Label(frame_saldo, text="Ano (YYYY):").grid(row=2, column=0, sticky=tk.W)
entry_ano = ttk.Entry(frame_saldo)
entry_ano.grid(row=2, column=1)

ttk.Label(frame_saldo, text="Salário (R$):").grid(row=3, column=0, sticky=tk.W)
entry_salario = ttk.Entry(frame_saldo)
entry_salario.grid(row=3, column=1)

ttk.Button(frame_saldo, text="Calcular Saldo", command=calcular_saldo).grid(row=4, column=0, columnspan=2)

text_saldo = tk.Text(frame_saldo, height=6, width=50, state=tk.DISABLED)
text_saldo.grid(row=5, column=0, columnspan=2)

# Ajustar o layout
root.grid_rowconfigure(1, weight=1)
root.grid_columnconfigure(0, weight=1)

root.mainloop()
