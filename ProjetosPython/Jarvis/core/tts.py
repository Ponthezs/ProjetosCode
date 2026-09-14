"""
Motor de TTS (Text-to-Speech) do Jarvis.

Objetivo: fala mais fluida, com dois ganhos principais em relação à
implementação anterior (que vivia dentro de Jarvis.py):

1. Pipeline por sentença: a próxima sentença é sintetizada enquanto a
   sentença atual ainda está tocando, em vez de gerar a resposta inteira
   antes de começar a falar. Isso elimina a pausa longa e "robótica"
   antes do Jarvis começar a responder, principalmente em frases maiores.
2. Múltiplos provedores de voz, escolhidos em tempo de execução (pela GUI
   ou editando voice_config.json):
     - "edge"       -> Microsoft Edge TTS (grátis, o mesmo que já era usado)
     - "elevenlabs" -> ElevenLabs (voz mais natural, precisa de API key e
                       tem custo depois da cota grátis mensal)
     - "sapi5"      -> Windows SAPI5 offline (fallback local, sem internet)

Configuração (voice_config.json na raiz do projeto):
{
  "provider": "edge",
  "edge_voice": "pt-BR-AntonioNeural",
  "edge_rate": "+5%",
  "edge_pitch": "+0Hz",
  "elevenlabs_voice_id": "",
  "elevenlabs_model": "eleven_flash_v2_5",
  "elevenlabs_api_key_env": "ELEVENLABS_API_KEY"
}

Para trocar de voz do Edge TTS, ouça as opções em:
  https://www.oceanz.site/en/explore/edge-tts
  https://tts.travisvn.com/
e coloque o nome exato (ex: "pt-BR-FranciscaNeural") em "edge_voice".

Para usar ElevenLabs:
  1. pip install elevenlabs
  2. defina a variável de ambiente ELEVENLABS_API_KEY com sua chave
  3. escolha uma voz em https://elevenlabs.io/pt/text-to-speech/portuguese
     e copie o Voice ID para "elevenlabs_voice_id" (ou pelo campo da GUI)
  4. mude "provider" para "elevenlabs"
"""

import os
import re
import json
import queue
import ctypes
import asyncio
import tempfile
import threading

try:
    import edge_tts
except ImportError:
    edge_tts = None

try:
    import win32com.client
    _win_speaker = win32com.client.Dispatch("SAPI.SpVoice")
except Exception:
    _win_speaker = None

try:
    from elevenlabs.client import ElevenLabs
except ImportError:
    ElevenLabs = None


_DEFAULT_CONFIG = {
    "provider": "edge",
    "edge_voice": "pt-BR-AntonioNeural",
    "edge_rate": "+5%",
    "edge_pitch": "+0Hz",
    "elevenlabs_voice_id": "",
    "elevenlabs_model": "eleven_flash_v2_5",
    "elevenlabs_api_key_env": "ELEVENLABS_API_KEY",
}

# Quebra o texto em sentenças mantendo a pontuação, para poder tocar a
# primeira parte enquanto o resto ainda está sendo sintetizado.
_SENTENCE_SPLIT_RE = re.compile(r'(?<=[\.\!\?\;\:])\s+')


def _split_sentences(text):
    parts = [p.strip() for p in _SENTENCE_SPLIT_RE.split(text) if p.strip()]
    return parts if parts else [text.strip()]


