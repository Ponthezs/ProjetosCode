import tkinter as tk
from tkinter import messagebox, ttk
import csv
from datetime import date, timedelta

# Definindo as classes principais

class Usuario:
    def __init__(self, nome, email, senha):
        self.nome = nome
        self.email = email
        self.senha = senha
        self.historicoEmprestimos = []
        self.multa = 0.0

    def visualizarHistorico(self):
        return self.historicoEmprestimos

    def visualizarMulta(self):
        return self.multa

    def adicionarMulta(self, valor):
        self.multa += valor

class Bibliotecario(Usuario):
    def __init__(self, nome, email, senha):
        super().__init__(nome, email, senha)
        self.permissoesAdmin = True

    def adicionarLivro(self, livro, biblioteca):
        biblioteca.catalogo.append(livro)

    def atualizarLivro(self, livro, novos_dados):
        livro.titulo = novos_dados.get('titulo', livro.titulo)
        livro.autor = novos_dados.get('autor', livro.autor)
        livro.sinopse = novos_dados.get('sinopse', livro.sinopse)
        livro.numeroPaginas = novos_dados.get('numeroPaginas', livro.numeroPaginas)

    def removerLivro(self, livro, biblioteca):
        biblioteca.catalogo.remove(livro)

    def gerenciarUsuarios(self, biblioteca):
        return biblioteca.usuarios

class Livro:
    def __init__(self, ISBN, titulo, autor, sinopse, numeroPaginas):
        self.ISBN = ISBN
        self.titulo = titulo
        self.autor = autor
        self.sinopse = sinopse
        self.numeroPaginas = numeroPaginas
        self.disponibilidade = True

    def visualizarDetalhes(self):
        return f"{self.titulo} por {self.autor} - {self.sinopse}"

class Emprestimo:
    def __init__(self, usuario, livro):
        self.usuario = usuario
        self.livro = livro
        self.dataEmprestimo = date.today()
        self.dataDevolucao = self.dataEmprestimo + timedelta(days=14)
        self.status = "Em andamento"

    def realizarEmprestimo(self):
        if self.livro.disponibilidade:
            self.livro.disponibilidade = False
            self.usuario.historicoEmprestimos.append(self)
            return "Empréstimo realizado com sucesso!"
        else:
            return "Livro indisponível para empréstimo."

    def renovarEmprestimo(self):
        if self.status == "Em andamento":
            self.dataDevolucao += timedelta(days=14)
            return "Empréstimo renovado com sucesso!"
        else:
            return "Não é possível renovar este empréstimo."

    def verificarAtraso(self):
        if date.today() > self.dataDevolucao:
            diasAtraso = (date.today() - self.dataDevolucao).days
            multa = diasAtraso * 2.0  # Multa de R$ 2,00 por dia de atraso
            self.usuario.adicionarMulta(multa)
            return f"Empréstimo atrasado. Multa aplicada: R${multa:.2f}"
        return "Empréstimo em dia."

class Biblioteca:
    def __init__(self):
        self.catalogo = []
        self.usuarios = []
        self.admins = []

    def buscarLivro(self, titulo=""):
        return [livro for livro in self.catalogo if titulo.lower() in livro.titulo.lower()]

    def adicionarUsuario(self, usuario):
        self.usuarios.append(usuario)

    def adicionarAdmin(self, admin):
        self.admins.append(admin)

    def carregar_usuarios_csv(self, arquivo_csv):
        try:
            with open(arquivo_csv, mode='r') as file:
                reader = csv.DictReader(file)
                for row in reader:
                    usuario = Usuario(row['nome'], row['email'], row['senha'])
                    self.adicionarUsuario(usuario)
        except FileNotFoundError:
            pass

    def salvar_usuarios_csv(self, arquivo_csv):
        with open(arquivo_csv, mode='w', newline='') as file:
            fieldnames = ['nome', 'email', 'senha']
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            writer.writeheader()
            for usuario in self.usuarios:
                writer.writerow({'nome': usuario.nome, 'email': usuario.email, 'senha': usuario.senha})

    def salvar_livros_csv(self, arquivo_csv):
        with open(arquivo_csv, mode='w', newline='') as file:
            fieldnames = ['ISBN', 'titulo', 'autor', 'sinopse', 'numeroPaginas']
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            writer.writeheader()
            for livro in self.catalogo:
                writer.writerow({'ISBN': livro.ISBN, 'titulo': livro.titulo, 'autor': livro.autor, 'sinopse': livro.sinopse, 'numeroPaginas': livro.numeroPaginas})

    def carregar_admins_csv(self, arquivo_csv):
        try:
            with open(arquivo_csv, mode='r') as file:
                reader = csv.DictReader(file)
                for row in reader:
                    admin = Bibliotecario(row['nome'], row['email'], row['senha'])
                    self.adicionarAdmin(admin)
        except FileNotFoundError:
            pass

