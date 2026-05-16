import requests
import os

PERENUAL_KEY = os.getenv("PERENUAL_API_KEY")
PERENUAL_BASE = "https://perenual.com/api/v2"


def get_toxicity(scientific_name: str) -> dict:
    """Fetch toxicity info from Perenual API."""
    if not PERENUAL_KEY or not scientific_name:
        return {"poisonous_to_humans": False, "poisonous_to_pets": False}

    url = f"{PERENUAL_BASE}/species-list"
    params = {"q": scientific_name, "key": PERENUAL_KEY}
    try:
        res = requests.get(url, params=params, timeout=10)
        res.raise_for_status()
        data = res.json()
        if not data.get("data"):
            return {"poisonous_to_humans": False, "poisonous_to_pets": False}

        plant = data["data"][0]
        return {
            "poisonous_to_humans": plant.get("poisonous_to_humans", 0) == 1,
            "poisonous_to_pets": plant.get("poisonous_to_pets", 0) == 1,
        }
    except Exception:
        return {"poisonous_to_humans": False, "poisonous_to_pets": False}
