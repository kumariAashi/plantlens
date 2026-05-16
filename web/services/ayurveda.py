import json
import os

_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "ayurveda_plants.json")
AYURVEDA_DB = {}

if os.path.exists(_DATA_PATH):
    with open(_DATA_PATH, "r", encoding="utf-8") as f:
        AYURVEDA_DB = json.load(f)


def get_ayurvedic_info(scientific_name: str) -> dict:
    """Look up Ayurvedic info for a plant by scientific name."""
    if not scientific_name:
        return {}

    # Direct match
    if scientific_name in AYURVEDA_DB:
        return AYURVEDA_DB[scientific_name]

    # Partial match (genus level)
    genus = scientific_name.split()[0]
    for key, val in AYURVEDA_DB.items():
        if key.startswith(genus):
            return val

    return {}
