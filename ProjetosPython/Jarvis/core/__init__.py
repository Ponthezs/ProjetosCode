import datetime
from core.brain import ConversationalBrain
from core.apps import AppLauncher
from core.gestures import GestureController

class SystemInfo:
    def __init__(self):
        pass

    @staticmethod
    def get_time():
        now = datetime.datetime.now()
        return f'São {now.hour} Horas e {now.minute:02d} Minutos.'

    @staticmethod
    def get_date():
        now = datetime.datetime.now()
        dias = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo']
        meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
        dia_semana = dias[now.weekday()]
        mes = meses[now.month - 1]
        return f'Hoje é {dia_semana}, {now.day} de {mes} de {now.year}.'
