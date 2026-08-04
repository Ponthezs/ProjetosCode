import os
import cv2
import time
import json
import math
import threading
import numpy as np

try:
    import pyautogui
    pyautogui.FAILSAFE = False
except ImportError:
    pyautogui = None

try:
    import mediapipe as mp
    from mediapipe.tasks import python as mp_python
    from mediapipe.tasks.python import vision as mp_vision
except ImportError:
    mp = None
    mp_python = None
    mp_vision = None

# Conexões do esqueleto da mão para desenho Sci-Fi Neon
HAND_CONNECTIONS = [
    (0, 1), (1, 2), (2, 3), (3, 4),
    (0, 5), (5, 6), (6, 7), (7, 8),
    (5, 9), (9, 10), (10, 11), (11, 12),
    (9, 13), (13, 14), (14, 15), (15, 16),
    (13, 17), (17, 18), (18, 19), (19, 20),
    (0, 17)
]

class GestureController:
    def __init__(self, config_path="gestures_config.json", model_path="hand_landmarker.task"):
        self.config_path = config_path
        self.model_path = model_path
        self.is_running = False
        self.camera_active = False
        self.cap = None
        self.last_action_time = 0
        self.click_cooldown = 0.4
        self.active_gesture_text = "Nenhum"
        
        # Posições anteriores para filtro de suavização exponencial (EMA)
        self.prev_x, self.prev_y = 0, 0
        self.smoothing = 4

        if pyautogui:
            self.screen_w, self.screen_h = pyautogui.size()
        else:
            self.screen_w, self.screen_h = 1920, 1080

        self.load_config()

        # Detector MediaPipe Tasks
        self.detector = None
        if mp_vision and os.path.exists(self.model_path):
            try:
                base_options = mp_python.BaseOptions(model_asset_path=self.model_path)
                options = mp_vision.HandLandmarkerOptions(
                    base_options=base_options,
                    num_hands=1,
                    min_hand_detection_confidence=0.6,
                    min_hand_presence_confidence=0.6,
                    min_tracking_confidence=0.6
                )
                self.detector = mp_vision.HandLandmarker.create_from_options(options)
                print("[Jarvis Vision] Detector MediaPipe HandLandmarker pronto!")
            except Exception as e:
                print("Aviso ao carregar MediaPipe HandLandmarker:", e)

        self.latest_frame_jpeg = None
        self.lock = threading.Lock()

    def load_config(self):
        if os.path.exists(self.config_path):
            try:
                with open(self.config_path, 'r', encoding='utf-8') as f:
                    self.config = json.load(f)
                    self.active_profile = self.config.get("active_profile", "Geral")
                    self.smoothing = self.config.get("smoothing_factor", 4)
                    self.click_cooldown = self.config.get("click_cooldown_sec", 0.4)
            except Exception:
                self.config = {}
                self.active_profile = "Geral"
        else:
            self.active_profile = "Geral"

    def dist(self, p1, p2):
        return math.hypot(p1.x - p2.x, p1.y - p2.y)

    def start(self):
        if self.is_running:
            return
        self.is_running = True
        self.camera_active = True
        threading.Thread(target=self._camera_loop, daemon=True).start()

    def stop(self):
        self.is_running = False
        self.camera_active = False

    def _camera_loop(self):
        self.cap = cv2.VideoCapture(0)
        if not self.cap.isOpened():
            print("Erro: Não foi possível abrir a webcam.")
            self.is_running = False
            return

        print("[Jarvis Vision] Loop de rastreamento por webcam ativado!")

        while self.is_running:
            ret, frame = self.cap.read()
            if not ret:
                time.sleep(0.03)
                continue

            frame = cv2.flip(frame, 1)
            h, w, c = frame.shape

            if self.detector:
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
                result = self.detector.detect(mp_image)

                if result and result.hand_landmarks:
                    for hand_landmarks in result.hand_landmarks:
                        # Desenha esqueleto da mão Sci-Fi Neon (Linhas ciano e pontos amarelo neon)
                        coords = [(int(pt.x * w), int(pt.y * h)) for pt in hand_landmarks]
                        
                        for p1_idx, p2_idx in HAND_CONNECTIONS:
                            cv2.line(frame, coords[p1_idx], coords[p2_idx], (255, 240, 0), 2)

                        for cx, cy in coords:
                            cv2.circle(frame, (cx, cy), 4, (0, 240, 255), -1)

                        # Processa e reconhece gestos
                        self._process_gestures(hand_landmarks, w, h)
                else:
                    self.active_gesture_text = "Nenhum"

            # Status HUD no topo do vídeo
            cv2.putText(frame, f"JARVIS GESTOS: {self.active_gesture_text}", (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 240, 0), 2)

            # Codifica o frame para stream no dashboard
            ret_jpg, jpeg_bytes = cv2.imencode('.jpg', frame)
            if ret_jpg:
                with self.lock:
                    self.latest_frame_jpeg = jpeg_bytes.tobytes()

            time.sleep(0.01)

        if self.cap:
            self.cap.release()

    def _process_gestures(self, landmarks, frame_w, frame_h):
        lm = landmarks

        wrist = lm[0]
        thumb_tip = lm[4]
        index_tip = lm[8]
        index_pip = lm[6]
        middle_tip = lm[12]
        middle_pip = lm[10]
        ring_tip = lm[16]
        ring_pip = lm[14]
        pinky_tip = lm[20]
        pinky_pip = lm[18]

        index_up = index_tip.y < index_pip.y
        middle_up = middle_tip.y < middle_pip.y
        ring_up = ring_tip.y < ring_pip.y
        pinky_up = pinky_tip.y < pinky_pip.y
        thumb_up = thumb_tip.y < index_pip.y and thumb_tip.y < wrist.y

        now = time.time()
        cooldown_ok = (now - self.last_action_time) > self.click_cooldown

        # 1. PINÇA INDICADOR + POLEGAR (Clique Esquerdo)
        if self.dist(thumb_tip, index_tip) < 0.06:
            self.active_gesture_text = "🤏 Clique Esquerdo"
            if cooldown_ok and pyautogui:
                pyautogui.click()
                self.last_action_time = now
            return

        # 2. PINÇA MÉDIO + POLEGAR (Clique Direito)
        if self.dist(thumb_tip, middle_tip) < 0.06:
            self.active_gesture_text = "🤏 Clique Direito"
            if cooldown_ok and pyautogui:
                pyautogui.rightClick()
                self.last_action_time = now
            return

        # 3. PUNHO FECHADO (Minimizar Janelas)
        if not index_up and not middle_up and not ring_up and not pinky_up:
            self.active_gesture_text = "👊 Minimizar Janelas"
            if cooldown_ok and pyautogui:
                pyautogui.hotkey('win', 'd')
                self.last_action_time = now
            return

        # 4. JOINHA (Abrir Spotify ou App rápido)
        if thumb_up and not index_up and not middle_up and not ring_up and not pinky_up:
            self.active_gesture_text = "👍 Abrir Spotify"
            if cooldown_ok:
                import webbrowser
                webbrowser.open("https://open.spotify.com")
                self.last_action_time = now
            return

        # 5. GESTO ROCK (Screenshot da Tela)
        if index_up and pinky_up and not middle_up and not ring_up:
            self.active_gesture_text = "🤟 Screenshot"
            if cooldown_ok and pyautogui:
                shot_path = os.path.abspath(f"screenshot_{int(now)}.png")
                pyautogui.screenshot(shot_path)
                print(f"[Jarvis Vision] Screenshot salva em: {shot_path}")
                self.last_action_time = now
            return

        # 6. DOIS DEDOS UP (Rolagem de Tela - Scroll)
        if index_up and middle_up and not ring_up and not pinky_up:
            self.active_gesture_text = "✌️ Rolagem (Scroll)"
            if pyautogui:
                scroll_amount = int((middle_pip.y - middle_tip.y) * 80)
                pyautogui.scroll(scroll_amount)
            return

        # 7. INDICADOR UP (Mover Cursor do Mouse Suavemente com Filtro EMA)
        if index_up and not middle_up and not ring_up and not pinky_up:
            self.active_gesture_text = "👆 Movendo Cursor"
            if pyautogui:
                target_x = np.interp(index_tip.x, [0.1, 0.9], [0, self.screen_w])
                target_y = np.interp(index_tip.y, [0.1, 0.9], [0, self.screen_h])

                # Suavização exponencial para eliminar o tremor da mão
                curr_x = self.prev_x + (target_x - self.prev_x) / self.smoothing
                curr_y = self.prev_y + (target_y - self.prev_y) / self.smoothing

                pyautogui.moveTo(curr_x, curr_y)
                self.prev_x, self.prev_y = curr_x, curr_y
            return

        # 8. MÃO ABERTA (Pausar / Standby)
        if index_up and middle_up and ring_up and pinky_up:
            self.active_gesture_text = "✋ Mão Aberta (Standby)"
            return

        self.active_gesture_text = "Rastreando..."

    def get_latest_frame_jpeg(self):
        with self.lock:
            return self.latest_frame_jpeg
