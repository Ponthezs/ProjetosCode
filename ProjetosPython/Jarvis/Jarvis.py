import os
import re
import json
import time
import queue
import ctypes
import threading
import datetime
import webbrowser
import asyncio

# TTA Neural (Edge TTS - Voz Humana Clean de Alta Definição)
try:
    import edge_tts
except ImportError:
    edge_tts = None

# SAPI5 Windows (Fallback Offline)
try:
    import win32com.client
    win_speaker = win32com.client.Dispatch("SAPI.SpVoice")
except Exception:
    win_speaker = None

# SpeechRecognition (Reconhecedor de Alta Precisão)
try:
    import speech_recognition as sr
except ImportError:
    sr = None

try:
    import sounddevice as sd
except ImportError:
    sd = None

try:
    from vosk import Model, KaldiRecognizer
except ImportError:
    Model, KaldiRecognizer = None, None

from core import SystemInfo, ConversationalBrain, AppLauncher, GestureController
from core.system import SystemStats
from core.weather import WeatherService
from nlu.classifier import classify

# ==============================================================================
# INICIALIZAÇÃO DE SUBSISTEMAS E BRAIN CONVERSACIONAL
# ==============================================================================
brain = ConversationalBrain()
sys_stats = SystemStats()
weather_svc = WeatherService(default_city="Maringá")
app_launcher = AppLauncher()
gesture_controller = GestureController()

window = None # Instância da janela GUI (PyWebView)
speech_lock = threading.Lock()
is_listening_active = False

def play_audio_native(filepath):
    """Toca o arquivo MP3 gerado via WinMM DLL nativo do Windows sem cortar nada."""
    abs_path = os.path.abspath(filepath)
    alias = "jarvis_voice"
    ctypes.windll.winmm.mciSendStringW(f"close {alias}", None, 0, 0)
    open_cmd = f'open "{abs_path}" type mpegvideo alias {alias}'
    ctypes.windll.winmm.mciSendStringW(open_cmd, None, 0, 0)
    ctypes.windll.winmm.mciSendStringW(f"play {alias} wait", None, 0, 0)
    ctypes.windll.winmm.mciSendStringW(f"close {alias}", None, 0, 0)

def speak(text):
    """Sintetiza voz humana neural de alta definição sem cortes."""
    def run_neural_tts():
        with speech_lock:
            if window:
                try:
                    window.evaluate_js("window.setVoiceState('speaking', 'Falando...');")
                except Exception:
                    pass

            print(f"[Jarvis Voz]: {text}")

            success = False
            # 1. Voz Neural Humana Clean (edge-tts pt-BR-AntonioNeural)
            if edge_tts:
                try:
                    audio_file = os.path.abspath("temp_voice.mp3")
                    if os.path.exists(audio_file):
                        try:
                            os.remove(audio_file)
                        except Exception:
                            pass
                    
                    async def _gen_speech():
                        communicator = edge_tts.Communicate(text, "pt-BR-AntonioNeural")
                        await communicator.save(audio_file)

                    asyncio.run(_gen_speech())

                    if os.path.exists(audio_file):
                        play_audio_native(audio_file)
                        success = True
                except Exception as e:
                    print("Aviso no Edge-TTS neural:", e)

            # 2. Fallback offline (SAPI5 Windows)
            if not success and win_speaker:
                try:
                    win_speaker.Speak(text)
                except Exception as e:
                    print("Erro no SAPI5:", e)

            if window:
                try:
                    window.evaluate_js("window.setVoiceState('listening', 'Escutando...');")
                except Exception:
                    pass

    threading.Thread(target=run_neural_tts, daemon=True).start()

# Helper para extração de nome de cidade
def extract_city_name(text):
    match = re.search(r'(?:em|de|para|na cidade de)\s+([a-zA-ZÀ-ÿ\s]+)', text, re.IGNORECASE)
    if match:
        city = match.group(1).strip()
        city = re.sub(r'\b(hoje|agora|nesta|semana|mês)\b', '', city, flags=re.IGNORECASE).strip()
        return city
    return None

