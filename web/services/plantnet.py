import requests
import os

PLANTNET_KEY = os.getenv("PLANTNET_API_KEY")
PLANTNET_URL = "https://my-api.plantnet.org/v2/identify/all"


def identify_plant(image_path: str) -> list:
    """Call PlantNet API to identify a plant from an image."""
    if not PLANTNET_KEY:
        raise ValueError("PLANTNET_API_KEY not set in environment.")

    with open(image_path, "rb") as f:
        files = [("images", (os.path.basename(image_path), f, "image/jpeg"))]
        params = {"api-key": PLANTNET_KEY, "nb-results": 3}
        response = requests.post(PLANTNET_URL, files=files, params=params, timeout=15)
        response.raise_for_status()
        data = response.json()

    results = []
    for r in data.get("results", [])[:3]:
        species = r.get("species", {})
        common_names = species.get("commonNames", [])
        family = species.get("family", {})
        results.append(
            {
                "common_name": common_names[0] if common_names else "Unknown",
                "scientific_name": species.get("scientificNameWithoutAuthor", ""),
                "family": family.get("scientificNameWithoutAuthor", ""),
                "confidence": round(r.get("score", 0) * 100, 1),
            }
        )
    return results