class TTSEngine:
    """Sintetiza e toca fala em pipeline por sentença, com múltiplos
    provedores e fallback automático para SAPI5 offline."""

    def __init__(self, config_path="voice_config.json", on_state_change=None):
        self.config_path = config_path
        self.on_state_change = on_state_change
        self.config = dict(_DEFAULT_CONFIG)
        self._load_config()

        self._lock = threading.Lock()
        self._tmp_dir = tempfile.mkdtemp(prefix="jarvis_tts_")

        self._eleven_client = None
        self._init_elevenlabs_client()

    # ---------------- Configuração ----------------

    def _load_config(self):
        if os.path.exists(self.config_path):
            try:
                with open(self.config_path, 'r', encoding='utf-8') as f:
                    user_cfg = json.load(f)
                self.config.update(user_cfg)
            except Exception as e:
                print("Aviso ao carregar voice_config.json:", e)

    def _save_config(self):
        try:
            with open(self.config_path, 'w', encoding='utf-8') as f:
                json.dump(self.config, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print("Aviso ao salvar voice_config.json:", e)

    def reload_config(self):
        self._load_config()
        self._init_elevenlabs_client()

    def _init_elevenlabs_client(self):
        self._eleven_client = None
        if not ElevenLabs:
            return
        api_key = os.environ.get(self.config.get("elevenlabs_api_key_env", "ELEVENLABS_API_KEY"))
        if not api_key:
            return
        try:
            self._eleven_client = ElevenLabs(api_key=api_key)
        except Exception as e:
            print("Aviso ao iniciar cliente ElevenLabs:", e)

    def set_voice(self, voice_value, elevenlabs_voice_id=None):
        """Aplica a escolha de voz feita na GUI (modal de configurações)."""
        if voice_value == 'SAPI5':
            self.config['provider'] = 'sapi5'
        elif voice_value == 'ElevenLabs':
            self.config['provider'] = 'elevenlabs'
            if elevenlabs_voice_id:
                self.config['elevenlabs_voice_id'] = elevenlabs_voice_id.strip()
            self._init_elevenlabs_client()
        elif voice_value:
            # Nome de uma voz neural do Edge TTS (ex: pt-BR-AntonioNeural)
            self.config['provider'] = 'edge'
            self.config['edge_voice'] = voice_value
        self._save_config()

    def _set_state(self, state, label):
        if self.on_state_change:
            try:
                self.on_state_change(state, label)
            except Exception:
                pass

    # ---------------- Síntese por provedor ----------------

    def _synthesize_edge(self, text, out_path):
        async def _gen():
            communicate = edge_tts.Communicate(
                text,
                self.config.get("edge_voice", "pt-BR-AntonioNeural"),
                rate=self.config.get("edge_rate", "+0%"),
                pitch=self.config.get("edge_pitch", "+0Hz"),
            )
            await communicate.save(out_path)
        asyncio.run(_gen())

    def _synthesize_elevenlabs(self, text, out_path):
        audio = self._eleven_client.text_to_speech.convert(
            voice_id=self.config["elevenlabs_voice_id"],
            model_id=self.config.get("elevenlabs_model", "eleven_flash_v2_5"),
            text=text,
            output_format="mp3_44100_128",
        )
        with open(out_path, "wb") as f:
            for chunk in audio:
                if chunk:
                    f.write(chunk)

    def _synthesize(self, text, out_path):
        provider = self.config.get("provider", "edge")

        if provider == "elevenlabs" and self._eleven_client and self.config.get("elevenlabs_voice_id"):
            try:
                self._synthesize_elevenlabs(text, out_path)
                return True
            except Exception as e:
                print("Aviso no ElevenLabs, tentando Edge TTS como fallback:", e)

        if edge_tts:
            try:
                self._synthesize_edge(text, out_path)
                return True
            except Exception as e:
                print("Aviso no Edge-TTS:", e)

        return False

    # ---------------- Playback (Windows / winmm) ----------------

    def _play_file(self, path, alias="jarvis_voice"):
        abs_path = os.path.abspath(path)
        winmm = ctypes.windll.winmm
        winmm.mciSendStringW(f"close {alias}", None, 0, 0)
        winmm.mciSendStringW(f'open "{abs_path}" type mpegvideo alias {alias}', None, 0, 0)
        winmm.mciSendStringW(f"play {alias} wait", None, 0, 0)
        winmm.mciSendStringW(f"close {alias}", None, 0, 0)

    # ---------------- API pública ----------------

    def speak(self, text):
        """Fala o texto. Bloqueia a thread chamadora até terminar de
        falar — chame isso em uma thread separada (é o que Jarvis.py faz)."""
        text = (text or "").strip()
        if not text:
            return

        with self._lock:
            print(f"[Jarvis Voz]: {text}")
            self._set_state('speaking', 'Falando...')

            # SAPI5 é síncrono e local: não precisa de pipeline por arquivo.
            if self.config.get("provider") == "sapi5":
                if _win_speaker:
                    try:
                        _win_speaker.Speak(text)
                    except Exception as e:
                        print("Erro no SAPI5:", e)
                self._set_state('listening', 'Escutando...')
                return

            sentences = _split_sentences(text)
            synth_queue = queue.Queue(maxsize=2)

            def producer():
                try:
                    for i, sentence in enumerate(sentences):
                        out_path = os.path.join(self._tmp_dir, f"chunk_{i}.mp3")
                        try:
                            ok = self._synthesize(sentence, out_path)
                        except Exception as e:
                            print("Erro ao sintetizar sentença:", e)
                            ok = False
                        synth_queue.put(out_path if ok else None)
                finally:
                    synth_queue.put("__END__")

            threading.Thread(target=producer, daemon=True).start()

            any_success = False
            while True:
                item = synth_queue.get()
                if item == "__END__":
                    break
                if item:
                    any_success = True
                    try:
                        self._play_file(item)
                    except Exception as e:
                        print("Erro ao tocar áudio:", e)
                    finally:
                        try:
                            os.remove(item)
                        except Exception:
                            pass

            # Se nenhuma sentença online funcionou (offline, sem API key
            # válida, etc.), cai para o SAPI5 como último recurso.
            if not any_success and _win_speaker:
                try:
                    _win_speaker.Speak(text)
                except Exception as e:
                    print("Erro no SAPI5:", e)

            self._set_state('listening', 'Escutando...')
