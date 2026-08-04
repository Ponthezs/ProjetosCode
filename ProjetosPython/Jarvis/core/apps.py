import os
import glob
import subprocess
import webbrowser

try:
    import psutil
except ImportError:
    psutil = None

class AppLauncher:
    def __init__(self):
        # Mapeamento estático de apps principais para execução
        self.app_map = {
            'bloco de notas': 'notepad.exe',
            'bloco de nota': 'notepad.exe',
            'notepad': 'notepad.exe',
            'calculadora': 'calc.exe',
            'calc': 'calc.exe',
            'cmd': 'cmd.exe',
            'prompt': 'cmd.exe',
            'powershell': 'powershell.exe',
            'paint': 'mspaint.exe',
            'gerenciador de tarefas': 'taskmgr.exe',
            'painel de controle': 'control.exe',
            'vscode': 'code',
            'code': 'code',
            'visual studio code': 'code',
            'chrome': 'chrome',
            'edge': 'msedge',
            'spotify': 'spotify',
            'discord': 'discord',
            'steam': 'steam://open/main'
        }

        # Mapeamento estático para FECHAR processos no Windows
        self.process_close_map = {
            'bloco de notas': 'notepad.exe',
            'bloco de nota': 'notepad.exe',
            'notepad': 'notepad.exe',
            'calculadora': 'calc.exe',
            'calc': 'calc.exe',
            'cmd': 'cmd.exe',
            'prompt': 'cmd.exe',
            'powershell': 'powershell.exe',
            'paint': 'mspaint.exe',
            'gerenciador de tarefas': 'taskmgr.exe',
            'vscode': 'Code.exe',
            'code': 'Code.exe',
            'chrome': 'chrome.exe',
            'navegador': 'chrome.exe',
            'edge': 'msedge.exe',
            'spotify': 'Spotify.exe',
            'discord': 'Discord.exe',
            'steam': 'steam.exe'
        }

        # Mapeamento de pastas
        self.folder_map = {
            'downloads': os.path.expanduser('~/Downloads'),
            'download': os.path.expanduser('~/Downloads'),
            'documentos': os.path.expanduser('~/Documents'),
            'imagens': os.path.expanduser('~/Pictures'),
            'fotos': os.path.expanduser('~/Pictures'),
            'área de trabalho': os.path.expanduser('~/Desktop'),
            'area de trabalho': os.path.expanduser('~/Desktop'),
            'desktop': os.path.expanduser('~/Desktop')
        }

        # Mapeamento de sites
        self.web_map = {
            'google': 'https://www.google.com',
            'youtube': 'https://www.youtube.com',
            'github': 'https://www.github.com',
            'whatsapp': 'https://web.whatsapp.com',
            'chatgpt': 'https://chatgpt.com',
            'netflix': 'https://www.netflix.com'
        }

    def _find_game_or_shortcut(self, target_name):
        """Busca atalhos de jogos da Steam e programas na Área de Trabalho e Menu Iniciar."""
        clean_target = target_name.lower().replace("jogo", "").replace("game", "").strip()
        if not clean_target:
            return None

        search_dirs = [
            os.path.expanduser('~/Desktop'),
            r'C:\Users\Public\Desktop',
            os.path.expanduser('~/AppData/Roaming/Microsoft/Windows/Start Menu/Programs'),
            r'C:\ProgramData\Microsoft\Windows\Start Menu/Programs'
        ]

        for directory in search_dirs:
            if not os.path.exists(directory):
                continue
            
            for root, dirs, files in os.walk(directory):
                for file in files:
                    if file.endswith(('.lnk', '.url')):
                        file_name_no_ext = os.path.splitext(file)[0].lower()
                        if clean_target in file_name_no_ext or file_name_no_ext in clean_target:
                            return os.path.join(root, file)
        return None

    def launch(self, text):
        t = text.lower().strip()
        
        # Remove verbos iniciais se presentes ("abrir", "iniciar", etc)
        clean_query = t
        for verb in ['abrir o jogo', 'abrir jogo', 'abrir o app', 'abrir o', 'abrir a', 'abrir', 'abra', 'iniciar', 'executar', 'inicia', 'abre', 'jogar']:
            if clean_query.startswith(verb):
                clean_query = clean_query[len(verb):].strip()
                break

        # 1. Verifica no mapa de apps estático
        for app_name, command in self.app_map.items():
            if app_name == clean_query or app_name == t or app_name in clean_query or clean_query in app_name:
                try:
                    if command.startswith('steam://'):
                        webbrowser.open(command)
                    else:
                        subprocess.Popen(command, shell=True)
                    return f"Abrindo {app_name.title()}."
                except Exception as e:
                    print(f"Erro ao abrir {app_name}: {e}")

        # 2. Verifica nas pastas do sistema
        for folder_name, folder_path in self.folder_map.items():
            if folder_name == clean_query or folder_name in clean_query:
                if os.path.exists(folder_path):
                    os.startfile(folder_path)
                    return f"Abrindo a pasta {folder_name.capitalize()}."

        # 3. Verifica atalhos de jogos da Steam ou programas do Windows
        shortcut_path = self._find_game_or_shortcut(clean_query if clean_query else t)
        if shortcut_path:
            try:
                os.startfile(shortcut_path)
                game_name = os.path.splitext(os.path.basename(shortcut_path))[0]
                return f"Iniciando {game_name} para você!"
            except Exception as e:
                print("Erro ao abrir atalho:", e)

        # 4. Verifica sites da web
        for site_name, url in self.web_map.items():
            if site_name == clean_query or site_name in clean_query:
                webbrowser.open(url)
                return f"Abrindo {site_name.capitalize()} no navegador."

        return None

    def close(self, text):
        """Módulo para FECHAR aplicativos e jogos em execução no Windows."""
        t = text.lower().strip()

        # Extrai o nome do app a ser fechado
        clean_target = t
        for verb in ['fechar o jogo', 'fechar jogo', 'fechar o app', 'fechar o', 'fechar a', 'fechar', 'fecha', 'feche', 'encerrar', 'encerre', 'desligar', 'fchar']:
            if clean_target.startswith(verb):
                clean_target = clean_target[len(verb):].strip()
                break

        if not clean_target:
            return "Qual aplicativo você gostaria que eu fechasse?"

        # 1. Checa no mapeamento estático de processos
        for app_name, exe_name in self.process_close_map.items():
            if app_name == clean_target or app_name in clean_target or clean_target in app_name:
                os.system(f'taskkill /f /im {exe_name} 2>nul')
                return f"Fechando {app_name.title()}."

        # 2. Busca dinâmica por nome de processo usando psutil
        closed_count = 0
        if psutil:
            for proc in psutil.process_iter(['pid', 'name']):
                try:
                    p_name = proc.info['name'].lower()
                    p_name_no_ext = p_name.replace('.exe', '')
                    if clean_target == p_name_no_ext or clean_target in p_name_no_ext or p_name_no_ext in clean_target:
                        proc.kill()
                        closed_count += 1
                except Exception:
                    pass

        if closed_count > 0:
            return f"Encerrado {clean_target.title()} no sistema."

        # 3. Fallback de encerramento via taskkill genérico
        try:
            os.system(f'taskkill /f /im {clean_target}.exe 2>nul')
            return f"Tentando fechar {clean_target.title()}."
        except Exception:
            pass

        return None