# Criando uma instância global de Biblioteca
biblioteca = Biblioteca()

# Funções para a Interface

def realizar_cadastro():
    nome = nome_entry.get()
    email = email_entry.get()
    senha = senha_entry.get()

    # Verifica se já existe um usuário com o mesmo e-mail
    for usuario in biblioteca.usuarios:
        if usuario.email == email:
            messagebox.showwarning("Erro", "Já existe um usuário cadastrado com esse e-mail.")
            return

    if nome and email and senha:
        novo_usuario = Usuario(nome, email, senha)
        biblioteca.adicionarUsuario(novo_usuario)
        biblioteca.salvar_usuarios_csv('usuarios.csv')
        messagebox.showinfo("Sucesso", "Usuário cadastrado com sucesso!")
        clear_entries()
    else:
        messagebox.showwarning("Erro", "Todos os campos são obrigatórios.")

def realizar_login():
    email = email_entry.get()
    senha = senha_entry.get()

    for usuario in biblioteca.usuarios:
        if usuario.email == email and usuario.senha == senha:
            mostrar_interface_usuario(usuario)
            return

    for admin in biblioteca.admins:
        if admin.email == email and admin.senha == senha:
            mostrar_interface_admin(admin)
            return

    messagebox.showerror("Erro", "Email ou senha incorretos!")

def buscar_livro():
    titulo = titulo_entry.get()
    livros_encontrados = biblioteca.buscarLivro(titulo)

    if livros_encontrados:
        atualizar_lista_livros(livros_encontrados)
    else:
        messagebox.showinfo("Resultado da Busca", "Nenhum livro encontrado com esse título.")

def realizar_emprestimo(usuario):
    selecionado = lista_livros.selection()
    if selecionado:
        index = int(selecionado[0])
        livro = livros_mostrados[index]
        emprestimo = Emprestimo(usuario, livro)
        resultado = emprestimo.realizarEmprestimo()
        messagebox.showinfo("Empréstimo", resultado)
    else:
        messagebox.showwarning("Erro", "Nenhum livro selecionado.")

def renovar_emprestimo(usuario):
    selecionado = lista_historico.selection()
    if selecionado:
        index = int(selecionado[0])
        emprestimo = usuario.historicoEmprestimos[index]
        resultado = emprestimo.renovarEmprestimo()
        messagebox.showinfo("Renovação", resultado)
        atualizar_historico_emprestimos(usuario)
    else:
        messagebox.showwarning("Erro", "Nenhum empréstimo selecionado.")

def verificar_multas(usuario):
    multas = usuario.visualizarMulta()
    messagebox.showinfo("Multas", f"Multa acumulada: R${multas:.2f}")

def atualizar_lista_livros(livros):
    global livros_mostrados
    livros_mostrados = livros
    lista_livros.delete(*lista_livros.get_children())
    for i, livro in enumerate(livros):
        lista_livros.insert('', 'end', iid=i, text=livro.titulo, values=(livro.autor, livro.ISBN))

def atualizar_historico_emprestimos(usuario):
    lista_historico.delete(*lista_historico.get_children())
    for i, emprestimo in enumerate(usuario.historicoEmprestimos):
        status = emprestimo.verificarAtraso()
        lista_historico.insert('', 'end', iid=i, text=emprestimo.livro.titulo, values=(emprestimo.dataEmprestimo, emprestimo.dataDevolucao, status))

def mostrar_interface_usuario(usuario):
    user_window = tk.Toplevel(root)
    user_window.title(f"Conta de {usuario.nome}")

    tk.Label(user_window, text="Buscar Livro por Título").grid(row=0, column=0, padx=10, pady=5)
    global titulo_entry
    titulo_entry = tk.Entry(user_window)
    titulo_entry.grid(row=0, column=1, padx=10, pady=5)

    tk.Button(user_window, text="Buscar", command=buscar_livro).grid(row=0, column=2, padx=10, pady=5)
    
    global lista_livros
    lista_livros = ttk.Treeview(user_window, columns=("Autor", "ISBN"), show='headings')
    lista_livros.heading("Autor", text="Autor")
    lista_livros.heading("ISBN", text="ISBN")
    lista_livros.grid(row=1, column=0, columnspan=3, padx=10, pady=5)
    lista_livros.bind('<Double-1>', lambda e: realizar_emprestimo(usuario))

    tk.Button(user_window, text="Ver Multas", command=lambda: verificar_multas(usuario)).grid(row=2, column=0, padx=10, pady=5)
    
    tk.Label(user_window, text="Histórico de Empréstimos").grid(row=3, column=0, padx=10, pady=5)

    global lista_historico
    lista_historico = ttk.Treeview(user_window, columns=("Data Empréstimo", "Data Devolução", "Status"), show='headings')
    lista_historico.heading("Data Empréstimo", text="Data Empréstimo")
    lista_historico.heading("Data Devolução", text="Data Devolução")
    lista_historico.heading("Status", text="Status")
    lista_historico.grid(row=4, column=0, columnspan=3, padx=10, pady=5)
    lista_historico.bind('<Double-1>', lambda e: renovar_emprestimo(usuario))

    atualizar_historico_emprestimos(usuario)