# ==============================================================================
# LÓGICA DE PROCESSAMENTO DE INTENÇÕES
# ==============================================================================
def process_intent(text):
    text_clean = text.strip()
    if not text_clean:
        return "Não entendi o que você disse."

    entity = classify(text_clean)
    print(f"[NLU] Texto: '{text_clean}' -> Intenção: '{entity}'")

    response = ""
    t_lower = text_clean.lower()

    # 1. CONTROLE POR GESTOS DA WEBCAM
    if any(k in t_lower for k in ['ativar gestos', 'ligar gestos', 'iniciar gestos', 'controle por gestos']):
        gesture_controller.start()
        response = "Controle por gestos da webcam ativado com sucesso, senhor!"
    elif any(k in t_lower for k in ['desativar gestos', 'desligar gestos', 'parar gestos']):
        gesture_controller.stop()
        response = "Controle por gestos desativado."

    # 2. FECHAR APLICATIVOS OU JOGOS
    elif any(k in t_lower for k in ['fechar', 'fecha', 'feche', 'encerrar', 'encerre', 'desligar']):
        close_res = app_launcher.close(text_clean)
        if close_res:
            response = close_res
        else:
            response = f"Tentando fechar {text_clean}."

    # 3. ABRIR APLICATIVOS OU JOGOS DIRETO
    elif any(k in t_lower for k in ['abrir', 'abra', 'iniciar', 'executar', 'inicia', 'abre', 'jogar']) or app_launcher.launch(text_clean):
        app_response = app_launcher.launch(text_clean)
        if app_response:
            response = app_response
        else:
            response = f"Tentando abrir {text_clean}."

    # 4. Checagem de Clima Dinâmico
    elif any(k in t_lower for k in ['clima', 'tempo', 'graus', 'temperatura', 'previsão']):
        extracted_city = extract_city_name(text_clean)
        w_data = weather_svc.get_weather(city=extracted_city if extracted_city else "Maringá")
        
        if window:
            try:
                window.evaluate_js(f"window.updateWeather({json.dumps(w_data)});")
            except Exception:
                pass

        response = f"Neste momento em {w_data['city']}, está fazendo {w_data['temp']} com clima {w_data['desc']}."

    # 5. Checagem de Horas e Data
    elif entity == 'time|getTime' or 'hora' in t_lower:
        response = SystemInfo.get_time()
    elif entity == 'time|getDate' or 'data' in t_lower or ('hoje' in t_lower and 'clima' not in t_lower):
        response = SystemInfo.get_date()

    # 6. Modo Conversacional Inteligente Humano
    else:
        response = brain.get_response(text_clean, intent=entity)

    speak(response)
    return response

# ==============================================================================
# RECONHECEDOR DE VOZ AUTOMÁTICO NA INICIALIZAÇÃO
# ==============================================================================
def start_voice_listener():
    global is_listening_active
    if is_listening_active:
        return
    is_listening_active = True

    time.sleep(0.5)

    if window:
        try:
            window.evaluate_js("window.setVoiceState('listening', 'Escutando...');")
        except Exception:
            pass

    if sr:
        r = sr.Recognizer()
        r.dynamic_energy_threshold = False
        r.energy_threshold = 100
        r.pause_threshold = 0.6
        r.phrase_threshold = 0.1
        r.non_speaking_duration = 0.3

        try:
            mic = sr.Microphone()
            print("[STT Automatico] Microfone ativado e escutando instantaneamente!")
            
            with mic as source:
                while True:
                    try:
                        audio = r.listen(source, timeout=None)
                        recognized_text = r.recognize_google(audio, language="pt-BR").strip()
                        if recognized_text:
                            handle_recognized_voice(recognized_text)
                    except sr.UnknownValueError:
                        pass
                    except sr.RequestError as e:
                        print("Aviso no serviço de voz online:", e)
                        break
                    except Exception as e:
                        print("Aviso na captura de áudio:", e)
        except Exception as e:
            print(f"Erro no microfone: {e}. Tentando Vosk...")

    # Fallback local Vosk
    model_dir = "model"
    if not os.path.exists(model_dir) or not Model or not sd:
        print("Escuta em standby.")
        return

    try:
        model = Model(model_dir)
        rec = KaldiRecognizer(model, 16000)
        audio_queue = queue.Queue()

        def callback(indata, frames, time_info, status):
            audio_queue.put(bytes(indata))

        print("[STT Vosk] Reconhecedor local ativado!")
        with sd.RawInputStream(samplerate=16000, blocksize=8000, dtype='int16', channels=1, callback=callback):
            while True:
                data = audio_queue.get()
                if rec.AcceptWaveform(data):
                    res = json.loads(rec.Result())
                    recognized_text = res.get('text', '').strip()
                    if recognized_text:
                        handle_recognized_voice(recognized_text)
    except Exception as e:
        print(f"Aviso no loop Vosk: {e}")

