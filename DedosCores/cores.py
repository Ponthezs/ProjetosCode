import cv2
import mediapipe as mp
import tkinter as tk
from PIL import Image, ImageTk
import numpy as np

# Configurações das cores dos LEDs
LED_COLORS = ['red', 'green', 'blue', 'yellow', 'purple']

# Inicialização do MediaPipe
mp_hands = mp.solutions.hands
hands = mp_hands.Hands()
mp_drawing = mp.solutions.drawing_utils

# Função para contar dedos levantados
def count_fingers(hand_landmarks):
    finger_tips = [8, 12, 16, 20]  # Pontas dos dedos
    count = 0
    for tip in finger_tips:
        if hand_landmarks.landmark[tip].y < hand_landmarks.landmark[tip - 2].y:
            count += 1
    return count

class HandTrackingApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Hand Tracking Control")
        self.root.geometry("800x600")

        self.canvas = tk.Canvas(root, width=640, height=480)
        self.canvas.pack(pady=20)

        # Criar botões de controle com cores
        self.buttons = []
        for color in LED_COLORS:
            button = tk.Button(root, text=color.capitalize(), bg=color, width=15, height=2, state=tk.DISABLED)
            button.pack(side=tk.LEFT, padx=5, pady=5)
            self.buttons.append(button)

        # Inicializar captura de vídeo
        self.video_source = cv2.VideoCapture(0)
        self.update_frame()

    def update_frame(self):
        ret, frame = self.video_source.read()
        if not ret:
            print("Não foi possível acessar a câmera.")
            return

        # Corrigir a orientação da imagem (horizontal e/ou vertical)
        frame = cv2.flip(frame, 1)  # Espelhar horizontalmente
        # frame = cv2.flip(frame, 0)  # Espelhar verticalmente, se necessário

        # Processar a imagem da webcam
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(frame_rgb)

        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                count = count_fingers(hand_landmarks)
                self.update_buttons(count)
                mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

        # Converter para imagem PIL e atualizar o canvas
        frame_pil = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        frame_tk = ImageTk.PhotoImage(image=frame_pil)
        self.canvas.create_image(0, 0, image=frame_tk, anchor=tk.NW)
        self.canvas.image = frame_tk

        # Atualizar a imagem da webcam a cada 10 milissegundos
        self.root.after(10, self.update_frame)

    def update_buttons(self, count):
        for i in range(len(LED_COLORS)):
            if i < count:
                self.buttons[i].config(state=tk.NORMAL)
            else:
                self.buttons[i].config(state=tk.DISABLED)

    def __del__(self):
        self.video_source.release()

if __name__ == "__main__":
    root = tk.Tk()
    app = HandTrackingApp(root)
    root.mainloop()
