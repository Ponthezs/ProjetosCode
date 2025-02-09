import pyttsx3
engine = pyttsx3.init()

"""VOICE"""
voices = engine.getProperty('voices')       #getting details of current voice

'''for voice in voices:
    print(engine.setProperty('voice', voice.id))'''

engine.setProperty("voice", voices[-2].id)
engine.say("Estou muito feliz com meu resultado em python")
engine.runAndWait()