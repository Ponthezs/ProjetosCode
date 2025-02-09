import datetime

class SystemInfo:
    def __init__(self):
        pass

    @staticmethod
    def get_time():
        now = datetime.datetime.now()
        answer = 'São {} Horas e {} Minutos.'.format(now.hour, now.minute)
        return answer