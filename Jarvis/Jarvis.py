# Main Files
'''IMPORT'''
from vosk import Model, KaldiRecognizer
import os
import pyaudio
import pyttsx3
engine = pyttsx3.init()
import json
import core
#########################################################################################################
#I WAS NOT ABLE TO IMPORT THE FOLDER, PROBLEM BEING SOLVED!!!!
import datetime
'''Reconhecimento de Horas'''
class SystemInfo:
    def __init__(self):
        pass

    @staticmethod
    def get_time():
        now = datetime.datetime.now()
        answer = 'São {} Horas e {} Minutos.'.format(now.hour, now.minute)
        return answer
#########################################################################################################
'''Síntese de fala'''
"""VOICE"""
voices = engine.getProperty('voices')       #getting details of current voice
'''for voice in voices:
    print(engine.setProperty('voice', voice.id))'''
engine.setProperty("voice", voices[-2].id)

def speak (text):
    engine.say(text)
    engine.runAndWait()
#########################################################################################################
'''Reconhecimento de fala'''
model = Model('model')
rec = KaldiRecognizer(model, 16000)

p = pyaudio.PyAudio()
stream = p.open(format=pyaudio.paInt16, channels=1, rate=16000, input=True, frames_per_buffer=2048)
stream.start_stream()
#########################################################################################################
'''Reconhecimento de fala (Loop)'''
while True:
    data = stream.read(2048)
    if len(data) == 0:
        break
    if rec.AcceptWaveform(data):
        result = rec.Result()
        result = json.loads(result)

        if result is not None:
            text = result['text']

        print(text)

        if text == 'que horas são' or text == 'fale a hora':
            speak(SystemInfo.get_time())