def mostrar_interface_admin(admin):
    admin_window = tk.Toplevel(root)
    admin_window.title(f"Admin - {admin.nome}")

    tk.Label(admin_window, text="Adicionar Livro").grid(row=0, column=0, padx=10, pady=5)

    tk.Label(admin_window, text="ISBN").grid(row=1, column=0, padx=10, pady=5)
    isbn_entry = tk.Entry(admin_window)
    isbn_entry.grid(row=1, column=1, padx=10, pady=5)

    tk.Label(admin_window, text="Título").grid(row=2, column=0, padx=10, pady=5)
    titulo_entry = tk.Entry(admin_window)
    titulo_entry.grid(row=2, column=1, padx=10, pady=5)

    tk.Label(admin_window, text="Autor").grid(row=3, column=0, padx=10, pady=5)
    autor_entry = tk.Entry(admin_window)
    autor_entry.grid(row=3, column=1, padx=10, pady=5)

    tk.Label(admin_window, text="Sinopse").grid(row=4, column=0, padx=10, pady=5)
    sinopse_entry = tk.Entry(admin_window)
    sinopse_entry.grid(row=4, column=1, padx=10, pady=5)

    tk.Label(admin_window, text="Número de Páginas").grid(row=5, column=0, padx=10, pady=5)
    numero_paginas_entry = tk.Entry(admin_window)
    numero_paginas_entry.grid(row=5, column=1, padx=10, pady=5)

    def adicionar_livro():
        livro = Livro(isbn_entry.get(), titulo_entry.get(), autor_entry.get(), sinopse_entry.get(), numero_paginas_entry.get())
        admin.adicionarLivro(livro, biblioteca)
        biblioteca.salvar_livros_csv('livros.csv')
        messagebox.showinfo("Sucesso", "Livro adicionado com sucesso!")

    tk.Button(admin_window, text="Adicionar Livro", command=adicionar_livro).grid(row=6, column=0, columnspan=2, padx=10, pady=5)

    tk.Label(admin_window, text="Atualizar Livro").grid(row=7, column=0, padx=10, pady=5)

    # Interface de gerenciamento de usuários
    tk.Label(admin_window, text="Gerenciar Usuários").grid(row=8, column=0, padx=10, pady=5)
    tk.Button(admin_window, text="Visualizar Usuários", command=lambda: visualizar_usuarios(admin_window)).grid(row=9, column=0, padx=10, pady=5)

    def visualizar_usuarios(window):
        usuarios_window = tk.Toplevel(window)
        usuarios_window.title("Usuários")

        global lista_usuarios
        lista_usuarios = ttk.Treeview(usuarios_window, columns=("Nome", "Email"), show='headings')
        lista_usuarios.heading("Nome", text="Nome")
        lista_usuarios.heading("Email", text="Email")
        lista_usuarios.grid(row=0, column=0, padx=10, pady=5)
        for usuario in biblioteca.usuarios:
            lista_usuarios.insert('', 'end', text=usuario.nome, values=(usuario.nome, usuario.email))

    # Carregar os dados de usuários e admins de arquivos CSV
    biblioteca.carregar_usuarios_csv('usuarios.csv')
    biblioteca.carregar_admins_csv('admins.csv')

# Função para limpar os campos de entrada
def clear_entries():
    nome_entry.delete(0, tk.END)
    email_entry.delete(0, tk.END)
    senha_entry.delete(0, tk.END)

# Interface Principal

root = tk.Tk()
root.title("Biblioteca")

tk.Label(root, text="Nome").grid(row=0, column=0, padx=10, pady=5)
nome_entry = tk.Entry(root)
nome_entry.grid(row=0, column=1, padx=10, pady=5)

tk.Label(root, text="Email").grid(row=1, column=0, padx=10, pady=5)
email_entry = tk.Entry(root)
email_entry.grid(row=1, column=1, padx=10, pady=5)

tk.Label(root, text="Senha").grid(row=2, column=0, padx=10, pady=5)
senha_entry = tk.Entry(root, show='*')
senha_entry.grid(row=2, column=1, padx=10, pady=5)

tk.Button(root, text="Cadastrar", command=realizar_cadastro).grid(row=3, column=0, padx=10, pady=5)
tk.Button(root, text="Login", command=realizar_login).grid(row=3, column=1, padx=10, pady=5)

root.mainloop()