def handle_recognized_voice(recognized_text):
    print(f"[Voz Reconhecida]: {recognized_text}")
    if window:
        try:
            safe_text = recognized_text.replace("'", "\\'").replace('"', '\\"')
            window.evaluate_js(f"window.addMessage('user', '{safe_text}');")
            window.evaluate_js("window.setVoiceState('processing', 'Processando...');")
        except Exception as e:
            print("Erro ao atualizar JS:", e)

    answer = process_intent(recognized_text)
    if window and answer:
        try:
            safe_ans = answer.replace("'", "\\'").replace('"', '\\"')
            window.evaluate_js(f"window.addMessage('jarvis', '{safe_ans}');")
        except Exception as e:
            print("Erro ao enviar resposta para UI:", e)

# ==============================================================================
# PYWEBVIEW API BRIDGE
# ==============================================================================
class JarvisAPI:
    def process_user_message(self, text):
        answer = process_intent(text)
        return answer

    def get_system_stats(self):
        return sys_stats.get_stats()

    def get_weather(self):
        return weather_svc.get_weather()

    def toggle_gestures(self, enable):
        if enable:
            gesture_controller.start()
        else:
            gesture_controller.stop()
        return gesture_controller.is_running

    def get_gesture_status(self):
        return gesture_controller.active_gesture_text

    def set_profile(self, profile_name):
        gesture_controller.active_profile = profile_name
        return profile_name

    def save_settings(self, settings):
        if 'city' in settings:
            w_data = weather_svc.get_weather(city=settings['city'])
            if window:
                try:
                    window.evaluate_js(f"window.updateWeather({json.dumps(w_data)});")
                except Exception:
                    pass
        if 'profile' in settings:
            gesture_controller.active_profile = settings['profile']
        if 'smoothing' in settings:
            gesture_controller.smoothing = int(settings['smoothing'])
        return True

# ==============================================================================
# INICIALIZAÇÃO DA GUI DESKTOP
# ==============================================================================
if __name__ == '__main__':
    gui_index = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'gui', 'index.html')

    try:
        import webview
        api = JarvisAPI()
        window = webview.create_window(
            title='J.A.R.V.I.S - Assistente Virtual Inteligente & Controle por Gestos',
            url=gui_index,
            js_api=api,
            width=1280,
            height=800,
            resizable=True,
            background_color='#060b11'
        )

        def on_loaded():
            w_data = weather_svc.get_weather(city="Maringá")
            window.evaluate_js(f"window.updateWeather({json.dumps(w_data)});")
            threading.Thread(target=start_voice_listener, daemon=True).start()

        webview.start(on_loaded, debug=False)

    except Exception as e:
        print(f"Iniciando via servidor local devido a: {e}")
        import http.server
        import socketserver

        PORT = 8000
        handler = http.server.SimpleHTTPRequestHandler
        os.chdir(os.path.dirname(gui_index))

        print(f"Abra no navegador: http://localhost:{PORT}/index.html")
        webbrowser.open(f"http://localhost:{PORT}/index.html")

        threading.Thread(target=start_voice_listener, daemon=True).start()

        with socketserver.TCPServer(("", PORT), handler) as httpd:
            httpd.serve_forever()