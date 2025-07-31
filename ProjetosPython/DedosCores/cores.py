import cv2
import mediapipe as mp
import tkinter as tk
from tkinter import ttk
from PIL import Image, ImageTk
import numpy as np

class HandTrackingApp:
    WINDOW_WIDTH = 800
    WINDOW_HEIGHT = 650
    VIDEO_WIDTH = 640
    VIDEO_HEIGHT = 480
    LED_COLORS = ['red', 'green', 'blue', 'yellow', 'purple']
    FINGER_TIPS_IDS = [8, 12, 16, 20]
    THUMB_TIP_ID = 4

    def __init__(self, root):
        self.root = root
        self.root.title("Hand Tracking Control")
        self.root.geometry(f"{self.WINDOW_WIDTH}x{self.WINDOW_HEIGHT}")
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)

        self.setup_mediapipe()
        self.setup_camera()
        self.setup_ui()

        self.update_frame()

    def setup_mediapipe(self):
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            min_detection_confidence=0.7, min_tracking_confidence=0.5
        )
        self.mp_drawing = mp.solutions.drawing_utils

    def setup_camera(self):
        self.cap = cv2.VideoCapture(0)
        if not self.cap.isOpened():
            print("Error: Cannot open camera.")
            self.root.destroy()
            return
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.VIDEO_WIDTH)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.VIDEO_HEIGHT)

    def setup_ui(self):
        self.canvas = tk.Canvas(self.root, width=self.VIDEO_WIDTH, height=self.VIDEO_HEIGHT)
        self.canvas.pack(pady=20)

        controls_frame = ttk.Frame(self.root)
        controls_frame.pack(pady=10)

        self.buttons = []
        for i, color in enumerate(self.LED_COLORS):
            button = tk.Button(
                controls_frame,
                text=f"LED {i+1}",
                bg=color,
                fg="white",
                width=12,
                height=2,
                state=tk.DISABLED,
                font=("Helvetica", 10, "bold")
            )
            button.pack(side=tk.LEFT, padx=10, pady=5)
            self.buttons.append(button)

    def count_raised_fingers(self, hand_landmarks, handedness):
        count = 0
        landmarks = hand_landmarks.landmark

        if (handedness == "Right" and landmarks[self.THUMB_TIP_ID].x < landmarks[self.THUMB_TIP_ID - 1].x) or \
           (handedness == "Left" and landmarks[self.THUMB_TIP_ID].x > landmarks[self.THUMB_TIP_ID - 1].x):
            count += 1

        for tip_id in self.FINGER_TIPS_IDS:
            if landmarks[tip_id].y < landmarks[tip_id - 2].y:
                count += 1

        return count

    def process_hand_tracking(self, frame):
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        frame_rgb.flags.writeable = False
        results = self.hands.process(frame_rgb)
        frame.flags.writeable = True

        finger_count = 0
        if results.multi_hand_landmarks:
            for hand_landmarks, hand_info in zip(results.multi_hand_landmarks, results.multi_handedness):
                self.mp_drawing.draw_landmarks(
                    frame, hand_landmarks, self.mp_hands.HAND_CONNECTIONS
                )
                handedness = hand_info.classification[0].label
                finger_count = self.count_raised_fingers(hand_landmarks, handedness)
        
        self.update_led_buttons(finger_count)
        return frame

    def update_led_buttons(self, count):
        for i, button in enumerate(self.buttons):
            if i < count:
                button.config(state=tk.NORMAL)
            else:
                button.config(state=tk.DISABLED)

    def update_frame(self):
        success, frame = self.cap.read()
        if not success:
            self.root.after(10, self.update_frame)
            return

        frame = cv2.flip(frame, 1)
        processed_frame = self.process_hand_tracking(frame)
        
        img = Image.fromarray(cv2.cvtColor(processed_frame, cv2.COLOR_BGR2RGB))
        imgtk = ImageTk.PhotoImage(image=img)
        self.canvas.imgtk = imgtk
        self.canvas.create_image(0, 0, image=imgtk, anchor=tk.NW)

        self.root.after(10, self.update_frame)

    def on_closing(self):
        if self.cap.isOpened():
            self.cap.release()
        self.hands.close()
        self.root.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    app = HandTrackingApp(root)
    root.mainloop()