import os
import json
import PySimpleGUI as sg

# Layout
sg.theme('Reddit')
layout = [
    [sg.Text('Usuário'), sg.Input(key='usuario', size=(20, 1))],
    [sg.Text('Senha'), sg.Input(key='senha', password_char='*', size=(20, 1))],
    [sg.Checkbox("Deseja salvar seu login?")],
    [sg.Button('Entrar')]
]

# Janela
janela = sg.Window('Tela de login da Assistente Virtual', layout)

# Ler eventos
while True:
    eventos, valores = janela.read()
    
    if eventos == sg.WINDOW_CLOSED:
        break

    if eventos == 'Entrar':
        usuario = valores['usuario'].strip()
        senha = valores['senha'].strip()
        
        if not usuario or not senha:
            sg.popup('Por favor, preencha todos os campos.')
        elif usuario == 'FelipeTST' and senha == '1234567':
            sg.popup('Bem-vindo à sua Assistente Virtual')
            janela.close()
            break
        else:
            sg.popup('Usuário ou senha incorretos. Tente novamente.')


janela.close()
login_file = 'login_data.json'

def save_login(usuario, senha):
    with open(login_file, 'w') as f:
        json.dump({'usuario': usuario, 'senha': senha}, f)

def load_login():
    if os.path.exists(login_file):
        with open(login_file, 'r') as f:
            return json.load(f)
    return None

saved_login = load_login()

# Layout
layout = [
    [sg.Text('Usuário'), sg.Input(key='usuario', size=(20, 1), default_text=saved_login['usuario'] if saved_login else '')],
    [sg.Text('Senha'), sg.Input(key='senha', password_char='*', size=(20, 1))],
    [sg.Checkbox("Deseja salvar seu login?", default=saved_login is not None)],
    [sg.Button('Entrar')]
]

# Janela
janela = sg.Window('Tela de login da Assistente Virtual', layout)

# Ler eventos
while True:
    eventos, valores = janela.read()
    
    if eventos == sg.WINDOW_CLOSED:
        break

    if eventos == 'Entrar':
        usuario = valores['usuario'].strip()
        senha = valores['senha'].strip()
        salvar_login = valores[0]  # O valor da checkbox

        if not usuario or not senha:
            sg.popup('Por favor, preencha todos os campos.')
        elif usuario == 'FelipeTST' and senha == '1234567':
            if salvar_login:
                save_login(usuario, senha)
            sg.popup('Bem-vindo à sua Assistente Virtual')
            janela.close()
            break
        else:
            sg.popup('Usuário ou senha incorretos. Tente novamente.')

janela.close()
