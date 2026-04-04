import httpx
import os
from dotenv import load_dotenv

load_dotenv()

# Free OpenWeatherMap API (mock fallback if no key)
WEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
BASE_URL = "https://api.openweathermap.org/data/2.5/weather"

async def get_weather_data(city: str = "Mumbai") -> dict:
    """
    Fetch real-time weather for a city.
    Falls back to mock data if no API key is available (for hackathon demo).
    """
    if not WEATHER_API_KEY:
        return _mock_weather(city)

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(BASE_URL, params={
                "q": city,
                "appid": WEATHER_API_KEY,
                "units": "metric"
            }, timeout=5.0)
            data = response.json()
            if response.status_code == 200:
                return {
                    "city": city,
                    "temp": data["main"]["temp"],
                    "rainfall": data.get("rain", {}).get("1h", 0),
                    "weather": data["weather"][0]["main"],
                    "description": data["weather"][0]["description"],
                    "humidity": data["main"]["humidity"],
                    "wind_speed": data["wind"]["speed"],
                    "is_disruption": _is_disruption(data)
                }
    except Exception:
        pass

    return _mock_weather(city)


def _is_disruption(data: dict) -> bool:
    """Determine if weather event qualifies as an income disruption."""
    weather_main = data.get("weather", [{}])[0].get("main", "").lower()
    rainfall = data.get("rain", {}).get("1h", 0)
    wind = data.get("wind", {}).get("speed", 0)
    temp = data["main"]["temp"]

    disruptions = ["thunderstorm", "squall", "tornado", "hurricane"]
    if any(d in weather_main for d in disruptions):
        return True
    if rainfall > 20:  # Heavy rain > 20mm/hr
        return True
    if wind > 15:  # Strong winds > 15 m/s
        return True
    if temp > 42 or temp < 5:  # Extreme heat or cold
        return True
    return False


def _mock_weather(city: str) -> dict:
    """Mock weather data for demo/testing when no API key is set."""
    import random
    scenarios = [
        {"temp": 28, "rainfall": 5, "weather": "Clear", "description": "clear sky", "is_disruption": False},
        {"temp": 34, "rainfall": 95, "weather": "Rain", "description": "heavy rain", "is_disruption": True},
        {"temp": 41, "rainfall": 0, "weather": "Clear", "description": "extremely hot", "is_disruption": True},
        {"temp": 29, "rainfall": 0, "weather": "Haze", "description": "hazy (high pollution)", "is_disruption": False},
    ]
    scenario = random.choice(scenarios)
    return {
        "city": city,
        "humidity": 75,
        "wind_speed": 5.2,
        **scenario
    }
