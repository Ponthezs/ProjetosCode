import requests
import urllib.parse

class WeatherService:
    def __init__(self, default_city="Maringá"):
        self.default_city = default_city

    def get_weather(self, city=None):
        target_city = city if city and city.strip() else self.default_city
        target_city_clean = target_city.strip().title()

        try:
            # Codifica o nome da cidade para URL segura (ex: Maringá, São Paulo)
            city_encoded = urllib.parse.quote(target_city_clean)
            url = f"https://wttr.in/{city_encoded}?format=j1"
            
            headers = {'User-Agent': 'Mozilla/5.0'}
            response = requests.get(url, headers=headers, timeout=4)
            
            if response.status_code == 200:
                data = response.json()
                current = data['current_condition'][0]
                temp = current['temp_C']
                humidity = current['humidity']
                wind = current['windspeedKmph']
                feels_like = current['FeelsLikeC']
                
                # Obtém a descrição do clima em PT se disponível
                desc = "Ensolarado"
                if 'lang_pt' in current and current['lang_pt']:
                    desc = current['lang_pt'][0]['value']
                elif 'weatherDesc' in current and current['weatherDesc']:
                    desc = current['weatherDesc'][0]['value']

                return {
                    "temp": f"{temp}°C",
                    "city": target_city_clean,
                    "desc": desc,
                    "humidity": f"{humidity}%",
                    "wind": f"{wind} km/h",
                    "feels_like": f"{feels_like}°C"
                }
        except Exception as e:
            print(f"Aviso ao consultar clima de '{target_city_clean}': {e}")

        # Fallback se estiver offline ou falhar a requisição
        return {
            "temp": "24°C",
            "city": target_city_clean,
            "desc": "Parcialmente Nublado",
            "humidity": "60%",
            "wind": "14 km/h",
            "feels_like": "25°C"
        }
