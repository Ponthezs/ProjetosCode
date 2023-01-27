from PySimpleGUI import PySimpleGUI as sg

#layout
sg.theme('Reddit')
layout = [
    [sg.Text('Usuário'),sg.Input(key='usuario', size=(20,1))],
    [sg.Text('Senha'), sg.Input(key='senha', password_char='*', size=(20,1))],
    [sg.Checkbox("Deseja salvar seu login?")],
    [sg.Button('Entrar')]
]
#Janela
janela = sg.Window('Tela de login da Assistente Virtual', layout)
#Ler eventos
while True:
    eventos, valores = janela.read()
    if eventos == sg.WINDOW_CLOSED:
        break
    if eventos == 'Entrar':
        if valores ['usuario'] == 'FelipeTST' and valores['senha'] == '1234567':
            print('Bem Vindo a sua Assistente Virtual')