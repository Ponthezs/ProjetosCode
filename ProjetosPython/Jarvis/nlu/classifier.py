import os
import numpy as np

model_path = 'model.h5'
labels_path = 'labels.txt'

model = None
labels = []

if os.path.exists(labels_path):
    with open(labels_path, 'r', encoding='utf-8') as f:
        labels = [line.strip() for line in f.read().split('\n') if line.strip()]

idx2label = {k: label for k, label in enumerate(labels)}

if os.path.exists(model_path):
    try:
        from tensorflow.keras.models import load_model
        model = load_model(model_path)
    except Exception as e:
        print("Aviso: Modelo Keras não pôde ser carregado:", e)

def classify(text):
    if not text or not text.strip():
        return 'unknown'

    # Classificação baseada em modelo ou fallback heurístico inteligente
    if model and labels:
        try:
            x = np.zeros((1, 48, 256), dtype='float32')
            encoded = bytes(text.encode('utf-8'))[:48]
            for k, ch in enumerate(encoded):
                x[0, k, int(ch)] = 1.0

            out = model.predict(x, verbose=0)
            idx = int(out.argmax())
            if idx in idx2label:
                return idx2label[idx]
        except Exception as e:
            print(f"Erro na inferência do NLU: {e}")

    # Fallback por palavra-chave se o modelo Keras falhar ou não estiver treinado
    t = text.lower()
    if 'hora' in t or 'horas' in t:
        return 'time|getTime'
    elif 'data' in t or 'hoje' in t or 'dia' in t:
        return 'time|getDate'
    elif 'tempo' in t or 'clima' in t or 'temperatura' in t:
        return 'weather|getWeather'
    elif 'abrir' in t:
        return 'open|None'

    return 'unknown'